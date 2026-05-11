package com.afperdomo.bodegatech.module.inventorymovement.entity;

/**
 * Tipos de movimiento de inventario.
 * Define la naturaleza del movimiento y si incrementa o reduce el stock.
 */
public enum MovementType {
    PURCHASE_ENTRY("Entrada por compra"),
    SALE_EXIT("Salida por venta"),
    TRANSFER_ENTRY("Entrada por traslado"),
    TRANSFER_EXIT("Salida por traslado"),
    ADJUSTMENT_POS("Ajuste positivo"),
    ADJUSTMENT_NEG("Ajuste negativo");

    private final String displayName;

    MovementType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}