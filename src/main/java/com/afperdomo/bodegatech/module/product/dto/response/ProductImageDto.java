package com.afperdomo.bodegatech.module.product.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO para representar una imagen de producto en respuestas de API.
 * Incluye la URL pública y la clave de S3 de la imagen.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Información de una imagen de producto")
public class ProductImageDto {

    @Schema(description = "ID único de la imagen", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Clave (key) de la imagen en S3", example = "products/123e4567-e89b-12d3-a456-426614174000/foto1.jpg")
    private String fileKey;

    @Schema(description = "URL pública de la imagen", example = "https://bodegatech-uploads.s3.amazonaws.com/products/123e4567-e89b-12d3-a456-426614174000/foto1.jpg")
    private String url;

    @Schema(description = "Fecha de creación de la imagen")
    private LocalDateTime createdAt;
}
