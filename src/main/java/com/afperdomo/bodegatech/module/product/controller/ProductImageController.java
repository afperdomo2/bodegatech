package com.afperdomo.bodegatech.module.product.controller;

import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.module.product.dto.ConfirmImagesRequest;
import com.afperdomo.bodegatech.module.product.dto.PresignedUrlDto;
import com.afperdomo.bodegatech.module.product.dto.PresignedUrlRequest;
import com.afperdomo.bodegatech.module.product.dto.response.ProductImageDto;
import com.afperdomo.bodegatech.module.product.service.ProductImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products/{productId}/images")
@RequiredArgsConstructor
@Tag(name = "Imágenes de Productos", description = "API para la gestión de imágenes de productos en S3")
public class ProductImageController {

    private final ProductImageService productImageService;

    @PostMapping("/presigned")
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

    @PostMapping("/confirm")
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

    @DeleteMapping("/{imageId}")
    @Operation(summary = "Eliminar imagen de un producto", description = "Elimina una imagen específica de un producto (elimina de S3 y de la BD)")
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

    @PatchMapping("/{imageId}/set-main")
    @Operation(summary = "Establecer imagen como principal", description = "Establece una imagen específica como la imagen principal del producto")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Imagen establecida como principal exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Producto o imagen no encontrados"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> setMainImage(
            @Parameter(description = "ID único del producto propietario de la imagen")
            @PathVariable UUID productId,
            @Parameter(description = "ID único de la imagen a establecer como principal")
            @PathVariable UUID imageId) {

        productImageService.setMainImage(productId, imageId);
        return ResponseEntity.noContent().build();
    }
}
