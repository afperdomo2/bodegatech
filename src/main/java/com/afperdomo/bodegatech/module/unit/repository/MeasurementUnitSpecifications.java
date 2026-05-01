package com.afperdomo.bodegatech.module.unit.repository;

import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import org.springframework.data.jpa.domain.Specification;

/**
 * Especificaciones (Criteria API) para construir queries dinámicamente
 * sobre la entidad MeasurementUnit.
 */
public class MeasurementUnitSpecifications {
    
    /**
     * Filtra unidades por estado (activas/inactivas).
     * Si isActive es null, no aplica filtro (devuelve todas).
     */
    public static Specification<MeasurementUnit> hasActiveStatus(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                // Sin filtro — devolver todas
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<MeasurementUnit> isBase() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("isBaseUnit"), true);
    }

    public static Specification<MeasurementUnit> hasType(UnitType type) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("type"), type);
    }
}
