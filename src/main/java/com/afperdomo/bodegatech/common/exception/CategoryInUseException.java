package com.afperdomo.bodegatech.common.exception;

/**
 * Excepción lanzada cuando se intenta eliminar una categoría que tiene productos asignados.
 * HTTP 409 — Conflict.
 */
public class CategoryInUseException extends RuntimeException {
    private final long productCount;
    private final String categoryName;

    public CategoryInUseException(String categoryName, long productCount) {
        super(String.format(
                "No se puede eliminar la categoría '%s' — tiene %d producto(s) asignado(s)",
                categoryName,
                productCount
        ));
        this.categoryName = categoryName;
        this.productCount = productCount;
    }

    public long getProductCount() {
        return productCount;
    }

    public String getCategoryName() {
        return categoryName;
    }
}
