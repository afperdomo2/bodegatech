package com.afperdomo.bodegatech.module.product.mapper;

import com.afperdomo.bodegatech.module.product.dto.request.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.request.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.response.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductSummaryDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductDetail;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.category.dto.response.CategorySummaryDto;
import com.afperdomo.bodegatech.module.category.entity.Category;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper para convertir entre entidades y DTOs del producto.
 * Utiliza MapStruct para generar la implementación automáticamente.
 * 
 * <p>Nota: La relación @ManyToOne con Category se mapea usando un método helper.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    /**
     * Convierte una entidad Product a ProductDto (respuesta básica).
     * Mapea la relación Category → CategorySummaryDto usando el método helper.
     * Utilizado en POST y PATCH responses.
     */
    @Mapping(source = "category", target = "category", qualifiedByName = "toCategorySummary")
    ProductDto toDto(Product product);

    /**
     * Convierte una entidad Product a ProductSummaryDto (respuesta resumida).
     * Mapea la relación Category → CategorySummaryDto usando el método helper.
     * Utilizado en listados paginados (GET /api/products).
     */
    @Mapping(source = "category", target = "category", qualifiedByName = "toCategorySummary")
    ProductSummaryDto toSummaryDto(Product product);

    /**
     * Convierte una entidad Product a ProductDetail (respuesta completa).
     * Mapea la relación Category → CategorySummaryDto usando el método helper.
     * Utilizado en GET /api/products/{id}.
     */
    @Mapping(source = "category", target = "category", qualifiedByName = "toCategorySummary")
    ProductDetail toDetail(Product product);

    /**
     * Convierte un CreateProductRequest a entidad Product.
     * Los campos id, createdAt, updatedAt, version, isActive y category se gestionan en el servicio.
     * Ignora categoryId porque se asigna en ProductService.
     */
    @Mapping(target = "category", ignore = true)
    Product toEntity(CreateProductRequest request);

    /**
     * Actualiza parcialmente una entidad Product con los campos de UpdateProductRequest.
     * Los campos null en el request se ignoran, preservando el valor actual de la entidad.
     * Preserva siempre: id, sku, createdAt, updatedAt, version e isActive.
     * Ignora categoryId porque se asigna en ProductService.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category", ignore = true)
    void updateEntity(UpdateProductRequest request, @MappingTarget Product product);

    /**
     * Helper para mapear Category → CategorySummaryDto.
     * Anotado con @Named para poder usarlo en @Mapping con qualifiedByName.
     */
    @Named("toCategorySummary")
    default CategorySummaryDto toCategorySummary(Category category) {
        if (category == null) {
            return null;
        }
        return CategorySummaryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }
}
