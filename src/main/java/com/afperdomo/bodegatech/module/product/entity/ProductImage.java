package com.afperdomo.bodegatech.module.product.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad ProductImage.
 * Representa una imagen asociada a un producto.
 * 
 * Implementa Persistable<UUID> para permitir asignar el ID manualmente
 * (como imageId del presigned) sin que JPA intente hacer UPDATE.
 * 
 * Schema esperado:
 * CREATE TABLE product_images (
 *     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 *     file_key    TEXT NOT NULL,
 *     url         TEXT NOT NULL,
 *     created_at  TIMESTAMP DEFAULT now()
 * );
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "product_images", indexes = {
        @Index(name = "idx_product_images_product_id", columnList = "product_id"),
        @Index(name = "idx_product_images_product_id_created_at", columnList = "product_id, created_at")
})
public class ProductImage implements Persistable<UUID> {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank
    @Column(name = "file_key", nullable = false, columnDefinition = "TEXT")
    private String fileKey;

    @NotBlank
    @Column(name = "url", nullable = false, columnDefinition = "TEXT")
    private String url;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public UUID getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}
