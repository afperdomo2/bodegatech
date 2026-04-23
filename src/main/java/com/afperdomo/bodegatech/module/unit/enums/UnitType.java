package com.afperdomo.bodegatech.module.unit.enums;

/**
 * Tipos de unidades de medida disponibles en el sistema.
 * Cada unidad debe estar asociada a uno de estos tipos.
 */
public enum UnitType {
    MASS,        // Masa: kg, g, lb, oz
    VOLUME,      // Volumen: L, mL, gal, fl oz
    LENGTH,      // Longitud: m, cm, km, in, ft
    AREA,        // Área: m², cm², ft²
    QUANTITY,    // Cantidad: unidades, docenas, cajas
    TIME,        // Tiempo: horas, minutos, segundos, días
    TEMPERATURE  // Temperatura: °C, °F, K
}
