package com.afperdomo.bodegatech.module.supplier.controller;

import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import com.afperdomo.bodegatech.module.supplier.dto.request.CreateSupplierRequest;
import com.afperdomo.bodegatech.module.supplier.dto.request.UpdateSupplierRequest;
import com.afperdomo.bodegatech.module.supplier.dto.response.SupplierDto;
import com.afperdomo.bodegatech.module.supplier.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Tag(name = "Proveedores", description = "Gestión de proveedores")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Listar todos los proveedores", description = "Obtiene una lista de proveedores con filtro opcional por estado (activos/inactivos).")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de proveedores obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<PagedResponse<SupplierDto>>> listSuppliers(
            @Parameter(description = "Número de página (comenzando en 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de elementos por página")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar (createdAt por defecto)")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Dirección del ordenamiento (ASC o DESC)")
            @RequestParam(defaultValue = "DESC") Sort.Direction direction,
            @Parameter(description = "Filtro por estado (true=activos, false=inactivos, null=todos)")
            @RequestParam(required = false) Boolean isActive) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<SupplierDto> result = supplierService.findAllSuppliers(pageable, isActive);
        PagedResponse<SupplierDto> pagedResponse = new PagedResponse<>(result);
        return ResponseEntity.ok(ApiResponse.success("Proveedores obtenidos exitosamente", pagedResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener proveedor por ID", description = "Obtiene los detalles de un proveedor específico")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Proveedor encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Proveedor no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<SupplierDto>> getSupplier(
            @Parameter(description = "ID único del proveedor")
            @PathVariable UUID id) {
        SupplierDto result = supplierService.findSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success("Proveedor obtenido exitosamente", result));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo proveedor", description = "Crea un nuevo proveedor")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Proveedor creado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "NIT ya registrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del proveedor a crear", required = true)
            @Valid @RequestBody CreateSupplierRequest request) {
        SupplierDto result = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Proveedor creado exitosamente", result));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar proveedor parcialmente", description = "Actualiza los campos indicados de un proveedor existente.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Proveedor actualizado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Proveedor no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "NIT ya registrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<SupplierDto>> updateSupplier(
            @Parameter(description = "ID único del proveedor")
            @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos a actualizar", required = true)
            @Valid @RequestBody UpdateSupplierRequest request) {
        SupplierDto result = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.success("Proveedor actualizado exitosamente", result));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar proveedor", description = "Elimina un proveedor existente")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Proveedor eliminado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Proveedor no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> deleteSupplier(
            @Parameter(description = "ID único del proveedor")
            @PathVariable UUID id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}
