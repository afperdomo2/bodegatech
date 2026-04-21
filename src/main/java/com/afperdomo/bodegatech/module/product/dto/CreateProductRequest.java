package com.afperdomo.bodegatech.module.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para crear un nuevo producto.
 * Utilizado en solicitudes POST /products.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para crear un nuevo producto")
public class CreateProductRequest {

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Schema(description = "Nombre del producto", example = "Laptop Dell")
    private String name;

    @Schema(description = "Descripción del producto", example = "Laptop de 15 pulgadas con procesador Intel i7")
    private String description;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    @Schema(description = "Precio del producto", example = "1500.00")
    private BigDecimal price;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    @Schema(description = "Cantidad inicial en stock", example = "10")
    private Integer stock;

    @NotBlank(message = "El SKU es obligatorio")
    @Schema(description = "Código único del producto (SKU). No puede modificarse después de creado.", example = "DELL-LAPTOP-001")
    private String sku;

    @Schema(description = "Categoría del producto", example = "Electrónica")
    private String category;

    @Schema(description = "URL de la imagen del producto", example = "https://example.com/images/laptop.jpg")
    private String imageUrl;
}
