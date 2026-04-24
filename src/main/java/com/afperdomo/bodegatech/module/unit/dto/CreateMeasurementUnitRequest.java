package com.afperdomo.bodegatech.module.unit.dto;

import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear una nueva unidad de medida.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para crear una unidad de medida")
public class CreateMeasurementUnitRequest {

    @NotBlank
    @Size(min = 1, max = 100)
    @Schema(description = "Nombre de la unidad", example = "Kilogramo")
    private String name;

    @NotBlank
    @Size(min = 1, max = 20)
    @Schema(description = "Abreviación de la unidad", example = "kg")
    private String abbreviation;

    @NotNull
    @Schema(description = "Tipo de unidad", example = "MASS")
    private UnitType type;

    @NotNull
    @Schema(description = "Indica si esta es la unidad base (más pequeña) del tipo", example = "true")
    private Boolean isBaseUnit;

    @Schema(
        description = "ID de la unidad base a la que convierte. Requerido si isBaseUnit = false",
        example = "123e4567-e89b-12d3-a456-426614174000"
    )
    private UUID baseUnitId;

    @Positive
    @DecimalMin("0.0000000001")
    @Schema(
        description = "Factor de conversión respecto a la unidad base. Requerido si isBaseUnit = false",
        example = "1000.0000000000"
    )
    private BigDecimal conversionFactor;
}
