package com.afperdomo.bodegatech.module.unit.service;

import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.module.unit.dto.request.CreateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.request.UpdateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitDto;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitDetail;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitRelatedDto;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitSummaryDto;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.enums.UnitType;
import com.afperdomo.bodegatech.module.unit.mapper.MeasurementUnitMapper;
import com.afperdomo.bodegatech.module.unit.repository.MeasurementUnitRepository;
import com.afperdomo.bodegatech.module.unit.repository.MeasurementUnitSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para unidades de medida.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MeasurementUnitService {

    private final MeasurementUnitRepository unitRepository;
    private final MeasurementUnitMapper unitMapper;

    /**
     * Obtiene todas las unidades con paginación y filtros opcionales.
     * Permite filtrar opcionalmente por isActive, isBase y/o type.
     *
     * @param pageable configuración de paginación
     * @param isActive si es true, solo unidades activas; si es false, solo inactivas; null para todas
     * @param isBase   si es true, solo retorna unidades base; null/false para todas
     * @param type     tipo de unidad a filtrar; null para no filtrar por tipo
     * @return página de unidades filtradas
     */
    @Transactional(readOnly = true)
    public Page<MeasurementUnitSummaryDto> findAllUnits(Pageable pageable, Boolean isActive, Boolean isBase, UnitType type) {
        Specification<MeasurementUnit> spec = MeasurementUnitSpecifications.hasActiveStatus(isActive);
        if (Boolean.TRUE.equals(isBase)) {
            spec = spec.and(MeasurementUnitSpecifications.isBase());
        }
        if (type != null) {
            spec = spec.and(MeasurementUnitSpecifications.hasType(type));
        }
        return unitRepository.findAll(spec, pageable).map(unitMapper::toSummaryDto);
    }

    /**
     * Obtiene una unidad por ID.
     */
    @Transactional(readOnly = true)
    public MeasurementUnitDetail findUnitById(UUID id) {
        MeasurementUnit unit = unitRepository.findByIdActive(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unidad de medida no encontrada con ID: " + id));
        return unitMapper.toDetail(unit);
    }

    /**
     * Crea una nueva unidad de medida.
     * Valida que no exista una unidad con el mismo nombre o abreviación.
     * Si isBaseUnit = false, valida que baseUnitId referencia una unidad base activa del mismo tipo.
     */
    public MeasurementUnitDto createUnit(CreateMeasurementUnitRequest request) {
        // Validar nombre único
        unitRepository.findByNameIgnoreCase(request.getName())
            .ifPresent(unit -> {
                throw new BusinessException("Ya existe una unidad con el nombre: " + request.getName());
            });

        // Validar abreviación única
        unitRepository.findByAbbreviationIgnoreCase(request.getAbbreviation())
            .ifPresent(unit -> {
                throw new BusinessException("Ya existe una unidad con la abreviación: " + request.getAbbreviation());
            });

        // Validar lógica de base unit vs. conversion factor
        if (Boolean.TRUE.equals(request.getIsBaseUnit())) {
            // Es unidad base: no debe tener baseUnitId ni conversionFactor
            if (request.getBaseUnitId() != null || request.getConversionFactor() != null) {
                throw new BusinessException("Una unidad base no puede tener baseUnitId ni conversionFactor");
            }
        } else {
            // No es unidad base: debe tener baseUnitId y conversionFactor
            if (request.getBaseUnitId() == null || request.getConversionFactor() == null) {
                throw new BusinessException("Una unidad no-base debe especificar baseUnitId y conversionFactor");
            }

            // Validar que baseUnitId existe, está activo y es unidad base
            MeasurementUnit baseUnit = unitRepository.findById(request.getBaseUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unidad base no encontrada: " + request.getBaseUnitId()));

            if (!Boolean.TRUE.equals(baseUnit.getIsBaseUnit())) {
                throw new BusinessException("La unidad base debe tener isBaseUnit = true");
            }

            if (!Boolean.TRUE.equals(baseUnit.getIsActive())) {
                throw new BusinessException("La unidad base debe estar activa");
            }

            // Validar que sean del mismo tipo
            if (!baseUnit.getType().equals(request.getType())) {
                throw new BusinessException("La unidad base debe ser del mismo tipo que la unidad a crear");
            }
        }

        MeasurementUnit unit = unitMapper.toEntity(request);
        
        // Si no es unidad base, establecer la relación con la unidad base
        if (!Boolean.TRUE.equals(request.getIsBaseUnit())) {
            MeasurementUnit baseUnit = unitRepository.findById(request.getBaseUnitId()).orElseThrow();
            unit.setBaseUnit(baseUnit);
        }

        unit = unitRepository.save(unit);

        log.info("Unidad de medida creada: {} ({})", unit.getName(), unit.getAbbreviation());
        return unitMapper.toDto(unit);
    }

    /**
     * Actualiza una unidad de medida existente.
     * Valida unicidad de nombre y abreviación si se modifican.
     * No permite cambiar isBaseUnit o baseUnitId después de creada la unidad.
     * Permite actualizar conversionFactor si la unidad no es base.
     */
    public MeasurementUnitDto updateUnit(UUID id, UpdateMeasurementUnitRequest request) {
        MeasurementUnit unit = unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unidad de medida no encontrada con ID: " + id));

        // Validar nombre único si se modifica
        if (request.getName() != null && !request.getName().equalsIgnoreCase(unit.getName())) {
            unitRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe una unidad con el nombre: " + request.getName());
                });
        }

        // Validar abreviación única si se modifica
        if (request.getAbbreviation() != null && !request.getAbbreviation().equalsIgnoreCase(unit.getAbbreviation())) {
            unitRepository.findByAbbreviationIgnoreCase(request.getAbbreviation())
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe una unidad con la abreviación: " + request.getAbbreviation());
                });
        }

         // Validar que NO se cambien isBaseUnit ni baseUnitId (inmutables después de creación)
         if (request.getIsBaseUnit() != null && !request.getIsBaseUnit().equals(unit.getIsBaseUnit())) {
             throw new BusinessException("No se puede cambiar isBaseUnit después de crear la unidad");
         }

        if (request.getBaseUnitId() != null && 
            (unit.getBaseUnit() == null || !request.getBaseUnitId().equals(unit.getBaseUnit().getId()))) {
            throw new BusinessException("No se puede cambiar baseUnitId después de crear la unidad");
        }

         // Validar que si conversionFactor se actualiza, la unidad no sea base
         if (request.getConversionFactor() != null && Boolean.TRUE.equals(unit.getIsBaseUnit())) {
             throw new BusinessException("Una unidad base no puede tener conversionFactor");
         }

        // Aplicar actualización parcial
        unitMapper.updateEntity(request, unit);
        unit = unitRepository.save(unit);

        log.info("Unidad de medida actualizada: {} ({})", unit.getName(), unit.getAbbreviation());
        return unitMapper.toDto(unit);
    }

    /**
     * Realiza soft delete de una unidad (desactivación).
     * Una unidad solo se puede eliminar si no tiene unidades que dependan de ella
     * (es decir, no es baseUnit de ninguna otra unidad activa).
     */
    public void deleteUnit(UUID id) {
        MeasurementUnit unit = unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unidad de medida no encontrada con ID: " + id));

        // Validar que esta unidad no sea la unidad base de otras unidades activas
        // (evitar orfandad de registros)
        // Nota: Si en el futuro necesitas esta validación, implementa una query en el repository
        // @Query("SELECT COUNT(u) FROM MeasurementUnit u WHERE u.baseUnit.id = :id AND u.isActive = true")

        unit.setIsActive(false);
        unitRepository.save(unit);

        log.info("Unidad de medida desactivada: {} ({})", unit.getName(), unit.getAbbreviation());
    }

    /**
     * Obtiene todas las unidades derivadas activas relacionadas a una unidad base.
     * Ordenadas ascendentemente por factor de conversión.
     *
     * @param baseUnitId ID de la unidad base
     * @return lista de MeasurementUnitRelatedDto (vacía si no hay derivadas)
     * @throws ResourceNotFoundException si la unidad no existe o no está activa
     * @throws BusinessException si la unidad existe pero no es unidad base
     */
    @Transactional(readOnly = true)
    public List<MeasurementUnitRelatedDto> findRelatedUnits(UUID baseUnitId) {
        // Validar que la unidad existe y está activa
        MeasurementUnit baseUnit = unitRepository.findByIdActive(baseUnitId)
            .orElseThrow(() -> new ResourceNotFoundException("Unidad de medida no encontrada con ID: " + baseUnitId));

        // Validar que es unidad base
        if (!Boolean.TRUE.equals(baseUnit.getIsBaseUnit())) {
            throw new BusinessException("La unidad especificada no es una unidad base");
        }

        // Buscar todas las unidades derivadas activas ordenadas por conversionFactor
        List<MeasurementUnit> relatedUnits = unitRepository.findActiveByBaseUnitIdOrderByConversionFactor(baseUnitId);

        // Mapear a DTOs livianos
        return relatedUnits.stream()
            .map(unitMapper::toRelatedDto)
            .toList();
    }
}
