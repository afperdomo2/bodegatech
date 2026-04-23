package com.afperdomo.bodegatech.module.unitconversion.repository;

import com.afperdomo.bodegatech.module.unitconversion.entity.UnitConversion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UnitConversionRepository extends JpaRepository<UnitConversion, UUID> {

    @Query("SELECT uc FROM UnitConversion uc ORDER BY uc.createdAt DESC")
    Page<UnitConversion> findAll(Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(uc) > 0 THEN true ELSE false END FROM UnitConversion uc WHERE uc.fromUnit.id = :unitId OR uc.toUnit.id = :unitId")
    boolean existsByUnitId(UUID unitId);

    Optional<UnitConversion> findByFromUnitIdAndToUnitId(UUID fromUnitId, UUID toUnitId);
}
