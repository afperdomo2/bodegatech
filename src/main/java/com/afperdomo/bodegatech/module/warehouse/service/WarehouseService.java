package com.afperdomo.bodegatech.module.warehouse.service;

import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.exception.WarehouseCodeAlreadyExistsException;
import com.afperdomo.bodegatech.module.warehouse.dto.request.CreateWarehouseRequest;
import com.afperdomo.bodegatech.module.warehouse.dto.request.UpdateWarehouseRequest;
import com.afperdomo.bodegatech.module.warehouse.dto.response.WarehouseDto;
import com.afperdomo.bodegatech.module.warehouse.entity.Warehouse;
import com.afperdomo.bodegatech.module.warehouse.mapper.WarehouseMapper;
import com.afperdomo.bodegatech.module.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    @Transactional(readOnly = true)
    public Page<WarehouseDto> findAllWarehouses(Pageable pageable, Boolean isActive) {
        Page<Warehouse> page;
        if (isActive == null) {
            page = warehouseRepository.findAll(pageable);
        } else if (isActive) {
            page = warehouseRepository.findAllActive(pageable);
        } else {
            page = warehouseRepository.findAllInactive(pageable);
        }
        return page.map(warehouseMapper::toDto);
    }

    @Transactional(readOnly = true)
    public WarehouseDto findWarehouseById(UUID id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bodega", id));
        return warehouseMapper.toDto(warehouse);
    }

    public WarehouseDto createWarehouse(CreateWarehouseRequest request) {
        if (warehouseRepository.findByCode(request.getCode()).isPresent()) {
            throw new WarehouseCodeAlreadyExistsException(request.getCode());
        }

        Warehouse warehouse = warehouseMapper.toEntity(request);
        warehouse = warehouseRepository.save(warehouse);
        log.info("Warehouse created with ID: {}", warehouse.getId());
        return warehouseMapper.toDto(warehouse);
    }

    public WarehouseDto updateWarehouse(UUID id, UpdateWarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bodega", id));

        if (request.getCode() != null && !request.getCode().equals(warehouse.getCode())) {
            if (warehouseRepository.existsByCodeAndIdNot(request.getCode(), id)) {
                throw new WarehouseCodeAlreadyExistsException(request.getCode());
            }
        }

        warehouseMapper.updateEntity(request, warehouse);
        warehouse = warehouseRepository.save(warehouse);
        log.info("Warehouse updated with ID: {}", id);
        return warehouseMapper.toDto(warehouse);
    }

    public void deleteWarehouse(UUID id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bodega", id));
        warehouseRepository.delete(warehouse);
        log.info("Warehouse deleted with ID: {}", id);
    }
}
