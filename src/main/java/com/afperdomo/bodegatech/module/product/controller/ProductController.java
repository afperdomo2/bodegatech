package com.afperdomo.bodegatech.module.product.controller;

import com.afperdomo.bodegatech.module.product.dto.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ImageUploadRequest;
import com.afperdomo.bodegatech.module.product.dto.ImageUploadUrlDto;
import com.afperdomo.bodegatech.module.product.dto.ProductCreateResponseDto;
import com.afperdomo.bodegatech.module.product.dto.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.service.ProductImageService;
import com.afperdomo.bodegatech.module.product.service.ProductService;
import com.afperdomo.bodegatech.common.response.ApiResponse;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "API para la gestión de productos de la bodega")
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;

    @GetMapping
    @Operation( summary = "Listar todos los productos", description = "Obtiene una lista de todos los productos activos" )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de productos obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getAllProducts(
            @Parameter(description = "Número de página (comenzando en 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de elementos por página")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar (createdAt por defecto)")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Dirección del ordenamiento (ASC o DESC)")
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<ProductDto> products = productService.findAllProducts(pageable);

        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", products));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID", description = "Obtiene los detalles de un producto específico")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(
            @Parameter(description = "ID único del producto")
            @PathVariable UUID id) {

        ProductDto product = productService.findProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Producto obtenido exitosamente", product));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo producto", description = "Crea un nuevo producto en la bodega con imágenes opcionales")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Producto creado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflicto — SKU duplicado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<ProductCreateResponseDto>> createProduct(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del producto a crear", required = true)
            @Valid @RequestBody CreateProductRequest request) {

        ProductCreateResponseDto product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Producto creado exitosamente", product));
    }

    @PatchMapping("/{id}")
    @Operation( summary = "Actualizar producto parcialmente", description = "ctualiza los campos indicados de un producto existente." )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Producto actualizado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflicto de concurrencia — el registro fue modificado por otro proceso"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @Parameter(description = "ID único del producto a actualizar")
            @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar (solo los campos enviados serán modificados)", required = true)
            @Valid @RequestBody UpdateProductRequest request) {

        ProductDto product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Producto actualizado exitosamente", product));
    }

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

    @PostMapping("/{productId}/images")
    @Operation(summary = "Agregar imágenes a un producto", description = "Agrega una o más imágenes a un producto existente y obtiene URLs pre-firmadas de S3")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Imágenes procesadas exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<List<ImageUploadUrlDto>>> addImagesToProduct(
            @Parameter(description = "ID único del producto")
            @PathVariable UUID productId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Lista de imágenes a cargar", required = true)
            @Valid @RequestBody List<ImageUploadRequest> imageRequests) {

        List<ImageUploadUrlDto> uploadUrls = productImageService.addImagesToProduct(productId, imageRequests);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Imágenes procesadas exitosamente", uploadUrls));
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    @Operation(summary = "Eliminar imagen de un producto", description = "Elimina una imagen específica de un producto (pendiente: eliminar de S3)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Imagen eliminada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto o imagen no encontrados"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> deleteImage(
            @Parameter(description = "ID único del producto propietario de la imagen")
            @PathVariable UUID productId,
            @Parameter(description = "ID único de la imagen a eliminar")
            @PathVariable UUID imageId) {

        productImageService.deleteImage(productId, imageId);
        return ResponseEntity.noContent().build();
    }
}
