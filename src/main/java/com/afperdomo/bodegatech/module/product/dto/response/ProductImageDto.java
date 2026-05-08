package com.afperdomo.bodegatech.module.product.dto.response;

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
@Schema(description = "Información de una imagen de producto")
public class ProductImageDto {

    @Schema(description = "ID único de la imagen", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "URL pública de la imagen original", example = "https://bodegatech-uploads.s3.amazonaws.com/products/123e4567-e89b-12d3-a456-426614174000/img-uuid-original.jpg")
    private String url;

    @Schema(description = "URL pública de la imagen en versión thumbnail (si existe)")
    private String thumbnailUrl;

    @Schema(description = "URL pública de la imagen en versión medium (si existe)")
    private String mediumUrl;

    @Schema(description = "Indica si esta es la imagen principal del producto", example = "true")
    private Boolean isMain;

    @Schema(description = "Fecha de creación de la imagen")
    private LocalDateTime createdAt;
}
