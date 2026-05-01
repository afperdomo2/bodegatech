package com.afperdomo.bodegatech.module.category.repository;

import com.afperdomo.bodegatech.module.category.entity.Category;
import org.springframework.data.jpa.domain.Specification;

/**
 * Especificaciones para consultas dinámicas de Category.
 * Permite construir queries con filtros opcionales.
 */
public class CategorySpecifications {

    /**
     * Filtra categorías por estado (activas/inactivas).
     * Si isActive es null, no aplica filtro (devuelve todas).
     */
    public static Specification<Category> hasActiveStatus(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                // Sin filtro — devolver todas
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }
}
