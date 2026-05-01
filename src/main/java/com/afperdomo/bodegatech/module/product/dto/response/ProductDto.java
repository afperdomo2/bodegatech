package com.afperdomo.bodegatech.module.product.dto.response;

import com.afperdomo.bodegatech.module.category.dto.response.CategorySummaryDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO de respuesta básica para un producto.
 * Utilizado en POST y PATCH responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos básicos de un producto")
public class ProductDto {

    @Schema(description = "ID único del producto", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Nombre del producto", example = "Laptop Dell")
    private String name;

    @Schema(description = "Descripción del producto", example = "Laptop de 15 pulgadas con procesador Intel i7")
    private String description;

    @Schema(description = "Precio del producto", example = "1500.00")
    private BigDecimal price;

    @Schema(description = "Cantidad disponible en stock", example = "10")
    private Integer stock;

    @Schema(
            description = "Código único del producto (SKU) — generado automáticamente por el sistema basado en nombre y categoría",
            example = "LAP-ELE-4F2A",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private String sku;

    @Schema(description = "Categoría del producto (resumen)")
    private CategorySummaryDto category;

    @Schema(description = "Indica si el producto está activo", example = "true")
    private Boolean isActive;
}
