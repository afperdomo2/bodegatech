package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta con URLs pre-firmadas de S3 para carga de imágenes.
 * El cliente usará uploadUrl para hacer PUT con el binario del archivo.
 * El fileKey se devuelve para que el cliente lo use luego en confirmación.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "URL pre-firmada de S3 para carga de imagen")
public class PresignedUrlDto {

    @Schema(description = "Nombre original del archivo", example = "foto1.jpg")
    private String fileName;

    @Schema(description = "Clave del archivo en S3 (para confirmar luego)", example = "products/123e4567-e89b-12d3-a456-426614174000/foto1.jpg")
    private String fileKey;

    @Schema(description = "URL pre-firmada temporal para hacer PUT (válida 15 minutos)", example = "https://bucket.s3.amazonaws.com/...?X-Amz-Signature=...")
    private String uploadUrl;
}
