package com.afperdomo.bodegatech.module.unit.entity;

import com.afperdomo.bodegatech.common.audit.BaseEntity;
import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Unidad de medida utilizada en el sistema.
 * Ejemplos: kilogramo (kg), litro (L), metro (m).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "measurement_units", indexes = {
    @Index(name = "idx_units_type", columnList = "type"),
    @Index(name = "idx_units_is_active", columnList = "is_active"),
    @Index(name = "idx_units_base_unit_id", columnList = "base_unit_id"),
    @Index(name = "idx_units_is_base_unit", columnList = "is_base_unit")
})
@EqualsAndHashCode(callSuper = true)
public class MeasurementUnit extends BaseEntity {

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @NotBlank
    @Column(nullable = false, unique = true, length = 20)
    private String abbreviation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UnitType type;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Indica si esta es la unidad base (más pequeña) para su tipo.
     * Una unidad base no tiene referencia a otra unidad ni factor de conversión.
     */
    @Column(name = "is_base_unit", nullable = false)
    @Builder.Default
    private Boolean isBase = false;

    /**
     * Referencia a la unidad base de este tipo (self-referencing FK).
     * Solo se completa si isBase = false.
     * Siempre apunta a una unidad con isBase = true del mismo tipo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_unit_id")
    private MeasurementUnit baseUnit;

    /**
     * Factor de conversión respecto a la unidad base.
     * Ejemplo: 1 kg = 1000 g, entonces conversionFactor = 1000 si baseUnit es gramo.
     * Solo se completa si isBaseUnit = false.
     * Precisión: 19 dígitos totales, 10 decimales.
     */
    @Column(name = "conversion_factor", precision = 19, scale = 10)
    private BigDecimal conversionFactor;
}
