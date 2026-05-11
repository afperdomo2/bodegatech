-- ================================================================
-- V20260510007__create_inventories.sql
-- Inventory tracking per product and warehouse
-- ================================================================

CREATE TABLE inventories (
    id                UUID          NOT NULL DEFAULT gen_random_uuid(),
    product_id        UUID          NOT NULL,
    warehouse_id      UUID          NOT NULL,
    quantity          NUMERIC(19, 4)  NOT NULL DEFAULT 0,
    reserved_quantity NUMERIC(19, 4)  NOT NULL DEFAULT 0,
    last_movement_at  TIMESTAMP,

    created_at        TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP     NOT NULL DEFAULT now(),
    version           BIGINT        NOT NULL DEFAULT 0,

    CONSTRAINT pk_inventories PRIMARY KEY (id),
    CONSTRAINT uk_inventory_product_warehouse UNIQUE (product_id, warehouse_id),
    CONSTRAINT fk_inventories_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventories_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id) ON DELETE CASCADE
);

CREATE INDEX idx_inventories_warehouse_id ON inventories(warehouse_id);
CREATE INDEX idx_inventories_product_id ON inventories(product_id);