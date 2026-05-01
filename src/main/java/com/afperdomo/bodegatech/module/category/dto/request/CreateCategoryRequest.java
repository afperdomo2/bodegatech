package com.afperdomo.bodegatech.module.category.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear una nueva categoría.
 * Utilizado en solicitudes POST /categories.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para crear una nueva categoría")
public class CreateCategoryRequest {

    @NotNull(message = "El nombre de la categoría es obligatorio")
    @Schema(description = "Nombre de la categoría", example = "Electrónica")
    private String name;

    @Schema(description = "Descripción de la categoría (opcional)", example = "Productos electrónicos y computadoras")
    private String description;
}
