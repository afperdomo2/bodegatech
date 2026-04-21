package com.afperdomo.bodegatech.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuración de OpenAPI / Swagger.
 * Define la documentación de la API con información y servidores.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Servidor de desarrollo"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("Servidor de producción")
                ))
                .info(new Info()
                        .title("BodegaTech API")
                        .version("1.0.0")
                        .description("API de gestión de bodega y almacén. Sistema para administrar productos, inventario y operaciones logísticas.")
                        .contact(new Contact()
                                .name("BodegaTech Support")
                                .email("support@bodegatech.com")
                                .url("https://bodegatech.com"))
                        .license(new License()
                                .name("Licencia Propietaria")
                                .url("https://bodegatech.com/license"))
                );
    }
}
