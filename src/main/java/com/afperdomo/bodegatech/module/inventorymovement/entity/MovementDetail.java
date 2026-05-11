package com.afperdomo.bodegatech.module.inventorymovement.entity;

import com.afperdomo.bodegatech.common.audit.BaseEntity;
import com.afperdomo.bodegatech.module.product.entity.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movement_details", indexes = {
        @Index(name = "idx_movement_details_movement_id", columnList = "movement_id"),
        @Index(name = "idx_movement_details_product_id", columnList = "product_id")
})
@EqualsAndHashCode(callSuper = true)
public class MovementDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movement_id", nullable = false)
    private InventoryMovement movement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(name = "previous_stock", nullable = false, precision = 19, scale = 4)
    private BigDecimal previousStock;

    @Column(name = "current_stock", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentStock;
}