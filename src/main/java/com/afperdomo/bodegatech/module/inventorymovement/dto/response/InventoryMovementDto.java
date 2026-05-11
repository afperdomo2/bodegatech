package com.afperdomo.bodegatech.module.inventorymovement.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Respuesta completa de un movimiento de inventario")
public class InventoryMovementDto {

    @Schema(description = "ID único del movimiento", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Tipo de movimiento", example = "PURCHASE_ENTRY")
    private String type;

    @Schema(description = "Fecha de creación", example = "2025-03-10T14:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización", example = "2025-03-10T14:30:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Versión del registro para optimistic locking", example = "0")
    private Long version;

    private WarehouseInfo warehouse;

    private SupplierInfo supplier;

    @Schema(description = "Documento de referencia", example = "FAC-00123")
    private String referenceDocument;

    @Schema(description = "Observaciones del movimiento", example = "Entrada de mercancía según factura FAC-00123")
    private String observations;

    @Schema(description = "Cantidad total de productos en el movimiento", example = "3")
    private int detailCount;

    @Schema(description = "Detalles del movimiento")
    private List<MovementDetailDto> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseInfo {
        private UUID id;
        private String name;
        private String code;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierInfo {
        private UUID id;
        private String name;
    }
}