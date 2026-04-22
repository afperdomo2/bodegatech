package com.afperdomo.bodegatech.common.util;

import com.afperdomo.bodegatech.common.exception.SkuGenerationException;
import com.afperdomo.bodegatech.module.product.repository.SkuValidationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Generador de SKU para productos.
 * Genera SKUs únicos normalizados (sin acentos, mayúsculas).
 *
 * <p>Formato del SKU: {@code {nombre_3chars}-{categoria_3chars}-{timestamp_hex_4chars}}
 * <p>Ejemplo: {@code LAP-ELE-4F2A}
 *
 * <p>La categoría por defecto es {@code "GEN"} si no se proporciona.
 * El SKU se regenera automáticamente si es necesario, con hasta 3 reintentos para evitar colisiones.
 */
@Slf4j
@Component
public class SkuGenerator {

    private static final int MAX_RETRIES = 3;
    private static final int SKU_PART_LENGTH = 3;
    private static final int TIMESTAMP_HEX_LENGTH = 4;
    private static final String DEFAULT_CATEGORY = "GEN";

    /**
     * Genera un SKU único basado en nombre y categoría.
     * Implementa reintentos automáticos si el SKU candidato ya existe.
     *
     * @param name     nombre del producto (obligatorio)
     * @param category categoría del producto (null → "GEN")
     * @param validator validador agnóstico para verificar existencia de SKU
     * @return SKU único generado en formato normalizado
     * @throws IllegalArgumentException si name es null o vacío
     * @throws SkuGenerationException   si no se puede generar SKU único después de MAX_RETRIES intentos
     */
    public String generateUniqueSku(String name, String category, SkuValidationRepository validator) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("El nombre del producto no puede estar vacío");
        }

        String effectiveCategory = category != null ? category : DEFAULT_CATEGORY;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            String candidateSku = generateSku(name, effectiveCategory);

            if (!validator.skuExists(candidateSku)) {
                return candidateSku;
            }

            // Si existe, varía el timestamp en el próximo intento
        }

        // No se pudo generar SKU único después de MAX_RETRIES intentos
        String errorMsg = String.format(
                "No fue posible generar un SKU único para el producto '%s' (categoría: '%s') después de %d reintentos. Contacte al administrador.",
                name, effectiveCategory, MAX_RETRIES
        );
        log.warn(errorMsg);
        throw new SkuGenerationException(errorMsg);
    }

    /**
     * Genera un SKU normalizado basado en nombre y categoría.
     * Normalización: elimina acentos, convierte a mayúsculas, toma primeros 3 caracteres.
     *
     * <p>Formato: {@code {nombre_3chars}-{categoria_3chars}-{timestamp_hex_4chars}}
     *
     * @param name     nombre del producto
     * @param category categoría del producto (null → DEFAULT_CATEGORY)
     * @return SKU normalizado
     */
    public String generateSku(String name, String category) {
        String effectiveCategory = category != null ? category : DEFAULT_CATEGORY;

        String namePart = normalize(name).substring(0, Math.min(SKU_PART_LENGTH, normalize(name).length()));
        String categoryPart = normalize(effectiveCategory).substring(0, Math.min(SKU_PART_LENGTH, normalize(effectiveCategory).length()));
        String timestampHex = generateTimestampHex();

        return String.format("%s-%s-%s", namePart, categoryPart, timestampHex);
    }

    /**
     * Normaliza un string: elimina acentos, convierte a mayúsculas.
     *
     * @param text texto a normalizar
     * @return texto normalizado (mayúsculas, sin acentos)
     */
    private String normalize(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        // Remover acentos usando Normalizer
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("[^\\p{ASCII}]", "");

        // Convertir a mayúsculas y remover espacios
        return normalized.toUpperCase(Locale.ENGLISH).replaceAll("\\s+", "");
    }

    /**
     * Genera un timestamp hexadecimal de 4 caracteres.
     * Utiliza los milisegundos actuales para asegurar variabilidad en reintentos.
     *
     * @return string hexadecimal de 4 caracteres en mayúsculas
     */
    private String generateTimestampHex() {
        long timestamp = System.currentTimeMillis();
        String hex = Long.toHexString(timestamp);

        // Tomar los últimos 4 caracteres del hex y convertir a mayúsculas
        if (hex.length() >= TIMESTAMP_HEX_LENGTH) {
            return hex.substring(hex.length() - TIMESTAMP_HEX_LENGTH).toUpperCase(Locale.ENGLISH);
        } else {
            // Pad con ceros si es necesario
            return String.format("%04X", timestamp & 0xFFFF);
        }
    }
}
