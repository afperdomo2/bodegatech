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
 * DTO para solicitar URLs pre-firmadas de S3 para carga de imágenes.
 * El cliente proporciona los nombres de archivos que desea subir,
 * y el servidor devuelve las URLs pre-firmadas.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud de URLs pre-firmadas para carga de imágenes")
public class PresignedUrlRequest {

    @NotEmpty(message = "La lista de nombres de archivo no puede estar vacía")
    @Schema(description = "Lista de nombres de archivo a subir", example = "[\"foto1.jpg\", \"foto2.png\"]")
    private List<@NotBlank(message = "El nombre del archivo no puede estar en blanco") String> fileNames;
}
