package com.afperdomo.bodegatech.module.product.controller;

import com.afperdomo.bodegatech.module.product.dto.ProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductResponse;
import com.afperdomo.bodegatech.module.product.service.ProductService;
import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Controlador REST para la gestión de productos.
 * Proporciona endpoints para operaciones CRUD y listados con paginación.
 */
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "API para la gestión de productos de la bodega")
public class ProductController {

    private final ProductService productService;

    /**
     * Obtiene todos los productos activos con paginación.
     */
    @GetMapping
    @Operation(summary = "Listar todos los productos", description = "Obtiene una lista paginada de todos los productos activos")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de productos obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAllProducts(
            @Parameter(description = "Número de página (comenzando en 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de elementos por página")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar (createdAt por defecto)")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Dirección del ordenamiento (ASC o DESC)")
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        PagedResponse<ProductResponse> products = productService.findAllProducts(pageable);

        return ResponseEntity.ok(
                ApiResponse.<PagedResponse<ProductResponse>>builder()
                        .success(true)
                        .message("Productos obtenidos exitosamente")
                        .data(products)
                        .build()
        );
    }

    /**
     * Obtiene un producto específico por su ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID", description = "Obtiene los detalles de un producto específico")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @Parameter(description = "ID único del producto")
            @PathVariable UUID id) {

        ProductResponse product = productService.findProductById(id);

        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .success(true)
                        .message("Producto obtenido exitosamente")
                        .data(product)
                        .build()
        );
    }

    /**
     * Crea un nuevo producto.
     */
    @PostMapping
    @Operation(summary = "Crear nuevo producto", description = "Crea un nuevo producto en la bodega")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Producto creado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Error de validación de negocio"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del producto a crear", required = true)
            @Valid @RequestBody ProductRequest request) {

        ProductResponse product = productService.createProduct(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ProductResponse>builder()
                        .success(true)
                        .message("Producto creado exitosamente")
                        .data(product)
                        .build()
        );
    }

    /**
     * Actualiza un producto existente.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto", description = "Actualiza los datos de un producto existente")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Producto actualizado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Error de validación de negocio"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @Parameter(description = "ID único del producto a actualizar")
            @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del producto a actualizar", required = true)
            @Valid @RequestBody ProductRequest request) {

        ProductResponse product = productService.updateProduct(id, request);

        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .success(true)
                        .message("Producto actualizado exitosamente")
                        .data(product)
                        .build()
        );
    }

    /**
     * Desactiva un producto (soft delete).
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar producto", description = "Desactiva un producto (soft delete, no se elimina de la base de datos)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Producto desactivado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "ID único del producto a desactivar")
            @PathVariable UUID id) {

        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
