package com.afperdomo.bodegatech.module.inventorymovement.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resumen de movimiento de inventario (para listados)")
public class InventoryMovementSummaryDto {

    @Schema(description = "ID único del movimiento", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Tipo de movimiento", example = "PURCHASE_ENTRY")
    private String type;

    @Schema(description = "Nombre de la bodega", example = "Bodega Principal")
    private String warehouseName;

    @Schema(description = "Código de la bodega", example = "BOD-01")
    private String warehouseCode;

    @Schema(description = "Nombre del proveedor", example = "Distribuidora XYZ")
    private String supplierName;

    @Schema(description = "Documento de referencia", example = "FAC-00123")
    private String referenceDocument;

    @Schema(description = "Cantidad de productos en el movimiento", example = "3")
    private int detailCount;

    @Schema(description = "Fecha de creación", example = "2025-03-10T14:30:00")
    private LocalDateTime createdAt;
}