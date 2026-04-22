package com.afperdomo.bodegatech.common.util;

import com.afperdomo.bodegatech.module.product.dto.PresignedUrlDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Generador de URLs pre-firmadas para S3.
 * Actualmente genera URLs hardcodeadas como placeholders.
 * 
 * TODO: Integrar AWS S3 SDK (software.amazon.awssdk:s3) para generar URLs pre-firmadas reales
 * utilizando software.amazon.awssdk.s3.presigner.S3Presigner
 */
@Slf4j
@Component
public class S3PresignedUrlGenerator {

    private static final String S3_BUCKET_URL = "https://bodegatech-uploads.s3.amazonaws.com";

    /**
     * Genera una URL pre-firmada para carga de imagen en S3.
     * 
     * @param productId ID del producto
     * @param fileName Nombre original del archivo
     * @return DTO con fileKey y uploadUrl pre-firmada
     */
    public PresignedUrlDto generatePresignedUrl(UUID productId, String fileName) {
        log.debug("Generando URL pre-firmada para producto {} - archivo {}", productId, fileName);

        // Construir fileKey: "products/{productId}/{fileName}"
        String fileKey = String.format("products/%s/%s", productId, fileName);

        // TODO: Reemplazar con URL real de S3 pre-firmada (válida por 15 minutos)
        String uploadUrl = String.format(
                "%s/%s?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=PLACEHOLDER&X-Amz-Date=PLACEHOLDER&X-Amz-Expires=900&X-Amz-Signature=PLACEHOLDER",
                S3_BUCKET_URL,
                fileKey
        );

        return PresignedUrlDto.builder()
                .fileName(fileName)
                .fileKey(fileKey)
                .uploadUrl(uploadUrl)
                .build();
    }
}

