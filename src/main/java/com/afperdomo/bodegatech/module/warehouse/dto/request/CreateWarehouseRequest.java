package com.afperdomo.bodegatech.module.warehouse.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para crear una nueva bodega")
public class CreateWarehouseRequest {

    @NotBlank(message = "El nombre de la bodega es obligatorio")
    @Schema(description = "Nombre de la bodega", example = "Bodega Principal Norte")
    private String name;

    @NotBlank(message = "El código de la bodega es obligatorio")
    @Schema(description = "Código único de la bodega", example = "BDG-001")
    private String code;

    @Schema(description = "Ubicación física (opcional)", example = "Planta 1, Ala Norte, Puerta 3", nullable = true)
    private String location;

    @NotBlank(message = "La descripción es obligatoria")
    @Schema(description = "Descripción de la bodega", example = "Bodega principal para almacenamiento de productos secos y no perecederos")
    private String description;
}
