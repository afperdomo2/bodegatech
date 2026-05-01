package com.afperdomo.bodegatech.module.category.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta completa para una categoría.
 * Utilizado al obtener el detalle de una categoría (GET /api/categories/{id}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos completos de una categoría con auditoría")
public class CategoryDetail {

    @Schema(description = "ID único de la categoría", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Nombre de la categoría", example = "Electrónica")
    private String name;

    @Schema(description = "Descripción de la categoría", example = "Productos electrónicos y computadoras")
    private String description;

    @Schema(description = "Indica si la categoría está activa", example = "true")
    private Boolean isActive;

    @Schema(description = "Fecha de creación de la categoría", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización de la categoría", example = "2024-01-15T10:30:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Versión del registro para optimistic locking. Enviar de vuelta en PATCH para detectar modificaciones concurrentes.", example = "0")
    private Long version;
}
