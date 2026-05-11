package com.afperdomo.bodegatech.module.inventorymovement.entity;

import com.afperdomo.bodegatech.common.audit.BaseEntity;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.supplier.entity.Supplier;
import com.afperdomo.bodegatech.module.warehouse.entity.Warehouse;
import jakarta.persistence.*;
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
@Table(name = "inventory_movements", indexes = {
        @Index(name = "idx_inventory_movements_warehouse_id", columnList = "warehouse_id"),
        @Index(name = "idx_inventory_movements_supplier_id", columnList = "supplier_id")
})
@EqualsAndHashCode(callSuper = true)
public class InventoryMovement extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovementType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", foreignKey = @ForeignKey(foreignKeyDefinition = "FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL"))
    private Supplier supplier;

    @Column(length = 100)
    private String referenceDocument;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @OneToMany(mappedBy = "movement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MovementDetail> details = new ArrayList<>();

    public void addDetail(MovementDetail detail) {
        details.add(detail);
        detail.setMovement(this);
    }

    public void removeDetail(MovementDetail detail) {
        details.remove(detail);
        detail.setMovement(null);
    }
}