package com.afperdomo.bodegatech.module.inventorymovement.service;

import com.afperdomo.bodegatech.module.inventory.entity.Inventory;
import com.afperdomo.bodegatech.module.inventory.repository.InventoryRepository;
import com.afperdomo.bodegatech.module.inventorymovement.dto.request.AddMovementDetailsRequest;
import com.afperdomo.bodegatech.module.inventorymovement.dto.request.CreateMovementRequest;
import com.afperdomo.bodegatech.module.inventorymovement.dto.response.InventoryMovementDto;
import com.afperdomo.bodegatech.module.inventorymovement.dto.response.InventoryMovementSummaryDto;
import com.afperdomo.bodegatech.module.inventorymovement.entity.InventoryMovement;
import com.afperdomo.bodegatech.module.inventorymovement.entity.MovementDetail;
import com.afperdomo.bodegatech.module.inventorymovement.entity.MovementType;
import com.afperdomo.bodegatech.module.inventorymovement.mapper.InventoryMovementMapper;
import com.afperdomo.bodegatech.module.inventorymovement.repository.InventoryMovementRepository;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import com.afperdomo.bodegatech.module.supplier.entity.Supplier;
import com.afperdomo.bodegatech.module.supplier.repository.SupplierRepository;
import com.afperdomo.bodegatech.module.warehouse.entity.Warehouse;
import com.afperdomo.bodegatech.module.warehouse.repository.WarehouseRepository;
import com.afperdomo.bodegatech.common.exception.BusinessException;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InventoryMovementService {

    private final InventoryMovementRepository movementRepository;
    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryMovementMapper mapper;

    @Transactional(readOnly = true)
    public Page<InventoryMovementSummaryDto> findAll(Pageable pageable) {
        return movementRepository.findAll(pageable).map(mapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public InventoryMovementDto findById(UUID id) {
        InventoryMovement movement = movementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento de inventario", id));
        return toDto(movement);
    }

    public InventoryMovementDto createMovement(CreateMovementRequest request) {
        log.info("Creando movimiento de inventario. type={}, warehouseId={}, detailCount={}",
                request.getType(), request.getWarehouseId(),
                request.getDetails() != null ? request.getDetails().size() : 0);

        MovementType type = request.getType();

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Bodega", request.getWarehouseId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Proveedor", request.getSupplierId()));
        }

        InventoryMovement movement = InventoryMovement.builder()
                .type(type)
                .warehouse(warehouse)
                .supplier(supplier)
                .referenceDocument(request.getReferenceDocument())
                .observations(request.getObservations())
                .build();

        for (CreateMovementRequest.MovementDetailRequest detailReq : request.getDetails()) {
            addDetail(movement, detailReq.getProductId(), detailReq.getQuantity(), type, warehouse);
        }

        InventoryMovement saved = movementRepository.save(movement);
        log.info("Movimiento creado exitosamente. id={}, detailCount={}", saved.getId(), saved.getDetails().size());

        return toDto(saved);
    }

    public InventoryMovementDto addDetails(UUID movementId, AddMovementDetailsRequest request) {
        log.info("Agregando detalles al movimiento {}. detailCount={}", movementId, request.getDetails().size());

        InventoryMovement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento de inventario", movementId));

        MovementType type = movement.getType();
        Warehouse warehouse = movement.getWarehouse();

        for (AddMovementDetailsRequest.MovementDetailItem detailItem : request.getDetails()) {
            addDetail(movement, detailItem.getProductId(), detailItem.getQuantity(), type, warehouse);
        }

        InventoryMovement saved = movementRepository.save(movement);
        log.info("Detalles agregados al movimiento {}. Total detalles={}", movementId, saved.getDetails().size());

        return toDto(saved);
    }

    private void addDetail(InventoryMovement movement, UUID productId, BigDecimal quantity,
                           MovementType type, Warehouse warehouse) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productId));

        Inventory inventory = inventoryRepository
                .findByProductIdAndWarehouseId(productId, warehouse.getId())
                .orElseGet(() -> createInventory(product, warehouse));

        BigDecimal previousStock = inventory.getQuantity();
        BigDecimal available = previousStock.subtract(inventory.getReservedQuantity());
        BigDecimal currentStock;

        boolean isEntry = isEntryType(type);

        if (!isEntry && available.compareTo(quantity) < 0) {
            throw new BusinessException(
                    "INSUFFICIENT_STOCK",
                    String.format("Stock insuficiente para el producto '%s' en bodega '%s'. Disponible: %s, solicitado: %s",
                            product.getName(), warehouse.getName(), available, quantity)
            );
        }

        if (isEntry) {
            currentStock = previousStock.add(quantity);
        } else {
            currentStock = previousStock.subtract(quantity);
        }

        inventory.setQuantity(currentStock);
        inventory.setLastMovementAt(LocalDateTime.now());
        inventoryRepository.save(inventory);

        MovementDetail detail = MovementDetail.builder()
                .product(product)
                .quantity(quantity)
                .previousStock(previousStock)
                .currentStock(currentStock)
                .build();
        movement.addDetail(detail);
    }

    private boolean isEntryType(MovementType type) {
        return type == MovementType.PURCHASE_ENTRY
                || type == MovementType.TRANSFER_ENTRY
                || type == MovementType.ADJUSTMENT_POS;
    }

    private Inventory createInventory(Product product, Warehouse warehouse) {
        Inventory inventory = Inventory.builder()
                .product(product)
                .warehouse(warehouse)
                .quantity(BigDecimal.ZERO)
                .reservedQuantity(BigDecimal.ZERO)
                .build();
        return inventoryRepository.save(inventory);
    }

    private InventoryMovementDto toDto(InventoryMovement movement) {
        return InventoryMovementDto.builder()
                .id(movement.getId())
                .type(movement.getType().name())
                .createdAt(movement.getCreatedAt())
                .updatedAt(movement.getUpdatedAt())
                .version(movement.getVersion())
                .warehouse(InventoryMovementMapper.warehouseInfo(movement.getWarehouse()))
                .supplier(InventoryMovementMapper.supplierInfo(movement.getSupplier()))
                .referenceDocument(movement.getReferenceDocument())
                .observations(movement.getObservations())
                .detailCount(movement.getDetails() != null ? movement.getDetails().size() : 0)
                .details(movement.getDetails() != null
                        ? movement.getDetails().stream().map(m -> mapper.toDetailDto(m)).toList()
                        : List.of())
                .build();
    }
}