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

import org.springframework.util.StringUtils;

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

        // 1. Generar UUID para la imagen
        UUID imageId = UUID.randomUUID();

        // 2. Extraer la extensión original (ej: .png, .jpg)
        String extension = StringUtils.getFilenameExtension(fileName);
        if (extension == null) {
            extension = "png"; // Fallback seguro
        }
        extension = extension.toLowerCase();

        // 3. Construir el fileKey ESTANDARIZADO
        // Formato: products/{prodId}/img-{imgId}-original.{ext}
        String fileKey = String.format("products/%s/img-%s-original.%s", productId, imageId, extension);

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

        log.debug("URL pre-firmada generada exitosamente. FileKey: {}, ImageId: {}, Expiración: {} minutos", fileKey, imageId, expirationMinutes);

        return PresignedUrlDto.builder()
                .imageId(imageId)
                .fileName(fileName)
                .fileKey(fileKey)
                .uploadUrl(uploadUrl)
                .build();
    }
}

