package com.afperdomo.bodegatech.common.exception;

/**
 * Excepción lanzada cuando no se puede generar un SKU único para un producto.
 * Ocurre cuando después de 3 reintentos, todos los SKU candidatos generados ya existen en la BD.
 */
public class SkuGenerationException extends RuntimeException {

    public SkuGenerationException(String message) {
        super(message);
    }

    public SkuGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
