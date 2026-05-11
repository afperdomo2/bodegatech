-- ================================================================
-- V20260510001__create_measurement_units.sql
-- Measurement Units table with self-referencing base unit support
-- ================================================================

CREATE TABLE measurement_units (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    abbreviation    VARCHAR(20)  NOT NULL,
    type            VARCHAR(30)  NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_base_unit    BOOLEAN      NOT NULL DEFAULT FALSE,
    base_unit_id    UUID,
    conversion_factor NUMERIC(19, 10),

    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now(),
    version         BIGINT       NOT NULL DEFAULT 0,

    CONSTRAINT pk_measurement_units PRIMARY KEY (id),
    CONSTRAINT u_measurement_units_name UNIQUE (name),
    CONSTRAINT u_measurement_units_abbreviation UNIQUE (abbreviation),
    CONSTRAINT fk_measurement_units_base_unit FOREIGN KEY (base_unit_id)
        REFERENCES measurement_units(id) ON DELETE SET NULL
);

CREATE INDEX idx_units_type ON measurement_units(type);
CREATE INDEX idx_units_is_active ON measurement_units(is_active);
CREATE INDEX idx_units_base_unit_id ON measurement_units(base_unit_id);
CREATE INDEX idx_units_is_base_unit ON measurement_units(is_base_unit);