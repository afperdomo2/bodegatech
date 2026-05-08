package com.afperdomo.bodegatech.module.product.entity;

/**
 * Estados posibles para una imagen de producto.
 * Controla el ciclo de vida de procesamiento de imágenes.
 */
public enum ImageStatus {
    PROCESSING("Procesando"),
    READY("Listo"),
    FAILED("Error");

    private final String displayName;

    ImageStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
