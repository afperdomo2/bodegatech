package com.afperdomo.bodegatech.module.product.service;

import com.afperdomo.bodegatech.module.product.dto.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.mapper.ProductMapper;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import com.afperdomo.bodegatech.module.category.entity.Category;
import com.afperdomo.bodegatech.module.category.repository.CategoryRepository;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.util.SkuGenerator;
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
    private final SkuGenerator skuGenerator;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<ProductDto> findAllProducts(Pageable pageable) {
        log.info("Obteniendo productos activos. Página: {}, Tamaño: {}", pageable.getPageNumber(), pageable.getPageSize());
        return productRepository.findAllActive(pageable).map(productMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ProductDto findProductById(UUID id) {
        log.info("Obteniendo producto con ID: {}", id);

        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        return productMapper.toDto(product);
    }

    public ProductDto createProduct(CreateProductRequest request) {
        log.info("Creando nuevo producto: {}", request.getName());

        // Buscar y validar la categoría
        Category category = categoryRepository.findByIdActive(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", request.getCategoryId()));

        // Generar SKU único automáticamente basado en nombre y categoría
        String generatedSku = skuGenerator.generateUniqueSku(
                request.getName(),
                category.getName(),
                productRepository
        );

        Product product = productMapper.toEntity(request);
        product.setSku(generatedSku);
        product.setCategory(category);
        product.setIsActive(true);

        Product savedProduct = productRepository.save(product);
        log.info("Producto creado exitosamente con ID: {} y SKU: {}", savedProduct.getId(), generatedSku);

        return productMapper.toDto(savedProduct);
    }

    public ProductDto updateProduct(UUID id, UpdateProductRequest request) {
        log.info("Actualizando producto con ID: {}", id);

        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        // Si la categoría cambió, validar que exista
        Category newCategory = product.getCategory();
        if (request.getCategoryId() != null && !request.getCategoryId().equals(product.getCategory().getId())) {
            newCategory = categoryRepository.findByIdActive(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría", request.getCategoryId()));
        }

        // Regenerar SKU SOLO si cambian name o category
        String currentCategoryName = product.getCategory().getName();
        String newCategoryName = newCategory.getName();

        boolean nameChanged = request.getName() != null &&
                !request.getName().equals(product.getName());
        boolean categoryChanged = request.getCategoryId() != null &&
                !newCategoryName.equals(currentCategoryName);

        if (nameChanged || categoryChanged) {
            String newName = request.getName() != null ? request.getName() : product.getName();
            String newSku = skuGenerator.generateUniqueSku(newName, newCategoryName, productRepository);
            product.setSku(newSku);
            log.debug("SKU regenerado para producto {}: {} → {}", id, product.getSku(), newSku);
        }

        // Asignar la nueva categoría si cambió
        if (request.getCategoryId() != null) {
            product.setCategory(newCategory);
        }

        productMapper.updateEntity(request, product);
        Product updatedProduct = productRepository.save(product);

        log.info("Producto actualizado exitosamente con ID: {}", id);
        return productMapper.toDto(updatedProduct);
    }

    public void deleteProduct(UUID id) {
        log.info("Desactivando producto con ID: {}", id);

        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        product.setIsActive(false);
        productRepository.save(product);

        log.info("Producto desactivado exitosamente con ID: {}", id);
    }
}
