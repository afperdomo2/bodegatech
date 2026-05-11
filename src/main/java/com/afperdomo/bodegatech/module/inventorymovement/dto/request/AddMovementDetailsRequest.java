package com.afperdomo.bodegatech.module.inventorymovement.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request para agregar detalles a un movimiento existente")
public class AddMovementDetailsRequest {

    @NotEmpty(message = "Debe incluir al menos un detalle")
    @Valid
    @Schema(description = "Lista de detalles a agregar al movimiento")
    private List<MovementDetailItem> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Detalle de producto a agregar")
    public static class MovementDetailItem {

        @NotNull(message = "El producto es obligatorio")
        @Schema(description = "ID del producto", example = "123e4567-e89b-12d3-a456-426614174001")
        private UUID productId;

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a cero")
        @Schema(description = "Cantidad del producto", example = "10.0000")
        private BigDecimal quantity;
    }
}