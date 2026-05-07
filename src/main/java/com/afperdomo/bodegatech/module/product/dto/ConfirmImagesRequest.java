package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para confirmar que las imágenes fueron subidas exitosamente a S3.
 * El cliente envía una lista de items con fileKey e imageId,
 * y el servidor registra esas imágenes en la base de datos usando los IDs generados.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Confirmación de imágenes subidas a S3")
public class ConfirmImagesRequest {

    @NotEmpty(message = "La lista de imágenes no puede estar vacía")
    @Valid
    @Schema(description = "Lista de items (fileKey + imageId) de archivos subidos a S3")
    private List<ConfirmImageItem> items;
}
