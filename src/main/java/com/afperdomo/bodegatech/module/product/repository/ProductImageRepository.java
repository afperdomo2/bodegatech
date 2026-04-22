package com.afperdomo.bodegatech.module.product.repository;

import com.afperdomo.bodegatech.module.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio para la entidad ProductImage.
 * Proporciona operaciones de persistencia para imágenes de productos.
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    /**
     * Encuentra todas las imágenes asociadas a un producto, ordenadas por fecha de creación ascendente.
     *
     * @param productId ID del producto
     * @return Lista de imágenes ordenadas por fecha de creación
     */
    List<ProductImage> findByProductIdOrderByCreatedAtAsc(UUID productId);

    /**
     * Verifica si existe una imagen con un fileKey específico en un producto.
     *
     * @param productId ID del producto
     * @param fileKey Clave de archivo en S3
     * @return true si existe, false de lo contrario
     */
    boolean existsByProductIdAndFileKey(UUID productId, String fileKey);

    /**
     * Encuentra una imagen específica por su ID y verifica que pertenece al producto.
     *
     * @param imageId ID de la imagen
     * @param productId ID del producto
     * @return Optional con la imagen si existe y pertenece al producto
     */
    Optional<ProductImage> findByIdAndProductId(UUID imageId, UUID productId);
}
