-- ================================================================
-- V20260510003__create_suppliers.sql
-- Suppliers table
-- ================================================================

CREATE TABLE suppliers (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    nit             VARCHAR(50)   NOT NULL,
    contact_name    VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30)  NOT NULL,
    address         TEXT          NOT NULL,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now(),
    version         BIGINT       NOT NULL DEFAULT 0,

    CONSTRAINT pk_suppliers PRIMARY KEY (id),
    CONSTRAINT u_suppliers_nit UNIQUE (nit)
);

CREATE INDEX idx_suppliers_nit ON suppliers(nit);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);