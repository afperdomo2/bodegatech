package com.afperdomo.bodegatech.module.product.repository;

import com.afperdomo.bodegatech.module.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio para la entidad Product.
 * Proporciona operaciones CRUD y consultas personalizadas.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    /**
     * Busca un producto por su SKU.
     */
    Optional<Product> findBySku(String sku);

    /**
     * Lista todos los productos activos con paginación.
     */
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.createdAt DESC")
    Page<Product> findAllActive(Pageable pageable);

    /**
     * Busca un producto activo por su ID.
     */
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.isActive = true")
    Optional<Product> findByIdActive(UUID id);

    /**
     * Busca productos por categoría.
     */
    Page<Product> findByCategoryAndIsActiveTrue(String category, Pageable pageable);
}
