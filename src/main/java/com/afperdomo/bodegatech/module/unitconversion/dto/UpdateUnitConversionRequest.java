package com.afperdomo.bodegatech.module.unitconversion.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para actualizar parcialmente un factor de conversión de unidades.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para actualizar un factor de conversión (todos los campos son opcionales)")
public class UpdateUnitConversionRequest {

    @Positive
    @DecimalMin("0.0000000001")
    @Schema(description = "Factor de conversión (debe ser positivo, opcional)", example = "1000.0")
    private BigDecimal factor;
}
