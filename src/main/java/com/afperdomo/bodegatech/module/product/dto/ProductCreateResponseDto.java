package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO de respuesta para la creación de un producto.
 * Contiene el ID y SKU del producto creado, junto con las URLs pre-firmadas
 * para que el cliente suba las imágenes a S3.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Respuesta de creación de producto con URLs pre-firmadas para imágenes")
public class ProductCreateResponseDto {

    @Schema(description = "ID único del producto creado", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "SKU generado automáticamente", example = "LAPTOP-DELL-001")
    private String sku;

    @Schema(description = "Lista de URLs pre-firmadas para carga de imágenes")
    private List<ImageUploadUrlDto> uploadUrls;
}
