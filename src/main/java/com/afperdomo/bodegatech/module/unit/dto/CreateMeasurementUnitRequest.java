package com.afperdomo.bodegatech.module.unit.dto;

import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
}
