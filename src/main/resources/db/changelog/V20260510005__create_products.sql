-- ================================================================
-- V20260510005__create_products.sql
-- Products table with category, unit, and supplier references
-- ================================================================

CREATE TABLE products (
    id          UUID          NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    sale_price  NUMERIC(19, 4)  NOT NULL,
    cost_price  NUMERIC(19, 4)  NOT NULL,
    min_stock   NUMERIC(19, 4),
    max_stock   NUMERIC(19, 4),
    sku         VARCHAR(100)   NOT NULL,
    category_id UUID           NOT NULL,
    unit_id     UUID           NOT NULL,
    supplier_id UUID,
    main_image_key TEXT,
    barcode     VARCHAR(100),
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at  TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT now(),
    version     BIGINT          NOT NULL DEFAULT 0,

    CONSTRAINT pk_products PRIMARY KEY (id),
    CONSTRAINT u_products_sku UNIQUE (sku),
    CONSTRAINT u_products_barcode UNIQUE (barcode),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES categories(id),
    CONSTRAINT fk_products_unit FOREIGN KEY (unit_id)
        REFERENCES measurement_units(id),
    CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_unit_id ON products(unit_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);