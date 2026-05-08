package com.afperdomo.bodegatech.module.product.entity;

import com.afperdomo.bodegatech.common.audit.BaseEntity;
import com.afperdomo.bodegatech.module.category.entity.Category;
import com.afperdomo.bodegatech.module.supplier.entity.Supplier;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_is_active", columnList = "is_active"),
        @Index(name = "idx_products_category_id", columnList = "category_id"),
        @Index(name = "idx_products_unit_id", columnList = "unit_id"),
        @Index(name = "idx_products_supplier_id", columnList = "supplier_id")
})
@EqualsAndHashCode(callSuper = true)
public class Product extends BaseEntity {

    @NotBlank
    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal salePrice;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal costPrice;

    @Min(0)
    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal minStock = BigDecimal.ZERO;

    @Min(0)
    @Column(precision = 19, scale = 4)
    private BigDecimal maxStock;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private MeasurementUnit unit;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "supplier_id", foreignKey = @ForeignKey(foreignKeyDefinition = "FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL"))
    private Supplier supplier;

    @Column(columnDefinition = "TEXT")
    private String mainImageKey;

    @Column(unique = true, length = 100)
    private String barcode;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();
}
