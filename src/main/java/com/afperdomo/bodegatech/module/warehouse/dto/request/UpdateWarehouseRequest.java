package com.afperdomo.bodegatech.module.warehouse.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para actualizar parcialmente una bodega. Solo los campos enviados se modifican.")
public class UpdateWarehouseRequest {

    @Schema(description = "Nombre de la bodega (opcional)", example = "Bodega Principal Norte", nullable = true)
    private String name;

    @Schema(description = "Código único de la bodega (opcional)", example = "BDG-001", nullable = true)
    private String code;

    @Schema(description = "Ubicación física (opcional)", example = "Planta 1, Ala Norte, Puerta 3", nullable = true)
    private String location;

    @Schema(description = "Descripción de la bodega (opcional)", example = "Bodega principal para almacenamiento de productos secos y no perecederos", nullable = true)
    private String description;

    @Schema(description = "Estado activo de la bodega (opcional)", example = "true", nullable = true)
    private Boolean isActive;
}
