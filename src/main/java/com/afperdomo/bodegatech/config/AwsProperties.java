package com.afperdomo.bodegatech.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.aws")
public class AwsProperties {

    private String region;
    private String accessKeyId;
    private String secretAccessKey;
    private S3Properties s3;

    @Getter
    @Setter
    public static class S3Properties {
        private String bucketName;
        private String publicUrl;
        private Integer presignedUrlExpirationMinutes;
    }
}
