package com.afperdomo.bodegatech.module.unit.dto.response;

import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta resumida para una unidad de medida.
 * Utilizado en listados paginados (GET /api/units).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Unidad de medida (resumen para listados)")
public class MeasurementUnitSummaryDto {

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

    @Schema(description = "Indica si esta es la unidad base (más pequeña) del tipo")
    private boolean isBaseUnit;

    @Schema(description = "ID de la unidad base a la que convierte (null si es unidad base)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID baseUnitId;

    @Schema(description = "Nombre de la unidad base", example = "Gramo")
    private String baseUnitName;

    @Schema(description = "Factor de conversión respecto a la unidad base (null si es unidad base)", example = "1000.0000000000")
    private BigDecimal conversionFactor;

    @Schema(description = "Fecha de creación (ISO-8601)", example = "2025-01-15T10:30:00")
    private LocalDateTime createdAt;
}
