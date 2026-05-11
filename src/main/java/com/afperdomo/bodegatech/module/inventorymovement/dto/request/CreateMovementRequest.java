package com.afperdomo.bodegatech.module.inventorymovement.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request para crear un movimiento de inventario")
public class CreateMovementRequest {

    @NotNull(message = "El tipo de movimiento es obligatorio")
    @Schema(description = "Tipo de movimiento", example = "PURCHASE_ENTRY")
    private String type;

    @NotNull(message = "La bodega es obligatoria")
    @Schema(description = "ID de la bodega", example = "123e4567-e89b-12d3-a456-426614174002")
    private UUID warehouseId;

    @Schema(description = "ID del proveedor (opcional, para entradas por compra)", example = "123e4567-e89b-12d3-a456-426614174003")
    private UUID supplierId;

    @Size(max = 100, message = "El documento de referencia no puede exceder 100 caracteres")
    @Schema(description = "Número de documento de referencia (factura, remisión, etc.)", example = "FAC-00123")
    private String referenceDocument;

    @Schema(description = "Observaciones adicionales", example = "Entrada de mercancía según factura FAC-00123")
    private String observations;

    @NotEmpty(message = "Debe incluir al menos un detalle")
    @Valid
    @Schema(description = "Lista de detalles del movimiento")
    private List<MovementDetailRequest> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Detalle de producto en el movimiento")
    public static class MovementDetailRequest {

        @NotNull(message = "El producto es obligatorio")
        @Schema(description = "ID del producto", example = "123e4567-e89b-12d3-a456-426614174001")
        private UUID productId;

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a cero")
        @Schema(description = "Cantidad del producto", example = "50.0000")
        private java.math.BigDecimal quantity;
    }
}