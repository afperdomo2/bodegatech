package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitar la carga de una imagen en un producto.
 * Se utiliza en el request de creación de producto y en el endpoint de carga de imágenes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud de carga de imagen")
public class ImageUploadRequest {

    @NotBlank(message = "El nombre del archivo es obligatorio")
    @Schema(description = "Nombre original del archivo", example = "foto_frontal.jpg")
    private String fileName;

    @NotBlank(message = "El tipo de contenido es obligatorio")
    @Schema(description = "Tipo MIME del archivo", example = "image/jpeg")
    private String contentType;
}
