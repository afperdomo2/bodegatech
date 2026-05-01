package com.afperdomo.bodegatech.module.category.mapper;

import com.afperdomo.bodegatech.module.category.dto.response.CategoryDto;
import com.afperdomo.bodegatech.module.category.dto.response.CategorySummaryDto;
import com.afperdomo.bodegatech.module.category.dto.response.CategoryDetail;
import com.afperdomo.bodegatech.module.category.dto.request.CreateCategoryRequest;
import com.afperdomo.bodegatech.module.category.dto.request.UpdateCategoryRequest;
import com.afperdomo.bodegatech.module.category.entity.Category;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper para convertir entre entidades y DTOs de categoría.
 * Utiliza MapStruct para generar la implementación automáticamente.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    /**
     * Convierte una entidad Category a CategoryDto (respuesta básica).
     * Utilizado en POST y PATCH responses.
     */
    CategoryDto toDto(Category category);

    /**
     * Convierte una entidad Category a CategorySummaryDto (respuesta resumida).
     * Utilizado en listados paginados (GET /api/categories).
     */
    CategorySummaryDto toSummaryDto(Category category);

    /**
     * Convierte una entidad Category a CategoryDetail (respuesta completa).
     * Utilizado en GET /api/categories/{id}.
     */
    CategoryDetail toDetail(Category category);

    /**
     * Convierte un CreateCategoryRequest a entidad Category.
     * Los campos id, createdAt, updatedAt, version e isActive se gestionan en el servicio.
     */
    Category toEntity(CreateCategoryRequest request);

    /**
     * Actualiza parcialmente una entidad Category con los campos de UpdateCategoryRequest.
     * Los campos null en el request se ignoran, preservando el valor actual de la entidad.
     * Preserva siempre: id, createdAt, updatedAt, version.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateCategoryRequest request, @MappingTarget Category category);
}
