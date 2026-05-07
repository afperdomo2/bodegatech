package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para confirmar una imagen subida a S3.
 * Incluye tanto el fileKey como el imageId para garantizar la relación correcta.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Item para confirmar imagen subida a S3")
public class ConfirmImageItem {

    @NotNull(message = "El ID de imagen no puede ser nulo")
    @Schema(description = "ID de la imagen (UUID generado por el backend en el presigned)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID imageId;

    @NotBlank(message = "La clave del archivo no puede estar en blanco")
    @Schema(description = "Clave del archivo en S3", example = "products/550e8400/img-123e4567-e89b-12d3-a456-426614174000-original.jpg")
    private String fileKey;
}
