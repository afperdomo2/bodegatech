package com.afperdomo.bodegatech.module.product.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO para crear un nuevo producto.
 * Utilizado en solicitudes POST /products.
 *
 * <p>El SKU se genera automáticamente por el sistema basado en el nombre y categoría.
 * No es necesario (ni permitido) enviarlo en el request.
 *
 * <p>Stock se inicializa automáticamente en 0.0000 y se gestiona únicamente vía
 * Movimientos de Inventario. No puede especificarse en la creación.
 *
 * <p>Las imágenes se manejan en endpoints separados:
 * POST /products/{id}/images/presigned — obtener URLs pre-firmadas
 * POST /products/{id}/images/confirm — confirmar imágenes subidas
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para crear un nuevo producto")
public class CreateProductRequest {

    @NotNull(message = "El nombre del producto es obligatorio")
    @Schema(description = "Nombre del producto", example = "Laptop Dell")
    private String name;

    @Schema(description = "Descripción del producto", example = "Laptop de 15 pulgadas con procesador Intel i7")
    private String description;

    @NotNull(message = "El precio de venta es obligatorio")
    @Positive(message = "El precio de venta debe ser mayor a 0")
    @Schema(description = "Precio de venta del producto", example = "1500.0000")
    private BigDecimal salePrice;

    @Min(value = 0, message = "El costo no puede ser negativo")
    @Schema(description = "Costo del producto (opcional, default 0.0000)", example = "800.0000", nullable = true)
    private BigDecimal costPrice;

    @Min(value = 0, message = "Stock mínimo no puede ser negativo")
    @Schema(description = "Stock mínimo recomendado (opcional, default 0.0000)", example = "10.0000", nullable = true)
    private BigDecimal minStock;

    @Min(value = 0, message = "Stock máximo no puede ser negativo")
    @Schema(description = "Stock máximo permitido (opcional)", example = "500.0000", nullable = true)
    private BigDecimal maxStock;

    @NotNull(message = "La categoría es obligatoria")
    @Schema(description = "ID de la categoría del producto", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID categoryId;

    @NotNull(message = "La unidad de medida es obligatoria")
    @Schema(description = "ID de la unidad de medida base para este producto", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID unitId;

    @Schema(description = "ID del proveedor principal (opcional)", example = "550e8400-e29b-41d4-a716-446655440001", nullable = true)
    private UUID supplierId;

    @Schema(description = "Código de barras (opcional, máx 100 caracteres)", example = "7501234567890", nullable = true)
    private String barcode;
}
