package com.afperdomo.bodegatech.module.category.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO de respuesta resumida para una categoría.
 * Utilizado en listados paginados (GET /api/categories).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resumen de datos de una categoría (para listados)")
public class CategorySummaryDto {

    @Schema(description = "ID único de la categoría", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Nombre de la categoría", example = "Electrónica")
    private String name;

    @Schema(description = "Descripción de la categoría", example = "Productos electrónicos y computadoras")
    private String description;

    @Schema(description = "Indica si la categoría está activa", example = "true")
    private Boolean isActive;
}
