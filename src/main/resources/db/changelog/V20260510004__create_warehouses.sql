-- ================================================================
-- V20260510004__create_warehouses.sql
-- Warehouses table
-- ================================================================

CREATE TABLE warehouses (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(50)  NOT NULL,
    location    TEXT,
    description TEXT          NOT NULL,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,

    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT now(),
    version     BIGINT       NOT NULL DEFAULT 0,

    CONSTRAINT pk_warehouses PRIMARY KEY (id),
    CONSTRAINT u_warehouses_code UNIQUE (code)
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);