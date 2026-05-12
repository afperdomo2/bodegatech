package com.afperdomo.bodegatech.module.inventory.mapper;

import com.afperdomo.bodegatech.config.AwsProperties;
import com.afperdomo.bodegatech.module.inventory.dto.response.InventoryDto;
import com.afperdomo.bodegatech.module.inventory.dto.response.InventorySummaryDto;
import com.afperdomo.bodegatech.module.inventory.entity.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class InventoryMapper {

    @Autowired
    protected AwsProperties awsProperties;

    public abstract InventoryDto toDto(Inventory inventory);

    public InventorySummaryDto toSummaryDto(Inventory inventory) {
        if (inventory == null) {
            return null;
        }

        var product = inventory.getProduct();
        var warehouse = inventory.getWarehouse();

        BigDecimal quantity = inventory.getQuantity();
        BigDecimal reserved = inventory.getReservedQuantity();
        BigDecimal available = quantity.subtract(reserved);

        BigDecimal minStock = product != null ? product.getMinStock() : null;
        boolean isLow = minStock != null && quantity.compareTo(minStock) <= 0;

        return InventorySummaryDto.builder()
                .id(inventory.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .productSku(product != null ? product.getSku() : null)
                .warehouseId(warehouse != null ? warehouse.getId() : null)
                .warehouseName(warehouse != null ? warehouse.getName() : null)
                .warehouseCode(warehouse != null ? warehouse.getCode() : null)
                .quantity(quantity)
                .reservedQuantity(reserved)
                .availableQuantity(available)
                .minStock(minStock)
                .isLowStock(isLow)
                .lastMovementAt(inventory.getLastMovementAt())
                .createdAt(inventory.getCreatedAt())
                .mainImageUrl(product != null ? mapMainImageUrl(product.getMainImageKey()) : null)
                .build();
    }

    protected String mapMainImageUrl(String mainImageKey) {
        if (mainImageKey == null) {
            return null;
        }
        return awsProperties.getS3().getPublicUrl() + "/" + mainImageKey;
    }

    public static InventoryDto.ProductInfo productInfo(com.afperdomo.bodegatech.module.product.entity.Product p) {
        if (p == null) return null;
        return InventoryDto.ProductInfo.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .salePrice(p.getSalePrice())
                .costPrice(p.getCostPrice())
                .minStock(p.getMinStock())
                .maxStock(p.getMaxStock())
                .build();
    }

    public static InventoryDto.WarehouseInfo warehouseInfo(com.afperdomo.bodegatech.module.warehouse.entity.Warehouse w) {
        if (w == null) return null;
        return InventoryDto.WarehouseInfo.builder()
                .id(w.getId())
                .name(w.getName())
                .code(w.getCode())
                .location(w.getLocation())
                .description(w.getDescription())
                .build();
    }
}