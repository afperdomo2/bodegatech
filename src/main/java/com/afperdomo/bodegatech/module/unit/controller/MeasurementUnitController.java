package com.afperdomo.bodegatech.module.unit.controller;

import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import com.afperdomo.bodegatech.module.unit.dto.request.CreateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.request.UpdateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitDto;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitDetail;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitSummaryDto;
import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import com.afperdomo.bodegatech.module.unit.service.MeasurementUnitService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
@Tag(name = "Unidades de Medida", description = "API para la gestión de unidades de medida")
public class MeasurementUnitController {

    private final MeasurementUnitService unitService;

    @GetMapping
    @Operation(summary = "Listar todas las unidades de medida", description = "Obtiene una lista de todas las unidades de medida activas, opcionalmente filtradas por isBase y/o type")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de unidades obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<PagedResponse<MeasurementUnitSummaryDto>>> getAllUnits(
            @Parameter(description = "Número de página (comenzando en 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de elementos por página")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar (createdAt por defecto)")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Dirección del ordenamiento (ASC o DESC)")
            @RequestParam(defaultValue = "DESC") Sort.Direction direction,
            @Parameter(description = "Filtro opcional: si es true, solo retorna unidades base")
            @RequestParam(required = false) Boolean isBase,
            @Parameter(description = "Filtro opcional por tipo de unidad (MASS, VOLUME, LENGTH, etc.)")
            @RequestParam(required = false) UnitType type) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<MeasurementUnitSummaryDto> units = unitService.findAllUnits(pageable, isBase, type);
        PagedResponse<MeasurementUnitSummaryDto> pagedResponse = new PagedResponse<>(units);

        return ResponseEntity.ok(ApiResponse.success("Unidades de medida obtenidas exitosamente", pagedResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener unidad de medida por ID", description = "Obtiene los detalles completos de una unidad de medida")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unidad encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Unidad no encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<MeasurementUnitDetail>> getUnitById(
            @Parameter(description = "ID único de la unidad")
            @PathVariable UUID id) {

        MeasurementUnitDetail unit = unitService.findUnitById(id);
        return ResponseEntity.ok(ApiResponse.success("Unidad de medida obtenida exitosamente", unit));
    }

    @PostMapping
    @Operation(summary = "Crear nueva unidad de medida", description = "Crea una nueva unidad de medida")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Unidad creada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflicto — nombre o abreviación duplicados"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<MeasurementUnitDto>> createUnit(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos de la unidad a crear", required = true)
            @Valid @RequestBody CreateMeasurementUnitRequest request) {

        MeasurementUnitDto unit = unitService.createUnit(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Unidad de medida creada exitosamente", unit));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar unidad de medida parcialmente", description = "Actualiza los campos indicados de una unidad de medida existente")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unidad actualizada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Unidad no encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflicto — nombre o abreviación duplicados"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<MeasurementUnitDto>> updateUnit(
            @Parameter(description = "ID único de la unidad a actualizar")
            @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar (solo los campos enviados serán modificados)", required = true)
            @Valid @RequestBody UpdateMeasurementUnitRequest request) {

        MeasurementUnitDto unit = unitService.updateUnit(id, request);
        return ResponseEntity.ok(ApiResponse.success("Unidad de medida actualizada exitosamente", unit));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar unidad de medida", description = "Desactiva una unidad de medida (soft delete, no se elimina de la base de datos)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Unidad desactivada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Unidad no encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflicto — unidad tiene factores de conversión asociados"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> deleteUnit(
            @Parameter(description = "ID único de la unidad a desactivar")
            @PathVariable UUID id) {

        unitService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }
}
