package com.afperdomo.bodegatech.module.unit.dto.request;

import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;
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

    @Schema(
        description = "Indica si esta es la unidad base (opcional). No se puede cambiar una vez creada la unidad.",
        example = "true"
    )
    private Boolean isBaseUnit;

    @Schema(
        description = "ID de la unidad base a la que convierte (opcional). No se puede cambiar una vez creada la unidad.",
        example = "123e4567-e89b-12d3-a456-426614174000"
    )
    private UUID baseUnitId;

    @Positive
    @DecimalMin("0.0000000001")
    @Schema(
        description = "Factor de conversión respecto a la unidad base (opcional). Estos campos se pueden actualizar.",
        example = "1000.0000000000"
    )
    private BigDecimal conversionFactor;
}
