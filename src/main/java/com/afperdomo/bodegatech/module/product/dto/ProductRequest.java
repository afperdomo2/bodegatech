package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para crear o actualizar un producto.
 * Utilizado en las solicitudes POST y PUT.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para crear o actualizar un producto")
public class ProductRequest {

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Schema(description = "Nombre del producto", example = "Laptop Dell")
    private String name;

    @Schema(description = "Descripción del producto", example = "Laptop de 15 pulgadas con procesador Intel i7")
    private String description;

    @Positive(message = "El precio debe ser mayor a 0")
    @Schema(description = "Precio del producto", example = "1500.00")
    private BigDecimal price;

    @Min(value = 0, message = "El stock no puede ser negativo")
    @Schema(description = "Cantidad disponible en stock", example = "10")
    private Integer stock;

    @NotBlank(message = "El SKU es obligatorio")
    @Schema(description = "Código único del producto (SKU)", example = "DELL-LAPTOP-001")
    private String sku;

    @Schema(description = "Categoría del producto", example = "Electrónica")
    private String category;

    @Schema(description = "URL de la imagen del producto", example = "https://example.com/images/laptop.jpg")
    private String imageUrl;
}
