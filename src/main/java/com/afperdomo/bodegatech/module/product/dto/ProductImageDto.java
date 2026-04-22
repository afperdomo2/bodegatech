package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO para representar una imagen de producto en respuestas de API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Información de una imagen de producto")
public class ProductImageDto {

    @Schema(description = "ID único de la imagen", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "URL de la imagen", example = "https://bodegatech-uploads.s3.amazonaws.com/...")
    private String imageUrl;

    @Schema(description = "Fecha de creación de la imagen")
    private LocalDateTime createdAt;
}
