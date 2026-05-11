package com.afperdomo.bodegatech.module.inventory.repository;

import com.afperdomo.bodegatech.module.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID>, JpaSpecificationExecutor<Inventory> {

    @Query("SELECT i FROM Inventory i WHERE i.id = :id")
    Optional<Inventory> findByIdRaw(UUID id);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM Inventory i WHERE i.product.id = :productId AND i.warehouse.id = :warehouseId")
    boolean existsByProductIdAndWarehouseId(UUID productId, UUID warehouseId);

    Optional<Inventory> findByProductIdAndWarehouseId(UUID productId, UUID warehouseId);
}