-- ================================================================
-- V20260510006__create_product_images.sql
-- Product images with Lambda processing status tracking
-- Note: does NOT extend BaseEntity — only id, created_at (no version/updatedAt)
-- ================================================================

CREATE TABLE product_images (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    product_id      UUID        NOT NULL,
    file_key        TEXT          NOT NULL,
    thumbnail_key   TEXT,
    medium_key      TEXT,
    is_main         BOOLEAN       NOT NULL DEFAULT FALSE,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PROCESSING',
    created_at      TIMESTAMP     NOT NULL DEFAULT now(),

    CONSTRAINT pk_product_images PRIMARY KEY (id),
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_product_id_created_at ON product_images(product_id, created_at);
CREATE INDEX idx_product_images_status ON product_images(status);