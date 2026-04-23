package com.afperdomo.bodegatech.module.unit.service;

import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.module.unit.dto.CreateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.MeasurementUnitDto;
import com.afperdomo.bodegatech.module.unit.dto.UpdateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.mapper.MeasurementUnitMapper;
import com.afperdomo.bodegatech.module.unit.repository.MeasurementUnitRepository;
import com.afperdomo.bodegatech.module.unitconversion.repository.UnitConversionRepository;
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
    private final UnitConversionRepository conversionRepository;
    private final MeasurementUnitMapper unitMapper;

    /**
     * Obtiene todas las unidades activas con paginación.
     */
    @Transactional(readOnly = true)
    public Page<MeasurementUnitDto> findAllUnits(Pageable pageable) {
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

        MeasurementUnit unit = unitMapper.toEntity(request);
        unit = unitRepository.save(unit);

        log.info("Unidad de medida creada: {} ({})", unit.getName(), unit.getAbbreviation());
        return unitMapper.toDto(unit);
    }

    /**
     * Actualiza una unidad de medida existente.
     * Valida unicidad de nombre y abreviación si se modifican.
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

        unitMapper.updateEntity(request, unit);
        unit = unitRepository.save(unit);

        log.info("Unidad de medida actualizada: {} ({})", unit.getName(), unit.getAbbreviation());
        return unitMapper.toDto(unit);
    }

    /**
     * Realiza soft delete de una unidad (desactivación).
     * Valida que no existan factores de conversión que la referencien.
     */
    public void deleteUnit(UUID id) {
        MeasurementUnit unit = unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unidad de medida no encontrada con ID: " + id));

        // Validar que no tenga conversiones asociadas
        if (conversionRepository.existsByUnitId(id)) {
            throw new BusinessException("No se puede eliminar la unidad: existen factores de conversión que la referencian");
        }

        unit.setIsActive(false);
        unitRepository.save(unit);

        log.info("Unidad de medida desactivada: {} ({})", unit.getName(), unit.getAbbreviation());
    }
}
