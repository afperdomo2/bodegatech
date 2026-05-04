package com.afperdomo.bodegatech.module.unit.repository;

import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeasurementUnitRepository extends JpaRepository<MeasurementUnit, UUID>, JpaSpecificationExecutor<MeasurementUnit> {

    @Query("SELECT u FROM MeasurementUnit u WHERE u.id = :id AND u.isActive = true")
    Optional<MeasurementUnit> findByIdActive(UUID id);

    Optional<MeasurementUnit> findByNameIgnoreCase(String name);

    Optional<MeasurementUnit> findByAbbreviationIgnoreCase(String abbreviation);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM MeasurementUnit u WHERE u.id IN :ids AND u.isActive = true")
    boolean allExistAndActive(Iterable<UUID> ids);

    /**
     * Encuentra la unidad base de un tipo específico.
     * @param type tipo de unidad
     * @return la unidad base activa del tipo, si existe
     */
    @Query("SELECT u FROM MeasurementUnit u WHERE u.type = :type AND u.isBaseUnit = true AND u.isActive = true")
    Optional<MeasurementUnit> findBaseUnitByType(UnitType type);

    /**
     * Verifica si una unidad base existe para un tipo específico.
     * @param type tipo de unidad
     * @return true si existe una unidad base activa, false en caso contrario
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM MeasurementUnit u WHERE u.type = :type AND u.isBaseUnit = true AND u.isActive = true")
    boolean existsBaseUnitByType(UnitType type);

    /**
     * Encuentra todas las unidades derivadas activas de una unidad base.
     * Ordenadas ascendentemente por factor de conversión.
     * @param baseUnitId ID de la unidad base
     * @return lista de unidades derivadas (vacía si no hay)
     */
    @Query("SELECT u FROM MeasurementUnit u WHERE u.baseUnit.id = :baseUnitId AND u.isActive = true ORDER BY u.conversionFactor ASC")
    List<MeasurementUnit> findActiveByBaseUnitIdOrderByConversionFactor(UUID baseUnitId);

    /**
     * Cuenta todas las unidades derivadas (activas e inactivas) de una unidad base.
     * @param baseUnitId ID de la unidad base
     * @return cantidad de unidades derivadas
     */
    @Query("SELECT COUNT(u) FROM MeasurementUnit u WHERE u.baseUnit.id = :baseUnitId")
    long countByBaseUnitId(UUID baseUnitId);
}
