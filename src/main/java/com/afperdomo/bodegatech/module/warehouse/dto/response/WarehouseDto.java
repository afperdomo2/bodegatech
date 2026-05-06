package com.afperdomo.bodegatech.module.warehouse.dto.response;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "code", "location", "description", "isActive", "createdAt", "updatedAt"})
public class WarehouseDto {

    @Schema(description = "ID único de la bodega", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Nombre de la bodega", example = "Bodega Principal")
    private String name;

    @Schema(description = "Código único de la bodega", example = "BDG-001")
    private String code;

    @Schema(description = "Ubicación de la bodega", example = "Planta Baja, Ala Oeste")
    private String location;

    @Schema(description = "Descripción de la bodega", example = "Bodega principal de almacenamiento de productos")
    private String description;

    @Schema(description = "Indica si la bodega está activa", example = "true")
    private Boolean isActive;

    @Schema(description = "Fecha de creación", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización", example = "2024-01-20T14:22:00")
    private LocalDateTime updatedAt;
}
