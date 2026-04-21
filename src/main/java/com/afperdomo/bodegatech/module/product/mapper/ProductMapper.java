package com.afperdomo.bodegatech.module.product.mapper;

import com.afperdomo.bodegatech.module.product.dto.ProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductResponse;
import com.afperdomo.bodegatech.module.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper para convertir entre entidades y DTOs del producto.
 * Utiliza MapStruct para generar la implementación automáticamente.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    /**
     * Convierte una entidad Product a un DTO ProductResponse.
     */
    ProductResponse toResponse(Product product);

    /**
     * Convierte un DTO ProductRequest a una entidad Product.
     * Los campos id, createdAt, updatedAt e isActive se establecen en el servicio.
     */
    Product toEntity(ProductRequest request);

    /**
     * Actualiza una entidad Product existente con los datos de un ProductRequest.
     * Preserva id, createdAt, updatedAt e isActive.
     */
    void updateEntity(ProductRequest request, @MappingTarget Product product);
}
