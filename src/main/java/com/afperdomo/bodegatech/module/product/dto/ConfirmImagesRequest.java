package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para confirmar que las imágenes fueron subidas exitosamente a S3.
 * El cliente envía los fileKeys de los archivos que subió,
 * y el servidor registra esas imágenes en la base de datos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Confirmación de imágenes subidas a S3")
public class ConfirmImagesRequest {

    @NotEmpty(message = "La lista de claves de archivo no puede estar vacía")
    @Schema(description = "Lista de claves (fileKeys) de archivos subidos a S3", example = "[\"products/123e4567-e89b-12d3-a456-426614174000/foto1.jpg\", \"products/123e4567-e89b-12d3-a456-426614174000/foto2.png\"]")
    private List<@NotBlank(message = "La clave del archivo no puede estar en blanco") String> fileKeys;
}
