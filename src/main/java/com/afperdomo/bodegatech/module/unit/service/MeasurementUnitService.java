package com.afperdomo.bodegatech.module.unit.service;

import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.module.unit.dto.CreateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.MeasurementUnitDto;
import com.afperdomo.bodegatech.module.unit.dto.UpdateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.mapper.MeasurementUnitMapper;
import com.afperdomo.bodegatech.module.unit.repository.MeasurementUnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * Obtiene todas las unidades activas con paginación.
     * Opcionalmente filtra solo las unidades base si isBase es true.
     *
     * @param pageable configuración de paginación
     * @param isBase   si es null/false lista todas las activas;
     *                 si es true, solo las unidades base
     * @return página de unidades
     */
    @Transactional(readOnly = true)
    public Page<MeasurementUnitDto> findAllUnits(Pageable pageable, Boolean isBase) {
        if (Boolean.TRUE.equals(isBase)) {
            return unitRepository.findAllBaseUnits(pageable).map(unitMapper::toDto);
        }
        return unitRepository.findAllActive(pageable).map(unitMapper::toDto);
    }

    /**
     * Obtiene una unidad por ID.
     */
    @Transactional(readOnly = true)
    public MeasurementUnitDto findUnitById(UUID id) {
        MeasurementUnit unit = unitRepository.findByIdActive(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unidad de medida no encontrada con ID: " + id));
        return unitMapper.toDto(unit);
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

            if (!baseUnit.isBase()) {
                throw new BusinessException("La unidad base debe tener isBase = true");
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
        if (request.getIsBaseUnit() != null && !request.getIsBaseUnit().equals(unit.isBase())) {
            throw new BusinessException("No se puede cambiar isBaseUnit después de crear la unidad");
        }

        if (request.getBaseUnitId() != null && 
            (unit.getBaseUnit() == null || !request.getBaseUnitId().equals(unit.getBaseUnit().getId()))) {
            throw new BusinessException("No se puede cambiar baseUnitId después de crear la unidad");
        }

        // Validar que si conversionFactor se actualiza, la unidad no sea base
        if (request.getConversionFactor() != null && unit.isBase()) {
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
}
