package com.afperdomo.bodegatech.module.unit.dto;

import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar parcialmente una unidad de medida.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para actualizar una unidad de medida (todos los campos son opcionales)")
public class UpdateMeasurementUnitRequest {

    @Size(min = 1, max = 100)
    @Schema(description = "Nombre de la unidad (opcional)", example = "Kilogramo")
    private String name;

    @Size(min = 1, max = 20)
    @Schema(description = "Abreviación de la unidad (opcional)", example = "kg")
    private String abbreviation;

    @Schema(description = "Tipo de unidad (opcional)", example = "MASS")
    private UnitType type;
}
