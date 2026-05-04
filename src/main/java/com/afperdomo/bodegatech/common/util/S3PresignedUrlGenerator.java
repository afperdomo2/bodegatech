package com.afperdomo.bodegatech.common.util;

import com.afperdomo.bodegatech.config.AwsProperties;
import com.afperdomo.bodegatech.module.product.dto.PresignedUrlDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class S3PresignedUrlGenerator {

    private final S3Presigner s3Presigner;
    private final AwsProperties awsProperties;

    public PresignedUrlDto generatePresignedUrl(UUID productId, String fileName) {
        log.debug("Generando URL pre-firmada para producto {} - archivo {}", productId, fileName);

        // Construir fileKey con UUID para evitar colisiones: "products/{productId}/{uuid}_{fileName}"
        String fileKey = String.format("products/%s/%s_%s", productId, UUID.randomUUID(), fileName);

        // Obtener expiración desde configuración (default: 15 minutos)
        Integer expirationMinutes = awsProperties.getS3().getPresignedUrlExpirationMinutes();
        Duration expiration = Duration.ofMinutes(expirationMinutes != null ? expirationMinutes : 15);

        // Construir solicitud de presigned PUT
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(awsProperties.getS3().getBucketName())
                .key(fileKey)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .putObjectRequest(putObjectRequest)
                .build();

        // Generar URL pre-firmada
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        String uploadUrl = presignedRequest.url().toString();

        log.debug("URL pre-firmada generada exitosamente. FileKey: {}, Expiración: {} minutos", fileKey, expirationMinutes);

        return PresignedUrlDto.builder()
                .fileName(fileName)
                .fileKey(fileKey)
                .uploadUrl(uploadUrl)
                .build();
    }
}

