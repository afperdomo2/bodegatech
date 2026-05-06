package com.afperdomo.bodegatech.module.supplier.dto.response;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "nit", "contactName", "email", "phone", "address", "isActive", "createdAt", "updatedAt"})
public class SupplierDto {

    @Schema(description = "ID único del proveedor", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Nombre del proveedor", example = "Proveedor ABC")
    private String name;

    @Schema(description = "NIT del proveedor", example = "123456789")
    private String nit;

    @Schema(description = "Nombre del contacto", example = "Juan Pérez")
    private String contactName;

    @Schema(description = "Email del contacto", example = "juan@ejemplo.com")
    private String email;

    @Schema(description = "Teléfono de contacto", example = "+57 1 234 5678")
    private String phone;

    @Schema(description = "Dirección del proveedor", example = "Calle 1 #23-45")
    private String address;

    @Schema(description = "Indica si el proveedor está activo", example = "true")
    private Boolean isActive;

    @Schema(description = "Fecha de creación", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Fecha de última actualización", example = "2024-01-20T14:22:00")
    private LocalDateTime updatedAt;
}
