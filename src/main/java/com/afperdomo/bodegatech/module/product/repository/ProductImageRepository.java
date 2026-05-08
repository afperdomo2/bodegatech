package com.afperdomo.bodegatech.module.product.repository;

import com.afperdomo.bodegatech.module.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    List<ProductImage> findByProductIdOrderByCreatedAtAsc(UUID productId);

    boolean existsByProductIdAndFileKey(UUID productId, String fileKey);

    Optional<ProductImage> findByIdAndProductId(UUID imageId, UUID productId);

    /**
     * Establece isMain=false para todas las imágenes del producto excepto la especificada.
     * Usado al cambiar la imagen principal para asegurar solo una imagen sea marcada como principal.
     */
    @Modifying
    @Transactional
    @Query("UPDATE ProductImage pi SET pi.isMain = false " +
           "WHERE pi.product.id = :productId AND pi.id != :imageId")
    void setAllImagesNotMain(@Param("productId") UUID productId, @Param("imageId") UUID imageId);
}
