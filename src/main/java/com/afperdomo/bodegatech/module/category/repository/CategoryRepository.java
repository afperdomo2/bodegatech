package com.afperdomo.bodegatech.module.category.repository;

import com.afperdomo.bodegatech.module.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio para la entidad Category.
 * Proporciona operaciones CRUD y consultas personalizadas con soporte para Specifications.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID>, JpaSpecificationExecutor<Category> {

    /**
     * Busca una categoría por nombre (case-insensitive).
     */
    Optional<Category> findByNameIgnoreCase(String name);

    /**
     * Busca una categoría activa por su ID.
     */
    @Query("SELECT c FROM Category c WHERE c.id = :id AND c.isActive = true")
    Optional<Category> findByIdActive(UUID id);

    /**
     * Cuenta todos los productos (activos e inactivos) asociados a una categoría.
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    long countByCategoryId(UUID categoryId);
}
