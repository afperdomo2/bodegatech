package com.afperdomo.bodegatech.module.unitconversion.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta para un factor de conversión de unidades.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Factor de conversión entre dos unidades")
public class UnitConversionDto {

    @Schema(description = "ID único de la conversión", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "ID de la unidad origen")
    private UUID fromUnitId;

    @Schema(description = "Nombre de la unidad origen", example = "Kilogramo")
    private String fromUnitName;

    @Schema(description = "Abreviación de la unidad origen", example = "kg")
    private String fromUnitAbbreviation;

    @Schema(description = "ID de la unidad destino")
    private UUID toUnitId;

    @Schema(description = "Nombre de la unidad destino", example = "Gramo")
    private String toUnitName;

    @Schema(description = "Abreviación de la unidad destino", example = "g")
    private String toUnitAbbreviation;

    @Schema(description = "Factor de conversión (multiplica la cantidad de la unidad origen para obtener la unidad destino)", example = "1000.0")
    private BigDecimal factor;

    @Schema(description = "Fecha de creación")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización")
    private LocalDateTime updatedAt;

    @Schema(description = "Versión para control de concurrencia optimista")
    private Long version;
}
