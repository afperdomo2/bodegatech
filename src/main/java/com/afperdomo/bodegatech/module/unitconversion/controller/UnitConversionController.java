package com.afperdomo.bodegatech.module.unitconversion.controller;

import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import com.afperdomo.bodegatech.module.unitconversion.dto.CreateUnitConversionRequest;
import com.afperdomo.bodegatech.module.unitconversion.dto.UnitConversionDto;
import com.afperdomo.bodegatech.module.unitconversion.dto.UpdateUnitConversionRequest;
import com.afperdomo.bodegatech.module.unitconversion.service.UnitConversionService;
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
@RequestMapping("/api/unit-conversions")
@RequiredArgsConstructor
@Tag(name = "Factores de Conversión", description = "API para la gestión de factores de conversión entre unidades de medida")
public class UnitConversionController {

    private final UnitConversionService conversionService;

    @GetMapping
    @Operation(summary = "Listar todos los factores de conversión", description = "Obtiene una lista de todos los factores de conversión disponibles")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de factores obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<PagedResponse<UnitConversionDto>>> getAllConversions(
            @Parameter(description = "Número de página (comenzando en 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de elementos por página")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar (createdAt por defecto)")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Dirección del ordenamiento (ASC o DESC)")
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<UnitConversionDto> conversions = conversionService.findAllConversions(pageable);
        PagedResponse<UnitConversionDto> pagedResponse = new PagedResponse<>(conversions);

        return ResponseEntity.ok(ApiResponse.success("Factores de conversión obtenidos exitosamente", pagedResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener factor de conversión por ID", description = "Obtiene los detalles completos de un factor de conversión")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Factor encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Factor no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<UnitConversionDto>> getConversionById(
            @Parameter(description = "ID único del factor de conversión")
            @PathVariable UUID id) {

        UnitConversionDto conversion = conversionService.findConversionById(id);
        return ResponseEntity.ok(ApiResponse.success("Factor de conversión obtenido exitosamente", conversion));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo factor de conversión", description = "Crea un nuevo factor de conversión entre dos unidades de medida")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Factor creado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Unidad origen o destino no encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflicto — el factor de conversión ya existe"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<UnitConversionDto>> createConversion(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del factor de conversión a crear", required = true)
            @Valid @RequestBody CreateUnitConversionRequest request) {

        UnitConversionDto conversion = conversionService.createConversion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Factor de conversión creado exitosamente", conversion));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar factor de conversión", description = "Actualiza el factor de un factor de conversión existente")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Factor actualizado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Factor no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<UnitConversionDto>> updateConversion(
            @Parameter(description = "ID único del factor a actualizar")
            @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevo factor de conversión", required = true)
            @Valid @RequestBody UpdateUnitConversionRequest request) {

        UnitConversionDto conversion = conversionService.updateConversion(id, request);
        return ResponseEntity.ok(ApiResponse.success("Factor de conversión actualizado exitosamente", conversion));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar factor de conversión", description = "Elimina un factor de conversión existente (eliminación física)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Factor eliminado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Factor no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> deleteConversion(
            @Parameter(description = "ID único del factor a eliminar")
            @PathVariable UUID id) {

        conversionService.deleteConversion(id);
        return ResponseEntity.noContent().build();
    }
}
