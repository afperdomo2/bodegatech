package com.afperdomo.bodegatech.module.unit.repository;

import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeasurementUnitRepository extends JpaRepository<MeasurementUnit, UUID> {

    @Query("SELECT u FROM MeasurementUnit u WHERE u.isActive = true ORDER BY u.createdAt DESC")
    Page<MeasurementUnit> findAllActive(Pageable pageable);

    @Query("SELECT u FROM MeasurementUnit u WHERE u.id = :id AND u.isActive = true")
    Optional<MeasurementUnit> findByIdActive(UUID id);

    Optional<MeasurementUnit> findByNameIgnoreCase(String name);

    Optional<MeasurementUnit> findByAbbreviationIgnoreCase(String abbreviation);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM MeasurementUnit u WHERE u.id IN :ids AND u.isActive = true")
    boolean allExistAndActive(Iterable<UUID> ids);

    @Query("SELECT u FROM MeasurementUnit u WHERE u.type = :type AND u.isActive = true ORDER BY u.name")
    Page<MeasurementUnit> findByTypeAndActive(UnitType type, Pageable pageable);

    /**
     * Encuentra la unidad base de un tipo específico.
     * @param type tipo de unidad
     * @return la unidad base activa del tipo, si existe
     */
    @Query("SELECT u FROM MeasurementUnit u WHERE u.type = :type AND u.isBase = true AND u.isActive = true")
    Optional<MeasurementUnit> findBaseUnitByType(UnitType type);

    /**
     * Verifica si una unidad base existe para un tipo específico.
     * @param type tipo de unidad
     * @return true si existe una unidad base activa, false en caso contrario
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM MeasurementUnit u WHERE u.type = :type AND u.isBase = true AND u.isActive = true")
    boolean existsBaseUnitByType(UnitType type);
}
