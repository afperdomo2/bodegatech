package com.afperdomo.bodegatech.module.inventorymovement.repository;

import com.afperdomo.bodegatech.module.inventorymovement.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, UUID> {
}