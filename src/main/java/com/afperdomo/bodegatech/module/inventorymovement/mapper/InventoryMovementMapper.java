package com.afperdomo.bodegatech.module.inventorymovement.mapper;

import com.afperdomo.bodegatech.config.AwsProperties;
import com.afperdomo.bodegatech.module.inventorymovement.dto.response.InventoryMovementDto;
import com.afperdomo.bodegatech.module.inventorymovement.dto.response.InventoryMovementSummaryDto;
import com.afperdomo.bodegatech.module.inventorymovement.dto.response.MovementDetailDto;
import com.afperdomo.bodegatech.module.inventorymovement.entity.InventoryMovement;
import com.afperdomo.bodegatech.module.inventorymovement.entity.MovementDetail;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class InventoryMovementMapper {

    @Autowired
    protected AwsProperties awsProperties;

    public abstract InventoryMovementDto toDto(InventoryMovement movement);

    public InventoryMovementSummaryDto toSummaryDto(InventoryMovement movement) {
        if (movement == null) {
            return null;
        }
        var warehouse = movement.getWarehouse();
        var supplier = movement.getSupplier();
        int detailCount = movement.getDetails() != null ? movement.getDetails().size() : 0;

        return InventoryMovementSummaryDto.builder()
                .id(movement.getId())
                .type(movement.getType().name())
                .warehouseName(warehouse != null ? warehouse.getName() : null)
                .warehouseCode(warehouse != null ? warehouse.getCode() : null)
                .supplierName(supplier != null ? supplier.getName() : null)
                .referenceDocument(movement.getReferenceDocument())
                .detailCount(detailCount)
                .createdAt(movement.getCreatedAt())
                .build();
    }

    public List<MovementDetailDto> toDetailDtoList(List<MovementDetail> details) {
        if (details == null) {
            return null;
        }
        return details.stream().map(this::toDetailDto).toList();
    }

    public MovementDetailDto toDetailDto(MovementDetail detail) {
        if (detail == null) {
            return null;
        }
        var product = detail.getProduct();
        return MovementDetailDto.builder()
                .id(detail.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .productSku(product != null ? product.getSku() : null)
                .quantity(detail.getQuantity())
                .previousStock(detail.getPreviousStock())
                .currentStock(detail.getCurrentStock())
                .createdAt(detail.getCreatedAt())
                .mainImageUrl(product != null ? mapMainImageUrl(product.getMainImageKey()) : null)
                .build();
    }

    protected String mapMainImageUrl(String mainImageKey) {
        if (mainImageKey == null) {
            return null;
        }
        return awsProperties.getS3().getPublicUrl() + "/" + mainImageKey;
    }

    public static InventoryMovementDto.WarehouseInfo warehouseInfo(com.afperdomo.bodegatech.module.warehouse.entity.Warehouse w) {
        if (w == null) return null;
        return InventoryMovementDto.WarehouseInfo.builder()
                .id(w.getId())
                .name(w.getName())
                .code(w.getCode())
                .build();
    }

    public static InventoryMovementDto.SupplierInfo supplierInfo(com.afperdomo.bodegatech.module.supplier.entity.Supplier s) {
        if (s == null) return null;
        return InventoryMovementDto.SupplierInfo.builder()
                .id(s.getId())
                .name(s.getName())
                .build();
    }
}