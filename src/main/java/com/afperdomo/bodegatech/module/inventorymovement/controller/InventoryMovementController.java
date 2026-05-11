package com.afperdomo.bodegatech.module.inventorymovement.controller;

import com.afperdomo.bodegatech.module.inventorymovement.dto.request.AddMovementDetailsRequest;
import com.afperdomo.bodegatech.module.inventorymovement.dto.request.CreateMovementRequest;
import com.afperdomo.bodegatech.module.inventorymovement.dto.response.InventoryMovementDto;
import com.afperdomo.bodegatech.module.inventorymovement.dto.response.InventoryMovementSummaryDto;
import com.afperdomo.bodegatech.module.inventorymovement.service.InventoryMovementService;
import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.common.response.PagedResponse;
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
@RequestMapping("/api/movements")
@RequiredArgsConstructor
@Tag(name = "Movimientos de Inventario", description = "Gestión de movimientos de inventario")
public class InventoryMovementController {

    private final InventoryMovementService movementService;

    @GetMapping
    @Operation(summary = "Listar movimientos", description = "Obtiene una lista paginada de movimientos de inventario")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Movimientos obtenidos exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<PagedResponse<InventoryMovementSummaryDto>>> listMovements(
            @Parameter(description = "Número de página (comenzando en 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de elementos por página")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar (createdAt por defecto)")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Dirección del ordenamiento (ASC o DESC)")
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<InventoryMovementSummaryDto> result = movementService.findAll(pageable);
        PagedResponse<InventoryMovementSummaryDto> pagedResponse = new PagedResponse<>(result);
        return ResponseEntity.ok(ApiResponse.success("Movimientos obtenidos exitosamente", pagedResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener movimiento por ID", description = "Obtiene los detalles completos de un movimiento de inventario")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Movimiento encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Movimiento no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<InventoryMovementDto>> getMovement(
            @Parameter(description = "ID único del movimiento")
            @PathVariable UUID id) {
        InventoryMovementDto result = movementService.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Movimiento obtenido exitosamente", result));
    }

    @PostMapping
    @Operation(summary = "Crear movimiento", description = "Crea un nuevo movimiento de inventario con sus detalles y actualiza el stock en inventory")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Movimiento creado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Bodega, producto o proveedor no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Stock insuficiente para el movimiento"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<InventoryMovementDto>> createMovement(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del movimiento a crear", required = true)
            @Valid @RequestBody CreateMovementRequest request) {
        InventoryMovementDto result = movementService.createMovement(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Movimiento de inventario creado exitosamente", result));
    }

    @PostMapping("/{id}/details")
    @Operation(summary = "Agregar detalles a movimiento existente", description = "Agrega nuevos detalles a un movimiento ya existente y actualiza el stock en inventory")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Detalles agregados exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Movimiento o producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Stock insuficiente para el movimiento"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<InventoryMovementDto>> addDetails(
            @Parameter(description = "ID único del movimiento")
            @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Detalles a agregar", required = true)
            @Valid @RequestBody AddMovementDetailsRequest request) {
        InventoryMovementDto result = movementService.addDetails(id, request);
        return ResponseEntity.ok(ApiResponse.success("Detalles agregados exitosamente al movimiento", result));
    }
}