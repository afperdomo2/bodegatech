package com.afperdomo.bodegatech.module.unit.repository;

import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import org.springframework.data.jpa.domain.Specification;

/**
 * Especificaciones (Criteria API) para construir queries dinámicamente
 * sobre la entidad MeasurementUnit.
 */
public class MeasurementUnitSpecifications {
    public static Specification<MeasurementUnit> isActive() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("isActive"), true);
    }

    public static Specification<MeasurementUnit> isBase() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("isBase"), true);
    }

    public static Specification<MeasurementUnit> hasType(UnitType type) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("type"), type);
    }
}
