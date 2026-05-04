package com.afperdomo.bodegatech.module.product.controller;

import com.afperdomo.bodegatech.module.product.dto.request.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.request.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.response.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductSummaryDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductDetail;
import com.afperdomo.bodegatech.module.product.dto.ConfirmImagesRequest;
import com.afperdomo.bodegatech.module.product.dto.PresignedUrlDto;
import com.afperdomo.bodegatech.module.product.dto.PresignedUrlRequest;
import com.afperdomo.bodegatech.module.product.dto.response.ProductImageDto;
import com.afperdomo.bodegatech.module.product.service.ProductImageService;
import com.afperdomo.bodegatech.module.product.service.ProductService;
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
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "API para la gestión de productos de la bodega")
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;

    @GetMapping
    @Operation( summary = "Listar todos los productos", description = "Obtiene una lista de productos con filtro opcional por estado (activos/inactivos)." )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de productos obtenida exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<PagedResponse<ProductSummaryDto>>> getAllProducts(
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
        Page<ProductSummaryDto> products = productService.findAllProducts(pageable, isActive);
        PagedResponse<ProductSummaryDto> pagedResponse = new PagedResponse<>(products);

        return ResponseEntity.ok(ApiResponse.success("Productos obtenidos exitosamente", pagedResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto con detalles", description = "Obtiene los detalles completos de un producto")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<ProductDetail>> getProductById(
            @Parameter(description = "ID único del producto")
            @PathVariable UUID id) {

        ProductDetail product = productService.findProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Producto obtenido exitosamente", product));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo producto", description = "Crea un nuevo producto sin imágenes. Las imágenes se agregan posteriormente usando los endpoints de gestión de imágenes.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Producto creado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflicto — SKU duplicado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del producto a crear", required = true)
            @Valid @RequestBody CreateProductRequest request) {

        ProductDto product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Producto creado exitosamente", product));
    }

    @PatchMapping("/{id}")
    @Operation( summary = "Actualizar producto parcialmente", description = "Actualiza los campos indicados de un producto existente." )
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

    @PostMapping("/{productId}/images/presigned")
    @Operation(summary = "Generar URLs pre-firmadas para carga de imágenes", description = "Genera URLs pre-firmadas de S3 para que el cliente suba imágenes directamente. El cliente debe luego confirmar con el endpoint /confirm.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "URLs pre-firmadas generadas exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<List<PresignedUrlDto>>> generatePresignedUrls(
            @Parameter(description = "ID único del producto")
            @PathVariable UUID productId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Lista de nombres de archivo a cargar", required = true)
            @Valid @RequestBody PresignedUrlRequest request) {

        List<PresignedUrlDto> presignedUrls = productImageService.generatePresignedUrls(productId, request.getFileNames());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("URLs pre-firmadas generadas exitosamente", presignedUrls));
    }

    @PostMapping("/{productId}/images/confirm")
    @Operation(summary = "Confirmar carga de imágenes", description = "Confirma que el cliente ha subido las imágenes a S3 y las registra en la base de datos.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Imágenes confirmadas exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ApiResponse<List<ProductImageDto>>> confirmImages(
            @Parameter(description = "ID único del producto")
            @PathVariable UUID productId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Lista de fileKeys confirmados", required = true)
            @Valid @RequestBody ConfirmImagesRequest request) {

        List<ProductImageDto> confirmedImages = productImageService.confirmImages(productId, request.getFileKeys());
        return ResponseEntity.ok(ApiResponse.success("Imágenes confirmadas exitosamente", confirmedImages));
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
