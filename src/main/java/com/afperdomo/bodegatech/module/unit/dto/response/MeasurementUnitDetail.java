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
 * DTO de respuesta completa para una unidad de medida.
 * Utilizado al obtener el detalle de una unidad (GET /api/units/{id}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Unidad de medida (detalle completo)")
public class MeasurementUnitDetail {

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

    @Schema(description = "Fecha de creación")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización")
    private LocalDateTime updatedAt;

    @Schema(description = "Versión para control de concurrencia optimista")
    private Long version;
}
