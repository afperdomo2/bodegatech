package com.afperdomo.bodegatech.module.product.service;

import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.util.S3PresignedUrlGenerator;
import com.afperdomo.bodegatech.config.AwsProperties;
import com.afperdomo.bodegatech.module.product.dto.ConfirmImageItem;
import com.afperdomo.bodegatech.module.product.dto.ConfirmImagesRequest;
import com.afperdomo.bodegatech.module.product.dto.PresignedUrlDto;
import com.afperdomo.bodegatech.module.product.dto.ProcessedImageRequest;
import com.afperdomo.bodegatech.module.product.dto.response.ProductImageDto;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.entity.ProductImage;
import com.afperdomo.bodegatech.module.product.entity.ImageStatus;
import com.afperdomo.bodegatech.module.product.repository.ProductImageRepository;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final S3PresignedUrlGenerator s3PresignedUrlGenerator;
    private final S3Client s3Client;
    private final AwsProperties awsProperties;

    /**
     * Genera URLs pre-firmadas para que el cliente suba imágenes directamente a S3.
     * No crea registros en la BD hasta que el cliente confirme la carga.
     *
     * @param productId ID del producto
     * @param fileNames Lista de nombres de archivo a subir
     * @return Lista de URLs pre-firmadas con fileKey y uploadUrl
     */
    public List<PresignedUrlDto> generatePresignedUrls(UUID productId, List<String> fileNames) {
        log.info("Generando {} URLs pre-firmadas para producto {}", fileNames.size(), productId);

        // Validar que el producto existe
        productRepository.findByIdActive(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        return fileNames.stream()
                .map(fileName -> s3PresignedUrlGenerator.generatePresignedUrl(productId, fileName))
                .collect(Collectors.toList());
    }

    /**
     * Confirma que el cliente ha subido las imágenes a S3 y las registra en la BD.
     * Ahora recibe un ConfirmImagesRequest con items que incluyen imageId e fileKey.
     *
     * @param productId ID del producto
     * @param request DTO con lista de items (fileKey + imageId) a confirmar
     * @return Lista de ProductImageDto registradas en la BD
     */
    public List<ProductImageDto> confirmImages(UUID productId, ConfirmImagesRequest request) {
        log.info("Confirmando {} imágenes para producto {}", request.getItems().size(), productId);

        // Validar que el producto existe
        Product product = productRepository.findByIdActive(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        // Crear y guardar registros ProductImage para cada item confirmado
        return request.getItems().stream()
                .map(item -> {
                    String fileKey = item.getFileKey();
                    UUID imageId = item.getImageId();

                    // Verificar que no haya duplicado
                    if (productImageRepository.existsByProductIdAndFileKey(productId, fileKey)) {
                        log.warn("FileKey {} ya existe para producto {}, omitiendo", fileKey, productId);
                        return null;
                    }

                    // Crear y guardar ProductImage usando el imageId recibido del cliente
                    // Sin almacenar la URL, solo el fileKey
                    ProductImage productImage = ProductImage.builder()
                            .id(imageId)  // Usar el imageId generado en el presigned
                            .product(product)
                            .fileKey(fileKey)
                            .build();

                    ProductImage saved = productImageRepository.save(productImage);
                    log.debug("Imagen confirmada para producto {}: imageId={}, fileKey={}", productId, imageId, fileKey);

                    return toProductImageDto(saved);
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

     public void setMainImage(UUID productId, UUID imageId) {
         log.info("Estableciendo imagen {} como principal del producto {}", imageId, productId);

         ProductImage productImage = productImageRepository.findByIdAndProductId(imageId, productId)
                 .orElseThrow(() -> new ResourceNotFoundException("Imagen de producto", imageId));

         productImageRepository.setAllImagesNotMain(productId, imageId);

         productImage.setIsMain(true);
         productImageRepository.save(productImage);

         Product product = productImage.getProduct();
         product.setMainImageKey(productImage.getFileKey());
         productRepository.save(product);

         log.info("Imagen {} establecida como principal del producto {}", imageId, productId);
     }

    /**
     * Elimina todos los objetos de S3 belonging a un producto usando el prefijo products/{productId}/.
     * Usa listObjectsV2 + deleteObjects en batch (S3 soporta hasta 1000 por request).
     *
     * @param productId ID del producto cuyas imágenes se eliminarán de S3
     */
    public void deleteAllImagesFromS3(UUID productId) {
        String prefix = "products/" + productId + "/";
        log.info("Eliminando todos los objetos de S3 con prefijo: {}", prefix);

        try {
            List<String> keysToDelete = new ArrayList<>();
            String continuationToken = null;

            do {
                ListObjectsV2Request.Builder listBuilder = ListObjectsV2Request.builder()
                        .bucket(awsProperties.getS3().getBucketName())
                        .prefix(prefix);
                if (continuationToken != null) {
                    listBuilder.continuationToken(continuationToken);
                }

                ListObjectsV2Response response = s3Client.listObjectsV2(listBuilder.build());
                response.contents().stream()
                        .map(S3Object::key)
                        .forEach(keysToDelete::add);
                continuationToken = response.isTruncated() ? response.nextContinuationToken() : null;
            } while (continuationToken != null);

            if (keysToDelete.isEmpty()) {
                log.debug("No se encontraron objetos en S3 con prefijo {}", prefix);
                return;
            }

            List<software.amazon.awssdk.services.s3.model.ObjectIdentifier> objectIds = keysToDelete.stream()
                    .map(key -> software.amazon.awssdk.services.s3.model.ObjectIdentifier.builder().key(key).build())
                    .collect(Collectors.toList());

            DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
                    .bucket(awsProperties.getS3().getBucketName())
                    .delete(Delete.builder().objects(objectIds).build())
                    .build();

            s3Client.deleteObjects(deleteRequest);
            log.info("Eliminados {} objetos de S3 con prefijo {}", keysToDelete.size(), prefix);
        } catch (Exception e) {
            log.warn("Error al eliminar objetos de S3 con prefijo {}. Error: {}", prefix, e.getMessage());
        }
    }

    /**
     * Helper privado para eliminar múltiples keys de S3 en una sola llamada batch.
     *
     * @param keys Lista de keys a eliminar (valores no-nulos se incluyen)
     */
    private void deleteKeysFromS3(String... keys) {
        List<software.amazon.awssdk.services.s3.model.ObjectIdentifier> objectIds = new ArrayList<>();
        for (String key : keys) {
            if (key != null && !key.isBlank()) {
                objectIds.add(software.amazon.awssdk.services.s3.model.ObjectIdentifier.builder().key(key).build());
            }
        }
        if (objectIds.isEmpty()) {
            return;
        }

        try {
            DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
                    .bucket(awsProperties.getS3().getBucketName())
                    .delete(Delete.builder().objects(objectIds).build())
                    .build();
            s3Client.deleteObjects(deleteRequest);
            log.debug("Eliminados {} objetos de S3 en batch", objectIds.size());
        } catch (Exception e) {
            log.warn("Error al eliminar objetos de S3 en batch. Error: {}", e.getMessage());
        }
    }

    /**
     * Elimina una imagen de un producto.
     * Elimina el objeto de S3 y el registro de la BD.
     * Si la imagen es la principal, limpia mainImageKey en el producto.
     *
     * @param productId ID del producto propietario de la imagen
     * @param imageId ID de la imagen a eliminar
     */
    public void deleteImage(UUID productId, UUID imageId) {
        log.info("Eliminando imagen {} del producto {}", imageId, productId);

        ProductImage productImage = productImageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen de producto", imageId));

        Product product = productImage.getProduct();

        if (product.getMainImageKey() != null && product.getMainImageKey().equals(productImage.getFileKey())) {
            product.setMainImageKey(null);
            productRepository.save(product);
            log.info("Imagen principal del producto {} limpiada", productId);
        }

        deleteKeysFromS3(
                productImage.getFileKey(),
                productImage.getThumbnailKey(),
                productImage.getMediumKey()
        );

        productImageRepository.delete(productImage);
        log.info("Imagen {} eliminada de la BD.", imageId);
    }

    /**
     * Helper privado para construir URL pública desde un fileKey.
     * Usa la URL pública configurada de S3/CloudFront.
     *
     * @param fileKey Clave del archivo en S3 (ej: "products/123/uuid_imagen.jpg")
     * @return URL pública del objeto en S3/CloudFront
     */
    private String constructPublicUrl(String fileKey) {
        return awsProperties.getS3().getPublicUrl() + "/" + fileKey;
    }

    /**
     * Obtiene todas las imágenes de un producto.
     *
     * @param productId ID del producto
     * @return Lista de ProductImageDto
     */
    public List<ProductImageDto> getProductImages(UUID productId) {
        log.info("Obteniendo imágenes del producto {}", productId);

        productRepository.findByIdActive(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        return productImageRepository.findByProductIdAndStatusOrderByCreatedAtAsc(productId, ImageStatus.READY).stream()
                .map(this::toProductImageDto)
                .collect(Collectors.toList());
    }

    /**
     * Helper privado para convertir ProductImage a ProductImageDto.
     * Construye las URLs públicas desde los fileKeys.
     */
    private ProductImageDto toProductImageDto(ProductImage productImage) {
        return ProductImageDto.builder()
                .id(productImage.getId())
                .url(constructPublicUrl(productImage.getFileKey()))
                .thumbnailUrl(productImage.getThumbnailKey() != null ?
                        constructPublicUrl(productImage.getThumbnailKey()) : null)
                .mediumUrl(productImage.getMediumKey() != null ?
                        constructPublicUrl(productImage.getMediumKey()) : null)
                .isMain(productImage.getIsMain())
                .createdAt(productImage.getCreatedAt())
                .build();
    }

    /**
     * Marca una imagen como procesada con las variantes generadas por Lambda.
     * Actualiza thumbnailKey, mediumKey y cambia el status a READY.
     *
     * @param imageId ID de la imagen a actualizar
     * @param request DTO con thumbnailKey y mediumKey generados por Sharp
     */
    public void markAsProcessed(UUID imageId, ProcessedImageRequest request) {
        log.info("Marcando imagen {} como procesada", imageId);

        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen de producto", imageId));

        productImage.setThumbnailKey(request.getThumbnailKey());
        productImage.setMediumKey(request.getMediumKey());
        productImage.setStatus(ImageStatus.READY);

        productImageRepository.save(productImage);

        log.info("Imagen {} marcada como READY. thumbnailKey={}, mediumKey={}", imageId, request.getThumbnailKey(), request.getMediumKey());
    }
}

