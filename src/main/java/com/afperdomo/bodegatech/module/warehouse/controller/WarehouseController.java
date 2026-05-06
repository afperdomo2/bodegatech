package com.afperdomo.bodegatech.module.warehouse.controller;

import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import com.afperdomo.bodegatech.module.warehouse.dto.request.CreateWarehouseRequest;
import com.afperdomo.bodegatech.module.warehouse.dto.request.UpdateWarehouseRequest;
import com.afperdomo.bodegatech.module.warehouse.dto.response.WarehouseDto;
import com.afperdomo.bodegatech.module.warehouse.service.WarehouseService;
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
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
@Tag(name = "Bodegas", description = "Gestión de bodegas")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "Listar todas las bodegas", description = "Obtiene una lista de bodegas con filtro opcional por estado (activas/inactivas).")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de bodegas obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<PagedResponse<WarehouseDto>>> listWarehouses(
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
        Page<WarehouseDto> result = warehouseService.findAllWarehouses(pageable, isActive);
        PagedResponse<WarehouseDto> pagedResponse = new PagedResponse<>(result);
        return ResponseEntity.ok(ApiResponse.success("Bodegas obtenidas exitosamente", pagedResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener bodega por ID", description = "Obtiene los detalles de una bodega específica")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bodega encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Bodega no encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<WarehouseDto>> getWarehouse(
            @Parameter(description = "ID único de la bodega")
            @PathVariable UUID id) {
        WarehouseDto result = warehouseService.findWarehouseById(id);
        return ResponseEntity.ok(ApiResponse.success("Bodega obtenida exitosamente", result));
    }

    @PostMapping
    @Operation(summary = "Crear nueva bodega", description = "Crea una nueva bodega")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Bodega creada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Código de bodega ya registrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<WarehouseDto>> createWarehouse(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos de la bodega a crear", required = true)
            @Valid @RequestBody CreateWarehouseRequest request) {
        WarehouseDto result = warehouseService.createWarehouse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bodega creada exitosamente", result));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar bodega parcialmente", description = "Actualiza los campos indicados de una bodega existente.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bodega actualizada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Bodega no encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Código de bodega ya registrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<WarehouseDto>> updateWarehouse(
            @Parameter(description = "ID único de la bodega")
            @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos a actualizar", required = true)
            @Valid @RequestBody UpdateWarehouseRequest request) {
        WarehouseDto result = warehouseService.updateWarehouse(id, request);
        return ResponseEntity.ok(ApiResponse.success("Bodega actualizada exitosamente", result));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar bodega", description = "Elimina una bodega existente")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Bodega eliminada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Bodega no encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> deleteWarehouse(
            @Parameter(description = "ID único de la bodega")
            @PathVariable UUID id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }
}
