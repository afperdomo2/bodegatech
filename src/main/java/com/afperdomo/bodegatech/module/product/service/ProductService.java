package com.afperdomo.bodegatech.module.product.service;

import com.afperdomo.bodegatech.module.product.dto.request.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.request.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.response.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductSummaryDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductDetail;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.mapper.ProductMapper;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import com.afperdomo.bodegatech.module.category.entity.Category;
import com.afperdomo.bodegatech.module.category.repository.CategoryRepository;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.repository.MeasurementUnitRepository;
import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.util.SkuGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final SkuGenerator skuGenerator;
    private final CategoryRepository categoryRepository;
    private final MeasurementUnitRepository measurementUnitRepository;

    @Transactional(readOnly = true)
    public Page<ProductSummaryDto> findAllProducts(Pageable pageable) {
        log.info("Obteniendo productos activos. Página: {}, Tamaño: {}", pageable.getPageNumber(), pageable.getPageSize());
        return productRepository.findAllActive(pageable).map(productMapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public ProductDetail findProductById(UUID id) {
        log.info("Obteniendo producto con ID: {}", id);

        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        return productMapper.toDetail(product);
    }

    public ProductDto createProduct(CreateProductRequest request) {
        log.info("Creando nuevo producto: {}", request.getName());

        // Validar y obtener categoría
        Category category = categoryRepository.findByIdActive(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", request.getCategoryId()));

        // Validar y obtener unidad de medida (obligatoria)
        MeasurementUnit unit = measurementUnitRepository.findByIdActive(request.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidad de Medida", request.getUnitId()));

        // Validar relación minStock <= maxStock (validación cruzada, no expresable en Bean Validation)
        if (request.getMinStock() != null && request.getMaxStock() != null &&
                request.getMinStock().compareTo(request.getMaxStock()) > 0) {
            throw new IllegalArgumentException("Stock mínimo no puede ser mayor a stock máximo");
        }

        // Validar unicidad de barcode si se proporciona
        if (request.getBarcode() != null) {
            productRepository.findByBarcodeAndIsActiveTrue(request.getBarcode()).ifPresent(p -> {
                throw new BusinessException(
                        "El código de barras '" + request.getBarcode() + "' ya está registrado en otro producto");
            });
        }

        // Generar SKU único automáticamente
        String generatedSku = skuGenerator.generateUniqueSku(
                request.getName(),
                category.getName(),
                productRepository
        );

        Product product = productMapper.toEntity(request);
        product.setSku(generatedSku);
        product.setCategory(category);
        product.setUnit(unit);
        product.setIsActive(true);
        
        // Stock inicial siempre es 0 al crear (se gestiona vía Movimientos)
        product.setStock(BigDecimal.ZERO);

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

        // Si la unidad cambió, validar que exista
        MeasurementUnit newUnit = product.getUnit();
        if (request.getUnitId() != null && !request.getUnitId().equals(product.getUnit().getId())) {
            newUnit = measurementUnitRepository.findByIdActive(request.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unidad de Medida", request.getUnitId()));
        }

        // Validar relación minStock vs maxStock (validación cruzada, usar valores existentes si no se actualizan)
        BigDecimal finalMinStock = request.getMinStock() != null ? request.getMinStock() : product.getMinStock();
        BigDecimal finalMaxStock = request.getMaxStock() != null ? request.getMaxStock() : product.getMaxStock();
        if (finalMinStock != null && finalMaxStock != null &&
                finalMinStock.compareTo(finalMaxStock) > 0) {
            throw new IllegalArgumentException("Stock mínimo no puede ser mayor a stock máximo");
        }

        // Validar unicidad de barcode si se proporciona (excluyendo el producto actual)
        if (request.getBarcode() != null) {
            productRepository.findByBarcodeExcluding(request.getBarcode(), id).ifPresent(p -> {
                throw new BusinessException(
                        "El código de barras '" + request.getBarcode() + "' ya está registrado en otro producto");
            });
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

        // Asignar la nueva unidad si cambió
        if (request.getUnitId() != null) {
            product.setUnit(newUnit);
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
