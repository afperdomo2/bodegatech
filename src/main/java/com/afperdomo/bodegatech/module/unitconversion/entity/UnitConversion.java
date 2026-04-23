package com.afperdomo.bodegatech.module.unitconversion.entity;

import com.afperdomo.bodegatech.common.audit.BaseEntity;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Factor de conversión entre dos unidades de medida.
 * Ejemplo: 1 kg = 1000 g (factor = 1000, fromUnit = kg, toUnit = g)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unit_conversions", indexes = {
    @Index(name = "idx_conversions_to_unit", columnList = "to_unit_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_from_unit_to_unit", columnNames = {"from_unit_id", "to_unit_id"})
})
@EqualsAndHashCode(callSuper = true)
public class UnitConversion extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_unit_id", nullable = false)
    private MeasurementUnit fromUnit;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_unit_id", nullable = false)
    private MeasurementUnit toUnit;

    @NotNull
    @Positive
    @DecimalMin("0.0000000001")
    @Column(nullable = false, precision = 19, scale = 10)
    private BigDecimal factor;
}
