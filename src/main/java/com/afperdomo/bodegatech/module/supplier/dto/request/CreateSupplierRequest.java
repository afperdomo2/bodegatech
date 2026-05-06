package com.afperdomo.bodegatech.module.supplier.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para crear un nuevo proveedor")
public class CreateSupplierRequest {

    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Schema(description = "Nombre del proveedor", example = "Distribuidora Alimentos del Valle S.A.S")
    private String name;

    @NotBlank(message = "El NIT es obligatorio")
    @Schema(description = "NIT del proveedor (sin dígito verificador)", example = "900123456-7")
    private String nit;

    @NotBlank(message = "El nombre del contacto es obligatorio")
    @Schema(description = "Nombre del contacto principal", example = "Carlos Andrés Morales")
    private String contactName;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe ser válido")
    @Schema(description = "Email de contacto", example = "cmorales@distvalles.com")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Schema(description = "Teléfono de contacto", example = "+57 312 456 7890")
    private String phone;

    @NotBlank(message = "La dirección es obligatoria")
    @Schema(description = "Dirección física del proveedor", example = "Cra 15 #80-45, Bogotá, Colombia")
    private String address;
}
