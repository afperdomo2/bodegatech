package com.afperdomo.bodegatech.module.inventorymovement.dto.response;

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
@Schema(description = "Detalle de producto en un movimiento")
public class MovementDetailDto {

    @Schema(description = "ID del detalle", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "ID del producto", example = "123e4567-e89b-12d3-a456-426614174001")
    private UUID productId;

    @Schema(description = "Nombre del producto", example = "Cable USB-C 2m")
    private String productName;

    @Schema(description = "SKU del producto", example = "USB-C-2M")
    private String productSku;

    @Schema(description = "Cantidad movimentada", example = "50.0000")
    private BigDecimal quantity;

    @Schema(description = "Stock antes del movimiento", example = "100.0000")
    private BigDecimal previousStock;

    @Schema(description = "Stock después del movimiento", example = "150.0000")
    private BigDecimal currentStock;

    @Schema(description = "Fecha de creación del detalle", example = "2025-03-10T14:30:00")
    private LocalDateTime createdAt;
}