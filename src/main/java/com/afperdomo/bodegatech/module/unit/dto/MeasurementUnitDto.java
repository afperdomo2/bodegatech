package com.afperdomo.bodegatech.module.unit.dto;

import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta para una unidad de medida.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Unidad de medida")
public class MeasurementUnitDto {

    @Schema(description = "ID único de la unidad", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Nombre de la unidad", example = "Kilogramo")
    private String name;

    @Schema(description = "Abreviación de la unidad", example = "kg")
    private String abbreviation;

    @Schema(description = "Tipo de unidad", example = "MASS")
    private UnitType type;

    @Schema(description = "Indica si la unidad está activa")
    private Boolean isActive;

    @Schema(description = "Fecha de creación")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización")
    private LocalDateTime updatedAt;

    @Schema(description = "Versión para control de concurrencia optimista")
    private Long version;
}
