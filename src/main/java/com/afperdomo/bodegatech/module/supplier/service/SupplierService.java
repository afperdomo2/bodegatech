package com.afperdomo.bodegatech.module.supplier.service;

import com.afperdomo.bodegatech.common.exception.NitAlreadyExistsException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.module.supplier.dto.request.CreateSupplierRequest;
import com.afperdomo.bodegatech.module.supplier.dto.request.UpdateSupplierRequest;
import com.afperdomo.bodegatech.module.supplier.dto.response.SupplierDto;
import com.afperdomo.bodegatech.module.supplier.entity.Supplier;
import com.afperdomo.bodegatech.module.supplier.mapper.SupplierMapper;
import com.afperdomo.bodegatech.module.supplier.repository.SupplierRepository;
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
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Transactional(readOnly = true)
    public Page<SupplierDto> findAllSuppliers(Pageable pageable, Boolean isActive) {
        Page<Supplier> page;
        if (isActive == null) {
            page = supplierRepository.findAll(pageable);
        } else if (isActive) {
            page = supplierRepository.findAllActive(pageable);
        } else {
            page = supplierRepository.findAllInactive(pageable);
        }
        return page.map(supplierMapper::toDto);
    }

    @Transactional(readOnly = true)
    public SupplierDto findSupplierById(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));
        return supplierMapper.toDto(supplier);
    }

    public SupplierDto createSupplier(CreateSupplierRequest request) {
        if (supplierRepository.findByNit(request.getNit()).isPresent()) {
            throw new NitAlreadyExistsException(request.getNit());
        }

        Supplier supplier = supplierMapper.toEntity(request);
        supplier = supplierRepository.save(supplier);
        log.info("Supplier created with ID: {}", supplier.getId());
        return supplierMapper.toDto(supplier);
    }

    public SupplierDto updateSupplier(UUID id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));

        if (request.getNit() != null && !request.getNit().equals(supplier.getNit())) {
            if (supplierRepository.existsByNitAndIdNot(request.getNit(), id)) {
                throw new NitAlreadyExistsException(request.getNit());
            }
        }

        supplierMapper.updateEntity(request, supplier);
        supplier = supplierRepository.save(supplier);
        log.info("Supplier updated with ID: {}", id);
        return supplierMapper.toDto(supplier);
    }

    public void deleteSupplier(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));
        supplierRepository.delete(supplier);
        log.info("Supplier deleted with ID: {}", id);
    }
}
