package com.afperdomo.bodegatech.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Configuración de JPA y auditoría.
 * Habilita la auditoría automática para las entidades (createdAt, updatedAt).
 */
@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.afperdomo.bodegatech")
public class JpaConfig {
}
