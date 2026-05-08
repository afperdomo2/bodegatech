package com.afperdomo.bodegatech.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración web de CORS e interceptores.
 * Registra el ApiKeyInterceptor únicamente en rutas internas (callbacks de Lambda).
 * Los endpoints públicos y futuros endpoints JWT no son afectados.
 */
@Configuration
@ConfigurationProperties(prefix = "app.cors")
@Getter
@Setter
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private ApiKeyInterceptor apiKeyInterceptor;

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

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Solo aplica a endpoints internos de Lambda — no afecta otros endpoints
        registry.addInterceptor(apiKeyInterceptor)
                .addPathPatterns("/api/product-images/*/processed");
    }
}
