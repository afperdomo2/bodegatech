package com.afperdomo.bodegatech.module.product.service;

import com.afperdomo.bodegatech.module.product.dto.ProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductResponse;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.mapper.ProductMapper;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Servicio de productos.
 * Contiene la lógica de negocio para la gestión de productos.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> findAllProducts(Pageable pageable) {
        log.info("Obteniendo productos activos. Página: {}, Tamaño: {}", pageable.getPageNumber(), pageable.getPageSize());

        Page<Product> products = productRepository.findAllActive(pageable);

        return PagedResponse.<ProductResponse>builder()
                .content(products.map(productMapper::toResponse).toList())
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ProductResponse findProductById(UUID id) {
        log.info("Obteniendo producto con ID: {}", id);

        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        return productMapper.toResponse(product);
    }

    public ProductResponse createProduct(ProductRequest request) {
        log.info("Creando nuevo producto con SKU: {}", request.getSku());

        // Validar que el SKU no exista
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new BusinessException("DUPLICATE_SKU", "Ya existe un producto con el SKU: " + request.getSku());
        }

        Product product = productMapper.toEntity(request);
        product.setIsActive(true);

        Product savedProduct = productRepository.save(product);
        log.info("Producto creado exitosamente con ID: {}", savedProduct.getId());

        return productMapper.toResponse(savedProduct);
    }

    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        log.info("Actualizando producto con ID: {}", id);

        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        // Validar que el SKU no exista en otro producto
        if (!product.getSku().equals(request.getSku()) &&
                productRepository.findBySku(request.getSku()).isPresent()) {
            throw new BusinessException("DUPLICATE_SKU", "Ya existe un producto con el SKU: " + request.getSku());
        }

        productMapper.updateEntity(request, product);
        Product updatedProduct = productRepository.save(product);

        log.info("Producto actualizado exitosamente con ID: {}", id);
        return productMapper.toResponse(updatedProduct);
    }

    public void deleteProduct(UUID id) {
        log.info("Desactivando producto con ID: {}", id);

        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        product.setIsActive(false);
        productRepository.save(product);

        log.info("Producto desactivado exitosamente con ID: {}", id);
    }
}
