package com.afperdomo.bodegatech.module.inventory.service;

import com.afperdomo.bodegatech.module.inventory.dto.response.InventoryDto;
import com.afperdomo.bodegatech.module.inventory.dto.response.InventorySummaryDto;
import com.afperdomo.bodegatech.module.inventory.entity.Inventory;
import com.afperdomo.bodegatech.module.inventory.mapper.InventoryMapper;
import com.afperdomo.bodegatech.module.inventory.repository.InventoryRepository;
import com.afperdomo.bodegatech.module.inventory.repository.InventorySpecifications;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    @Transactional(readOnly = true)
    public Page<InventorySummaryDto> findAll(Pageable pageable, UUID warehouseId, UUID productId, Boolean lowStock) {
        log.info("Obteniendo inventario. warehouseId={}, productId={}, lowStock={}, page={}, size={}",
                warehouseId, productId, lowStock, pageable.getPageNumber(), pageable.getPageSize());

        Specification<Inventory> spec = Specification.allOf(
                InventorySpecifications.hasWarehouseId(warehouseId),
                InventorySpecifications.hasProductId(productId)
        );

        if (lowStock != null && lowStock) {
            spec = spec.and(InventorySpecifications.hasLowStock());
        }

        return inventoryRepository.findAll(spec, pageable)
                .map(inventoryMapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public InventoryDto findById(UUID id) {
        log.info("Obteniendo inventario con ID: {}", id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario", id));

        return toInventoryDto(inventory);
    }

    private InventoryDto toInventoryDto(Inventory inventory) {
        BigDecimal available = inventory.getQuantity().subtract(inventory.getReservedQuantity());

        return InventoryDto.builder()
                .id(inventory.getId())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .version(inventory.getVersion())
                .product(inventoryMapper.productInfo(inventory.getProduct()))
                .warehouse(InventoryMapper.warehouseInfo(inventory.getWarehouse()))
                .quantity(inventory.getQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .availableQuantity(available)
                .lastMovementAt(inventory.getLastMovementAt())
                .build();
    }
}