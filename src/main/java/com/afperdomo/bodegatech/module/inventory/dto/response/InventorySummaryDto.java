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
@Schema(description = "Resumen de inventario por producto-bodega (para listados paginados)")
public class InventorySummaryDto {

    @Schema(description = "ID único del registro de inventario", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "ID del producto", example = "123e4567-e89b-12d3-a456-426614174001")
    private UUID productId;

    @Schema(description = "Nombre del producto", example = "Cable USB-C 2m")
    private String productName;

    @Schema(description = "SKU del producto", example = "USB-C-2M")
    private String productSku;

    @Schema(description = "ID de la bodega", example = "123e4567-e89b-12d3-a456-426614174002")
    private UUID warehouseId;

    @Schema(description = "Nombre de la bodega", example = "Bodega Principal")
    private String warehouseName;

    @Schema(description = "Código de la bodega", example = "BOD-01")
    private String warehouseCode;

    @Schema(description = "Cantidad disponible en stock", example = "150.0000")
    private BigDecimal quantity;

    @Schema(description = "Cantidad reservada para pedidos", example = "25.0000")
    private BigDecimal reservedQuantity;

    @Schema(description = "Cantidad disponible para venta = quantity - reservedQuantity", example = "125.0000")
    private BigDecimal availableQuantity;

    @Schema(description = "Stock mínimo del producto", example = "20.0000")
    private BigDecimal minStock;

    @Schema(description = "URL pública de la imagen principal del producto")
    private String mainImageUrl;

    @Schema(description = "Indica si el stock está bajo (quantity <= minStock)", example = "false")
    private Boolean isLowStock;

    @Schema(description = "Fecha y hora del último movimiento de inventario", example = "2025-03-10T14:30:00")
    private LocalDateTime lastMovementAt;

    @Schema(description = "Fecha de creación del registro", example = "2025-01-15T10:30:00")
    private LocalDateTime createdAt;
}