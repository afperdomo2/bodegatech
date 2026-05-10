package com.afperdomo.bodegatech.module.inventory.controller;

import com.afperdomo.bodegatech.module.inventory.dto.response.InventoryDto;
import com.afperdomo.bodegatech.module.inventory.dto.response.InventorySummaryDto;
import com.afperdomo.bodegatech.module.inventory.service.InventoryService;
import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
@Tag(name = "Inventario", description = "Gestión de inventario por producto-bodega")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Listar inventario", description = "Obtiene una lista paginada de registros de inventario con filtros opcionales por bodega, producto y stock bajo")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Inventario obtenido exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<PagedResponse<InventorySummaryDto>>> listInventories(
            @Parameter(description = "Número de página (comenzando en 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de elementos por página")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar (createdAt por defecto)")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Dirección del ordenamiento (ASC o DESC)")
            @RequestParam(defaultValue = "DESC") Sort.Direction direction,
            @Parameter(description = "Filtrar por ID de bodega")
            @RequestParam(required = false) UUID warehouseId,
            @Parameter(description = "Filtrar por ID de producto")
            @RequestParam(required = false) UUID productId,
            @Parameter(description = "Filtrar registros con stock bajo (quantity <= product.minStock)")
            @RequestParam(required = false) Boolean lowStock) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<InventorySummaryDto> result = inventoryService.findAll(pageable, warehouseId, productId, lowStock);
        PagedResponse<InventorySummaryDto> pagedResponse = new PagedResponse<>(result);
        return ResponseEntity.ok(ApiResponse.success("Inventario obtenido exitosamente", pagedResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener inventario por ID", description = "Obtiene los detalles completos de un registro de inventario")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Inventario encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Inventario no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<InventoryDto>> getInventory(
            @Parameter(description = "ID único del registro de inventario")
            @PathVariable UUID id) {
        InventoryDto result = inventoryService.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Inventario obtenido exitosamente", result));
    }
}