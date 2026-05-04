package com.afperdomo.bodegatech.module.category.service;

import com.afperdomo.bodegatech.module.category.dto.response.CategoryDto;
import com.afperdomo.bodegatech.module.category.dto.response.CategorySummaryDto;
import com.afperdomo.bodegatech.module.category.dto.response.CategoryDetail;
import com.afperdomo.bodegatech.module.category.dto.request.CreateCategoryRequest;
import com.afperdomo.bodegatech.module.category.dto.request.UpdateCategoryRequest;
import com.afperdomo.bodegatech.module.category.entity.Category;
import com.afperdomo.bodegatech.module.category.mapper.CategoryMapper;
import com.afperdomo.bodegatech.module.category.repository.CategoryRepository;
import com.afperdomo.bodegatech.module.category.repository.CategorySpecifications;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.CategoryInUseException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Servicio de categorías.
 * Contiene la lógica de negocio para la gestión de categorías.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<CategorySummaryDto> findAllCategories(Pageable pageable, Boolean isActive) {
        log.info("Obteniendo categorías. Página: {}, Tamaño: {}, isActive: {}", pageable.getPageNumber(), pageable.getPageSize(), isActive);
        
        Specification<Category> spec = CategorySpecifications.hasActiveStatus(isActive);
        return categoryRepository.findAll(spec, pageable).map(categoryMapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public CategoryDetail findCategoryById(UUID id) {
        log.info("Obteniendo categoría con ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", id));

        return categoryMapper.toDetail(category);
    }

    public CategoryDto createCategory(CreateCategoryRequest request) {
        log.info("Creando nueva categoría: {}", request.getName());

        // Validar que el nombre sea único (case-insensitive)
        categoryRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    throw new BusinessException(
                            "DUPLICATE_CATEGORY_NAME",
                            "Ya existe una categoría con el nombre '" + request.getName() + "'"
                    );
                });

        Category category = categoryMapper.toEntity(request);
        category.setIsActive(true);

        Category savedCategory = categoryRepository.save(category);
        log.info("Categoría creada exitosamente con ID: {}", savedCategory.getId());

        return categoryMapper.toDto(savedCategory);
    }

    public CategoryDto updateCategory(UUID id, UpdateCategoryRequest request) {
        log.info("Actualizando categoría con ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", id));

        // Si el nombre cambió, validar que sea único
        if (request.getName() != null && !request.getName().equals(category.getName())) {
            categoryRepository.findByNameIgnoreCase(request.getName())
                    .ifPresent(existing -> {
                        throw new BusinessException(
                                "DUPLICATE_CATEGORY_NAME",
                                "Ya existe una categoría con el nombre '" + request.getName() + "'"
                        );
                    });
        }

        categoryMapper.updateEntity(request, category);
        Category updatedCategory = categoryRepository.save(category);

        log.info("Categoría actualizada exitosamente con ID: {}", id);
        return categoryMapper.toDto(updatedCategory);
    }

    public void deleteCategory(UUID id) {
        log.info("Desactivando categoría con ID: {}", id);

        Category category = categoryRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", id));

        // Validar que no haya productos usando esta categoría
        long productCount = productRepository.countByCategoryIdAndIsActiveTrue(id);
        if (productCount > 0) {
            log.warn("Intento de eliminar categoría {} que tiene {} productos activos", id, productCount);
            throw new CategoryInUseException(category.getName(), productCount);
        }

        category.setIsActive(false);
        categoryRepository.save(category);

        log.info("Categoría desactivada exitosamente con ID: {}", id);
    }
}
