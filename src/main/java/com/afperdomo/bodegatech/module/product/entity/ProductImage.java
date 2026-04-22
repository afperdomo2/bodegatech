package com.afperdomo.bodegatech.module.product.entity;

import com.afperdomo.bodegatech.common.audit.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entidad ProductImage.
 * Representa una imagen asociada a un producto.
 * Extiende BaseEntity para heredar id, createdAt, updatedAt.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_images", indexes = {
        @Index(name = "idx_product_id", columnList = "product_id"),
        @Index(name = "idx_product_id_created_at", columnList = "product_id, created_at")
})
@EqualsAndHashCode(callSuper = true)
public class ProductImage extends BaseEntity {

    @NotBlank
    @Column(nullable = false, length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
