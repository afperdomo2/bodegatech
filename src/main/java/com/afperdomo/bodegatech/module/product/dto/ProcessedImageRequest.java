package com.afperdomo.bodegatech.module.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO para el callback de Lambda al backend.
 * Contiene los fileKeys de las variantes procesadas por Sharp.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedImageRequest {

    @NotBlank(message = "thumbnailKey es requerido")
    private String thumbnailKey;

    @NotBlank(message = "mediumKey es requerido")
    private String mediumKey;
}
