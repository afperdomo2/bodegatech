package com.afperdomo.bodegatech.module.category.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO de respuesta básica para una categoría.
 * Utilizado en POST y PATCH responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos básicos de una categoría")
public class CategoryDto {

    @Schema(description = "ID único de la categoría", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Nombre de la categoría", example = "Electrónica")
    private String name;

    @Schema(description = "Descripción de la categoría", example = "Productos electrónicos y computadoras")
    private String description;

    @Schema(description = "Indica si la categoría está activa", example = "true")
    private Boolean isActive;
}
