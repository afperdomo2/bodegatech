package com.afperdomo.bodegatech.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración web de CORS
 */
@Configuration
@ConfigurationProperties(prefix = "app.cors")
@Getter
@Setter
public class WebConfig implements WebMvcConfigurer {

    private String allowedOrigins;

    private String allowedMethods;

    private String allowedHeaders;

    private boolean allowCredentials;

    private long maxAge;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = allowedOrigins.split(",");
        String[] methods = allowedMethods.split(",");

        // Trim whitespace from each origin and method
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        for (int i = 0; i < methods.length; i++) {
            methods[i] = methods[i].trim();
        }

        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods(methods)
                .allowedHeaders(allowedHeaders)
                .allowCredentials(allowCredentials)
                .maxAge(maxAge);
    }
}
