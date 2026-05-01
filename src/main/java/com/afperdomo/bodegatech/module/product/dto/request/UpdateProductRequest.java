package com.afperdomo.bodegatech.module.product.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO para actualizar parcialmente un producto existente.
 * Utilizado en solicitudes PATCH /products/{id}.
 *
 * <p>Todos los campos son opcionales: solo los campos presentes en el cuerpo de la
 * solicitud serán modificados. Los campos ausentes (null) se ignoran y conservan
 * su valor actual en la base de datos.
 *
 * <p>El SKU es inmutable y no puede modificarse después de la creación.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para actualizar parcialmente un producto existente. Solo los campos enviados se modifican.")
public class UpdateProductRequest {

    @Size(min = 1, message = "El nombre no puede estar vacío si se proporciona")
    @Schema(description = "Nombre del producto (opcional)", example = "Laptop Dell Pro", nullable = true)
    private String name;

    @Schema(description = "Descripción del producto (opcional)", example = "Laptop de 15 pulgadas con procesador Intel i9", nullable = true)
    private String description;

    @Positive(message = "El precio debe ser mayor a 0")
    @Schema(description = "Precio del producto (opcional)", example = "1800.00", nullable = true)
    private BigDecimal price;

    @Min(value = 0, message = "El stock no puede ser negativo")
    @Schema(description = "Cantidad disponible en stock (opcional)", example = "5", nullable = true)
    private Integer stock;

    @Schema(description = "ID de la categoría del producto (opcional)", example = "123e4567-e89b-12d3-a456-426614174000", nullable = true)
    private UUID categoryId;
}
