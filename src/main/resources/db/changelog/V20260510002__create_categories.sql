-- ================================================================
-- V20260510002__create_categories.sql
-- Product categories table
-- ================================================================

CREATE TABLE categories (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,

    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT now(),
    version     BIGINT       NOT NULL DEFAULT 0,

    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT u_categories_name UNIQUE (name)
);

CREATE INDEX idx_categories_is_active ON categories(is_active);