package com.afperdomo.bodegatech.module.category.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar parcialmente una categoría existente.
 * Utilizado en solicitudes PATCH /categories/{id}.
 *
 * <p>Todos los campos son opcionales: solo los campos presentes en el cuerpo de la
 * solicitud serán modificados. Los campos ausentes (null) se ignoran y conservan
 * su valor actual en la base de datos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para actualizar parcialmente una categoría existente. Solo los campos enviados se modifican.")
public class UpdateCategoryRequest {

    @Size(min = 1, message = "El nombre no puede estar vacío si se proporciona")
    @Schema(description = "Nombre de la categoría (opcional)", example = "Electrónica", nullable = true)
    private String name;

    @Schema(description = "Descripción de la categoría (opcional)", example = "Productos electrónicos y accesorios", nullable = true)
    private String description;

    @Schema(description = "Indicador de estado (opcional)", example = "true", nullable = true)
    private Boolean isActive;
}
