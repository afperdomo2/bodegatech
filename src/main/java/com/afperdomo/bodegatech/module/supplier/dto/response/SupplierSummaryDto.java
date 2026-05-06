package com.afperdomo.bodegatech.module.supplier.dto.response;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "nit"})
public class SupplierSummaryDto {

    @Schema(description = "ID único del proveedor", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Nombre del proveedor", example = "Proveedor ABC")
    private String name;

    @Schema(description = "NIT del proveedor", example = "123456789")
    private String nit;
}
