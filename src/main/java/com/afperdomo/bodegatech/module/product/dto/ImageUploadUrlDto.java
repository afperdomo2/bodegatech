package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta de URL pre-firmada de S3.
 * Contiene las instrucciones necesarias para que el cliente suba la imagen a S3.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "URL pre-firmada de S3 para carga de imagen")
public class ImageUploadUrlDto {

    @Schema(description = "Nombre original del archivo", example = "foto_frontal.jpg")
    private String fileName;

    @Schema(description = "URL pre-firmada de S3 para hacer PUT (método: PUT)", example = "https://bodegatech-uploads.s3.amazonaws.com/...")
    private String uploadUrl;

    @Schema(description = "URL pública final donde quedará la imagen después de cargar", example = "https://bodegatech-uploads.s3.amazonaws.com/...")
    private String publicUrl;
}
