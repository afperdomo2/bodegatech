package com.afperdomo.bodegatech.module.category.repository;

import com.afperdomo.bodegatech.module.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio para la entidad Category.
 * Proporciona operaciones CRUD y consultas personalizadas.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    /**
     * Busca una categoría por nombre (case-insensitive).
     */
    Optional<Category> findByNameIgnoreCase(String name);

    /**
     * Lista todas las categorías activas con paginación.
     */
    @Query("SELECT c FROM Category c WHERE c.isActive = true ORDER BY c.createdAt DESC")
    Page<Category> findAllActive(Pageable pageable);

    /**
     * Busca una categoría activa por su ID.
     */
    @Query("SELECT c FROM Category c WHERE c.id = :id AND c.isActive = true")
    Optional<Category> findByIdActive(UUID id);
}
