package com.afperdomo.bodegatech.module.unitconversion.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO para crear un nuevo factor de conversión de unidades.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para crear un factor de conversión")
public class CreateUnitConversionRequest {

    @NotNull
    @Schema(description = "ID de la unidad origen", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID fromUnitId;

    @NotNull
    @Schema(description = "ID de la unidad destino", example = "223e4567-e89b-12d3-a456-426614174000")
    private UUID toUnitId;

    @NotNull
    @Positive
    @DecimalMin("0.0000000001")
    @Schema(description = "Factor de conversión (debe ser positivo)", example = "1000.0")
    private BigDecimal factor;
}
