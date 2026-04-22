package com.afperdomo.bodegatech.module.category.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO de resumen para una categoría.
 * Utilizado como objeto embebido en ProductDto para evitar serializar todos los campos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resumen de datos de una categoría (embebido en producto)")
public class CategorySummaryDto {

    @Schema(description = "ID único de la categoría", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Nombre de la categoría", example = "Electrónica")
    private String name;
}
