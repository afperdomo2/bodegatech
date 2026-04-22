package com.afperdomo.bodegatech.module.product.service;

import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.util.S3PresignedUrlGenerator;
import com.afperdomo.bodegatech.module.product.dto.ImageUploadRequest;
import com.afperdomo.bodegatech.module.product.dto.ImageUploadUrlDto;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.entity.ProductImage;
import com.afperdomo.bodegatech.module.product.repository.ProductImageRepository;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Agrega imágenes a un producto existente.
     * Genera URLs pre-firmadas de S3 y crea registros en la BD en una sola transacción.
     *
     * @param productId ID del producto
     * @param imageRequests Lista de solicitudes de carga de imagen
     * @return Lista de URLs pre-firmadas para que el cliente suba las imágenes
     */
    public List<ImageUploadUrlDto> addImagesToProduct(UUID productId, List<ImageUploadRequest> imageRequests) {
        log.info("Agregando {} imágenes al producto {}", imageRequests.size(), productId);

        // Validar que el producto existe
        Product product = productRepository.findByIdActive(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        // Generar URLs pre-firmadas y crear registros ProductImage
        return imageRequests.stream()
                .map(request -> {
                    // Generar URL pre-firmada
                    ImageUploadUrlDto uploadUrl = s3PresignedUrlGenerator.generateUploadUrl(
                            productId,
                            request.getFileName()
                    );

                    // Crear y guardar registro ProductImage con la URL pública
                    ProductImage productImage = ProductImage.builder()
                            .imageUrl(uploadUrl.getPublicUrl())
                            .product(product)
                            .build();

                    productImageRepository.save(productImage);
                    log.debug("Imagen guardada para producto {}: {}", productId, uploadUrl.getFileName());

                    return uploadUrl;
                })
                .collect(Collectors.toList());
    }

    /**
     * Elimina una imagen de un producto.
     * Elimina el registro en la BD. La eliminación en S3 queda pendiente para integración futura.
     *
     * @param productId ID del producto propietario de la imagen
     * @param imageId ID de la imagen a eliminar
     */
    public void deleteImage(UUID productId, UUID imageId) {
        log.info("Eliminando imagen {} del producto {}", imageId, productId);

        ProductImage productImage = productImageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen de producto", imageId));

        productImageRepository.delete(productImage);

        log.info("Imagen {} eliminada de la BD. ", imageId);
        log.warn("TODO: Eliminar imagen de AWS S3. URL/Key: {}", productImage.getImageUrl());
    }

    /**
     * Obtiene todas las imágenes de un producto.
     *
     * @param productId ID del producto
     * @return Lista de ProductImage ordenadas por fecha de creación descendente
     */
    @Transactional(readOnly = true)
    public List<ProductImage> getImagesByProductId(UUID productId) {
        log.debug("Obteniendo imágenes del producto {}", productId);

        // Validar que el producto existe
        productRepository.findByIdActive(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        return productImageRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }
}
