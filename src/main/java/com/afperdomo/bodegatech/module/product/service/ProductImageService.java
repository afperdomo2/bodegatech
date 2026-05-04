package com.afperdomo.bodegatech.module.product.service;

import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.util.S3PresignedUrlGenerator;
import com.afperdomo.bodegatech.config.AwsProperties;
import com.afperdomo.bodegatech.module.product.dto.PresignedUrlDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductImageDto;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.entity.ProductImage;
import com.afperdomo.bodegatech.module.product.repository.ProductImageRepository;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.util.List;
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
     *
     * @param productId ID del producto
     * @param fileKeys Lista de fileKeys que el cliente confirma haber subido
     * @return Lista de ProductImageDto registradas en la BD
     */
    public List<ProductImageDto> confirmImages(UUID productId, List<String> fileKeys) {
        log.info("Confirmando {} imágenes para producto {}", fileKeys.size(), productId);

        // Validar que el producto existe
        Product product = productRepository.findByIdActive(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        // Crear y guardar registros ProductImage para cada fileKey confirmado
        return fileKeys.stream()
                .map(fileKey -> {
                    // Verificar que no haya duplicado
                    if (productImageRepository.existsByProductIdAndFileKey(productId, fileKey)) {
                        log.warn("FileKey {} ya existe para producto {}, omitiendo", fileKey, productId);
                        return null;
                    }

                    // Construir URL pública a partir del fileKey
                    String publicUrl = constructPublicUrl(fileKey);

                    // Crear y guardar ProductImage
                    ProductImage productImage = ProductImage.builder()
                            .product(product)
                            .fileKey(fileKey)
                            .url(publicUrl)
                            .build();

                    ProductImage saved = productImageRepository.save(productImage);
                    log.debug("Imagen confirmada para producto {}: fileKey={}", productId, fileKey);

                    return toProductImageDto(saved);
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    /**
     * Elimina una imagen de un producto.
     * Elimina el objeto de S3 y el registro de la BD.
     *
     * @param productId ID del producto propietario de la imagen
     * @param imageId ID de la imagen a eliminar
     */
    public void deleteImage(UUID productId, UUID imageId) {
        log.info("Eliminando imagen {} del producto {}", imageId, productId);

        ProductImage productImage = productImageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen de producto", imageId));

        // Eliminar objeto de S3
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(awsProperties.getS3().getBucketName())
                    .key(productImage.getFileKey())
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.debug("Objeto eliminado de S3. FileKey: {}", productImage.getFileKey());
        } catch (Exception e) {
            log.warn("Error al eliminar objeto de S3. FileKey: {}. Error: {}", productImage.getFileKey(), e.getMessage());
        }

        // Eliminar registro de la BD
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
     * Helper privado para convertir ProductImage a ProductImageDto.
     *
     * @param productImage Entidad ProductImage
     * @return DTO con id, fileKey, url, createdAt
     */
    private ProductImageDto toProductImageDto(ProductImage productImage) {
        return ProductImageDto.builder()
                .id(productImage.getId())
                .fileKey(productImage.getFileKey())
                .url(productImage.getUrl())
                .createdAt(productImage.getCreatedAt())
                .build();
    }
}
