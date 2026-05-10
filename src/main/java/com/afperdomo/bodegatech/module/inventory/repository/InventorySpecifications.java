package com.afperdomo.bodegatech.module.inventory.repository;

import com.afperdomo.bodegatech.module.inventory.entity.Inventory;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class InventorySpecifications {

    public static Specification<Inventory> hasWarehouseId(UUID warehouseId) {
        return (root, query, criteriaBuilder) -> {
            if (warehouseId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("warehouse").get("id"), warehouseId);
        };
    }

    public static Specification<Inventory> hasProductId(UUID productId) {
        return (root, query, criteriaBuilder) -> {
            if (productId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("product").get("id"), productId);
        };
    }

    public static Specification<Inventory> hasLowStock() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(root.get("quantity"), root.get("product").get("minStock"));
    }
}