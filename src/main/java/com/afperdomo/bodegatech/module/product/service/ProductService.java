package com.afperdomo.bodegatech.module.product.service;

import com.afperdomo.bodegatech.module.product.dto.ProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductResponse;
import com.afperdomo.bodegatech.shared.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Interfaz de servicio para la gestión de productos.
 */
public interface ProductService {

    /**
     * Obtiene todos los productos activos con paginación.
     */
    PagedResponse<ProductResponse> findAllProducts(Pageable pageable);

    /**
     * Obtiene un producto por su ID.
     */
    ProductResponse findProductById(UUID id);

    /**
     * Crea un nuevo producto.
     */
    ProductResponse createProduct(ProductRequest request);

    /**
     * Actualiza un producto existente.
     */
    ProductResponse updateProduct(UUID id, ProductRequest request);

    /**
     * Desactiva un producto (soft delete).
     */
    void deleteProduct(UUID id);
}
