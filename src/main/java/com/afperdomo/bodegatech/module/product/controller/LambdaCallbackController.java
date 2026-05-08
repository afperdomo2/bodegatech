package com.afperdomo.bodegatech.module.product.controller;

import com.afperdomo.bodegatech.module.product.dto.ProcessedImageRequest;
import com.afperdomo.bodegatech.module.product.service.ProductImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/product-images")
@RequiredArgsConstructor
@Tag(name = "Lambda Callbacks", description = "Endpoints internos para notificaciones de Lambda. Requieren header X-Internal-Api-Key.")
public class LambdaCallbackController {

    private final ProductImageService productImageService;

    @PatchMapping("/{imageId}/processed")
    @Operation(
            summary = "Callback de Lambda: imagen procesada",
            description = "Notifica al backend que Lambda procesó la imagen. Actualiza thumbnailKey, mediumKey y status=READY. Requiere header X-Internal-Api-Key."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Imagen actualizada exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "API Key inválida o ausente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    })
    public ResponseEntity<Void> imageProcessed(
            @Parameter(description = "ID de la imagen procesada por Lambda")
            @PathVariable UUID imageId,
            @Valid @RequestBody ProcessedImageRequest request) {

        productImageService.markAsProcessed(imageId, request);
        return ResponseEntity.noContent().build();
    }
}
