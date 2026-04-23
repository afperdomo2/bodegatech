package com.afperdomo.bodegatech.module.unitconversion.service;

import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import com.afperdomo.bodegatech.module.unit.repository.MeasurementUnitRepository;
import com.afperdomo.bodegatech.module.unitconversion.dto.CreateUnitConversionRequest;
import com.afperdomo.bodegatech.module.unitconversion.dto.UnitConversionDto;
import com.afperdomo.bodegatech.module.unitconversion.dto.UpdateUnitConversionRequest;
import com.afperdomo.bodegatech.module.unitconversion.entity.UnitConversion;
import com.afperdomo.bodegatech.module.unitconversion.mapper.UnitConversionMapper;
import com.afperdomo.bodegatech.module.unitconversion.repository.UnitConversionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Servicio de negocio para factores de conversión de unidades.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UnitConversionService {

    private final UnitConversionRepository conversionRepository;
    private final MeasurementUnitRepository unitRepository;
    private final UnitConversionMapper conversionMapper;

    /**
     * Obtiene todos los factores de conversión con paginación.
     */
    @Transactional(readOnly = true)
    public Page<UnitConversionDto> findAllConversions(Pageable pageable) {
        return conversionRepository.findAll(pageable).map(conversionMapper::toDto);
    }

    /**
     * Obtiene un factor de conversión por ID.
     */
    @Transactional(readOnly = true)
    public UnitConversionDto findConversionById(UUID id) {
        UnitConversion conversion = conversionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factor de conversión no encontrado con ID: " + id));
        return conversionMapper.toDto(conversion);
    }

    /**
     * Crea un nuevo factor de conversión.
     * Valida que ambas unidades existan, estén activas, sean diferentes, y que no exista ya esa conversión.
     */
    public UnitConversionDto createConversion(CreateUnitConversionRequest request) {
        // Validar que las unidades sean diferentes
        if (request.getFromUnitId().equals(request.getToUnitId())) {
            throw new BusinessException("Las unidades origen y destino no pueden ser la misma");
        }

        // Obtener y validar unidad origen
        MeasurementUnit fromUnit = unitRepository.findByIdActive(request.getFromUnitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unidad de origen no encontrada o no activa: " + request.getFromUnitId()));

        // Obtener y validar unidad destino
        MeasurementUnit toUnit = unitRepository.findByIdActive(request.getToUnitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unidad de destino no encontrada o no activa: " + request.getToUnitId()));

        // Validar que no exista ya esa conversión
        conversionRepository.findByFromUnitIdAndToUnitId(request.getFromUnitId(), request.getToUnitId())
            .ifPresent(existing -> {
                throw new BusinessException("Ya existe un factor de conversión de " + fromUnit.getAbbreviation() 
                    + " a " + toUnit.getAbbreviation());
            });

        // Crear la conversión
        UnitConversion conversion = conversionMapper.toEntity(request);
        conversion.setFromUnit(fromUnit);
        conversion.setToUnit(toUnit);
        conversion = conversionRepository.save(conversion);

        log.info("Factor de conversión creado: {} {} → {} {}", 
            conversion.getFactor(), fromUnit.getAbbreviation(), toUnit.getAbbreviation(), toUnit.getAbbreviation());
        return conversionMapper.toDto(conversion);
    }

    /**
     * Actualiza un factor de conversión existente.
     * Solo permite cambiar el factor, no las unidades.
     */
    public UnitConversionDto updateConversion(UUID id, UpdateUnitConversionRequest request) {
        UnitConversion conversion = conversionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factor de conversión no encontrado con ID: " + id));

        conversionMapper.updateEntity(request, conversion);
        conversion = conversionRepository.save(conversion);

        log.info("Factor de conversión actualizado: {} {} → {}", 
            conversion.getFactor(), conversion.getFromUnit().getAbbreviation(), conversion.getToUnit().getAbbreviation());
        return conversionMapper.toDto(conversion);
    }

    /**
     * Elimina un factor de conversión (hard delete).
     */
    public void deleteConversion(UUID id) {
        UnitConversion conversion = conversionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factor de conversión no encontrado con ID: " + id));

        conversionRepository.delete(conversion);

        log.info("Factor de conversión eliminado: {} {} → {}", 
            conversion.getFactor(), conversion.getFromUnit().getAbbreviation(), conversion.getToUnit().getAbbreviation());
    }
}
