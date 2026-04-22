package com.afperdomo.bodegatech.module.product.mapper;

import com.afperdomo.bodegatech.module.product.dto.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.entity.Product;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper para convertir entre entidades y DTOs del producto.
 * Utiliza MapStruct para generar la implementación automáticamente.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    /**
     * Convierte una entidad Product a ProductDto.
     */
    ProductDto toDto(Product product);

    /**
     * Convierte un CreateProductRequest a entidad Product.
     * Los campos id, createdAt, updatedAt, version e isActive se gestionan en el servicio.
     */
    Product toEntity(CreateProductRequest request);

    /**
     * Actualiza parcialmente una entidad Product con los campos de UpdateProductRequest.
     * Los campos null en el request se ignoran, preservando el valor actual de la entidad.
     * Preserva siempre: id, sku, createdAt, updatedAt, version e isActive.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateProductRequest request, @MappingTarget Product product);
}
