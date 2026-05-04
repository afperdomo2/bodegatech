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
 * Proporciona operaciones CRUD, consultas personalizadas, validación de SKU y unicidad de barcode.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, SkuValidationRepository {

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
     * Busca productos por categoría (UUID).
     */
    Page<Product> findByCategoryIdAndIsActiveTrue(UUID categoryId, Pageable pageable);

    /**
     * Cuenta productos activos de una categoría.
     * Utilizado para validar si una categoría puede ser eliminada.
     */
    long countByCategoryIdAndIsActiveTrue(UUID categoryId);

    /**
     * Implementación del método de validación de SKU.
     * Verifica si un SKU ya existe en la base de datos.
     *
     * @param sku el código a verificar
     * @return true si el SKU existe, false en caso contrario
     */
    @Override
    default boolean skuExists(String sku) {
        return findBySku(sku).isPresent();
    }

    /**
     * Busca un producto activo por su código de barras.
     * Utilizado para validar unicidad al crear un producto.
     */
    Optional<Product> findByBarcodeAndIsActiveTrue(String barcode);

    /**
     * Busca un producto activo con el barcode dado, excluyendo un ID específico.
     * Utilizado para validar unicidad al actualizar un producto.
     */
    @Query("SELECT p FROM Product p WHERE p.barcode = :barcode AND p.isActive = true AND p.id <> :excludeId")
    Optional<Product> findByBarcodeExcluding(String barcode, UUID excludeId);
}
