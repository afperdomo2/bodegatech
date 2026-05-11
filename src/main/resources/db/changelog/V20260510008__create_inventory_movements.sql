-- ================================================================
-- V20260510008__create_inventory_movements.sql
-- Inventory movements and movement details
-- ================================================================

CREATE TABLE inventory_movements (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    type                VARCHAR(20)  NOT NULL,
    warehouse_id        UUID        NOT NULL,
    supplier_id         UUID,
    reference_document  VARCHAR(100),
    observations        TEXT,

    created_at          TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT now(),
    version             BIGINT       NOT NULL DEFAULT 0,

    CONSTRAINT pk_inventory_movements PRIMARY KEY (id),
    CONSTRAINT fk_inventory_movements_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id),
    CONSTRAINT fk_inventory_movements_supplier FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE INDEX idx_inventory_movements_warehouse_id ON inventory_movements(warehouse_id);
CREATE INDEX idx_inventory_movements_supplier_id ON inventory_movements(supplier_id);


CREATE TABLE movement_details (
    id              UUID          NOT NULL DEFAULT gen_random_uuid(),
    movement_id     UUID          NOT NULL,
    product_id      UUID          NOT NULL,
    quantity        NUMERIC(19, 4)  NOT NULL,
    previous_stock  NUMERIC(19, 4)  NOT NULL,
    current_stock   NUMERIC(19, 4)  NOT NULL,

    created_at      TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT now(),
    version         BIGINT        NOT NULL DEFAULT 0,

    CONSTRAINT pk_movement_details PRIMARY KEY (id),
    CONSTRAINT fk_movement_details_movement FOREIGN KEY (movement_id)
        REFERENCES inventory_movements(id) ON DELETE CASCADE,
    CONSTRAINT fk_movement_details_product FOREIGN KEY (product_id)
        REFERENCES products(id)
);

CREATE INDEX idx_movement_details_movement_id ON movement_details(movement_id);
CREATE INDEX idx_movement_details_product_id ON movement_details(product_id);