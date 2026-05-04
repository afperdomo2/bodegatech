package com.afperdomo.bodegatech.module.product.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO de respuesta completa para un producto.
 * Utilizado al obtener el detalle de un producto (GET /api/products/{id}).
 * Incluye la lista de imágenes del producto, timestamps, versión para optimistic locking,
 * y TODOS los campos incluyendo información sensible como costPrice.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos completos de un producto con auditoría e imágenes")
public class ProductDetail {

    @Schema(description = "ID único del producto", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Nombre del producto", example = "Laptop Dell")
    private String name;

    @Schema(description = "Descripción del producto", example = "Laptop de 15 pulgadas con procesador Intel i7")
    private String description;

    @Schema(description = "Precio de venta del producto", example = "1500.0000")
    private BigDecimal salePrice;

    @Schema(description = "Costo del producto (información sensible)", example = "800.0000")
    private BigDecimal costPrice;

    @Schema(description = "Stock actual del producto", example = "25.0000")
    private BigDecimal stock;

    @Schema(description = "Stock mínimo recomendado", example = "10.0000")
    private BigDecimal minStock;

    @Schema(description = "Stock máximo permitido", example = "500.0000")
    private BigDecimal maxStock;

    @Schema(
            description = "Código único del producto (SKU) — generado automáticamente por el sistema",
            example = "LAP-ELE-4F2A",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private String sku;

    @Schema(description = "ID de la categoría del producto", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID categoryId;

    @Schema(description = "Nombre de la categoría del producto", example = "Electrónica")
    private String categoryName;

    @Schema(description = "ID de la unidad de medida base", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID unitId;

    @Schema(description = "Nombre de la unidad de medida", example = "Kilogramo")
    private String unitName;

    @Schema(description = "Abreviación de la unidad de medida", example = "kg")
    private String unitAbbreviation;

    @Schema(description = "Código de barras del producto (opcional)", example = "7501234567890")
    private String barcode;

    @Schema(description = "URL de la imagen principal (opcional)", example = "https://s3.amazonaws.com/products/laptop-dell-main.jpg")
    private String mainImageUrl;

    @Schema(description = "Indica si el producto está activo", example = "true")
    private Boolean isActive;

    @Schema(description = "Fecha de creación del producto", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización del producto", example = "2024-01-15T10:30:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Versión del registro para optimistic locking", example = "0")
    private Long version;

    @Schema(description = "Lista de imágenes asociadas al producto")
    private List<ProductImageDto> images;
}
