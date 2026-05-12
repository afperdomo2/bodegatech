package com.afperdomo.bodegatech.module.inventory.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Detalle completo de un registro de inventario")
public class InventoryDto {

    @Schema(description = "ID único del registro de inventario", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Fecha de creación", example = "2025-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización", example = "2025-01-16T08:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Versión del registro para optimistic locking", example = "0")
    private Long version;

    private ProductInfo product;

    private WarehouseInfo warehouse;

    @Schema(description = "Cantidad total en stock", example = "150.0000")
    private BigDecimal quantity;

    @Schema(description = "Cantidad reservada para pedidos", example = "25.0000")
    private BigDecimal reservedQuantity;

    @Schema(description = "Cantidad disponible = quantity - reservedQuantity", example = "125.0000")
    private BigDecimal availableQuantity;

    @Schema(description = "Fecha del último movimiento de inventario", example = "2025-03-10T14:30:00")
    private LocalDateTime lastMovementAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        @Schema(description = "ID del producto", example = "123e4567-e89b-12d3-a456-426614174001")
        private UUID id;

        @Schema(description = "Nombre del producto", example = "Cable USB-C 2m")
        private String name;

        @Schema(description = "SKU del producto", example = "USB-C-2M")
        private String sku;

        @Schema(description = "Precio de venta", example = "25.9900")
        private BigDecimal salePrice;

        @Schema(description = "Precio de costo", example = "12.5000")
        private BigDecimal costPrice;

        @Schema(description = "Stock mínimo", example = "20.0000")
        private BigDecimal minStock;

        @Schema(description = "Stock máximo", example = "500.0000")
        private BigDecimal maxStock;

        @Schema(description = "URL pública de la imagen principal del producto")
        private String mainImageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseInfo {
        @Schema(description = "ID de la bodega", example = "123e4567-e89b-12d3-a456-426614174002")
        private UUID id;

        @Schema(description = "Nombre de la bodega", example = "Bodega Principal")
        private String name;

        @Schema(description = "Código de la bodega", example = "BOD-01")
        private String code;

        @Schema(description = "Ubicación de la bodega", example = "Calle 10 #5-20, Bogotá")
        private String location;

        @Schema(description = "Descripción de la bodega", example = "Bodega principal de almacenamiento")
        private String description;
    }
}