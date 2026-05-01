package com.afperdomo.bodegatech.module.unit.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Unidad de medida derivada (para tabla de conversiones)")
public class MeasurementUnitRelatedDto {

    @Schema(description = "ID único de la unidad", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Nombre de la unidad", example = "Gramo")
    private String name;

    @Schema(description = "Abreviación de la unidad", example = "g")
    private String abbreviation;

    @Schema(description = "Factor de conversión respecto a la unidad base", example = "0.0010000000")
    private BigDecimal conversionFactor;
}
