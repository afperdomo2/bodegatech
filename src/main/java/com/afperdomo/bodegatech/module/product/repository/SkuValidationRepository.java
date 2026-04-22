package com.afperdomo.bodegatech.module.product.repository;

/**
 * Interfaz agnóstica para validación de SKU.
 * Utilizada por {@link com.afperdomo.bodegatech.common.util.SkuGenerator}
 * para verificar si un SKU ya existe sin acoplarse a ProductRepository.
 */
public interface SkuValidationRepository {

    /**
     * Verifica si un SKU ya existe en la base de datos.
     *
     * @param sku el código a verificar
     * @return true si el SKU existe, false en caso contrario
     */
    boolean skuExists(String sku);
}
