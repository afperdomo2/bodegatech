package com.afperdomo.bodegatech.module.supplier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para actualizar parcialmente un proveedor. Solo los campos enviados se modifican.")
public class UpdateSupplierRequest {

    @Schema(description = "Nombre del proveedor (opcional)", example = "Distribuidora Alimentos del Valle S.A.S", nullable = true)
    private String name;

    @Schema(description = "NIT del proveedor (sin dígito verificador) (opcional)", example = "900123456-7", nullable = true)
    private String nit;

    @Schema(description = "Nombre del contacto principal (opcional)", example = "Carlos Andrés Morales", nullable = true)
    private String contactName;

    @Email(message = "El email debe ser válido")
    @Schema(description = "Email de contacto (opcional)", example = "cmorales@distvalles.com", nullable = true)
    private String email;

    @Schema(description = "Teléfono de contacto (opcional)", example = "+57 312 456 7890", nullable = true)
    private String phone;

    @Schema(description = "Dirección física del proveedor (opcional)", example = "Cra 15 #80-45, Bogotá, Colombia", nullable = true)
    private String address;

    @Schema(description = "Estado activo del proveedor (opcional)", example = "true", nullable = true)
    private Boolean isActive;
}
