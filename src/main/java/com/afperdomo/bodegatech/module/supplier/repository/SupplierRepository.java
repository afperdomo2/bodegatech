package com.afperdomo.bodegatech.module.supplier.repository;

import com.afperdomo.bodegatech.module.supplier.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    Optional<Supplier> findByNit(String nit);

    Optional<Supplier> findByIdAndIsActiveTrue(UUID id);

    @Query("SELECT s FROM Supplier s WHERE s.isActive = true")
    Page<Supplier> findAllActive(Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.isActive = false")
    Page<Supplier> findAllInactive(Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Supplier s WHERE s.nit = :nit AND s.id != :id")
    boolean existsByNitAndIdNot(@Param("nit") String nit, @Param("id") UUID id);
}
