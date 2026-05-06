package com.afperdomo.bodegatech.module.warehouse.repository;

import com.afperdomo.bodegatech.module.warehouse.entity.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {

    Optional<Warehouse> findByCode(String code);

    Optional<Warehouse> findByIdAndIsActiveTrue(UUID id);

    @Query("SELECT w FROM Warehouse w WHERE w.isActive = true")
    Page<Warehouse> findAllActive(Pageable pageable);

    @Query("SELECT w FROM Warehouse w WHERE w.isActive = false")
    Page<Warehouse> findAllInactive(Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM Warehouse w WHERE w.code = :code AND w.id != :id")
    boolean existsByCodeAndIdNot(@Param("code") String code, @Param("id") UUID id);
}
