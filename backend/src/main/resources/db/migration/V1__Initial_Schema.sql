-- V1__Initial_Schema.sql
-- Create initial schema for DuyLongTech WMS Project

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    role VARCHAR(50),
    is_prime_member BOOLEAN DEFAULT FALSE,
    prime_expiry TIMESTAMP
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_backup_device BOOLEAN DEFAULT FALSE,
    brand VARCHAR(255),
    model VARCHAR(255),
    sku VARCHAR(255),
    product_condition VARCHAR(50),
    condition_pct INT,
    condition_note TEXT,
    cpu_brand VARCHAR(100),
    cpu_family VARCHAR(100),
    cpu_generation VARCHAR(100),
    cpu_model VARCHAR(100),
    cpu_full_name VARCHAR(255),
    cpu_cores INT,
    cpu_threads INT,
    cpu_base_clock VARCHAR(50),
    cpu_boost_clock VARCHAR(50),
    cpu_tdp VARCHAR(50),
    ram_amount VARCHAR(50),
    ram_type VARCHAR(50),
    ram_speed VARCHAR(50),
    ram_slots BOOLEAN,
    storage_main VARCHAR(100),
    storage_type VARCHAR(50),
    storage_extra VARCHAR(100),
    storage_slot BOOLEAN,
    display_size VARCHAR(50),
    display_res VARCHAR(50),
    display_panel VARCHAR(50),
    display_hz VARCHAR(50),
    display_touch BOOLEAN,
    gpu_type VARCHAR(50),
    gpu_name VARCHAR(255),
    ports TEXT,
    battery VARCHAR(100),
    weight VARCHAR(50),
    os VARCHAR(100),
    keyboard VARCHAR(100),
    base_price DECIMAL(19, 2),
    min_price DECIMAL(19, 2),
    cost_price DECIMAL(19, 2),
    price_negotiable BOOLEAN,
    call_for_price BOOLEAN,
    price_note TEXT,
    warranty_type VARCHAR(50),
    warranty_months INT,
    warranty_start_date DATE,
    warranty_end_date DATE,
    warranty_note TEXT,
    warranty_void_if_open BOOLEAN,
    serial_number VARCHAR(255),
    imei VARCHAR(255),
    status VARCHAR(50),
    quantity INT,
    category_id BIGINT,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(255),
    shipping_address TEXT,
    total_amount DECIMAL(19, 2),
    status VARCHAR(50),
    created_at TIMESTAMP,
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    quantity INT,
    price DECIMAL(19, 2),
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    type VARCHAR(50)
);

CREATE TABLE bin_locations (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    bin_code VARCHAR(100) NOT NULL,
    zone_name VARCHAR(255),
    zone_type VARCHAR(100) NOT NULL,
    storage_note TEXT,
    requires_esd_protection BOOLEAN,
    requires_anti_static_bag BOOLEAN,
    max_humidity_percent INT,
    requires_lock BOOLEAN,
    max_capacity INT,
    current_count INT,
    is_active BOOLEAN,
    UNIQUE (warehouse_id, bin_code),
    CONSTRAINT fk_bin_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE TABLE product_serials (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    serial_number VARCHAR(255) NOT NULL,
    imei VARCHAR(255),
    bin_location_id BIGINT,
    lifecycle_status VARCHAR(50) NOT NULL,
    supplier VARCHAR(255),
    purchase_invoice VARCHAR(255),
    warranty_type VARCHAR(50),
    warranty_start DATE,
    warranty_end DATE,
    sold_to_user_id BIGINT,
    sold_at TIMESTAMP,
    sale_order_code VARCHAR(100),
    added_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    tech_note TEXT,
    CONSTRAINT fk_serial_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_serial_bin FOREIGN KEY (bin_location_id) REFERENCES bin_locations(id),
    CONSTRAINT fk_serial_customer FOREIGN KEY (sold_to_user_id) REFERENCES users(id)
);
CREATE INDEX idx_ps_serial ON product_serials(serial_number);

CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    quantity_change INT NOT NULL,
    item_status VARCHAR(50) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    reference_id VARCHAR(100),
    performed_by VARCHAR(255),
    note TEXT,
    supplier VARCHAR(255),
    unit_price DECIMAL(19, 2),
    unit_of_measure VARCHAR(50),
    movement_date TIMESTAMP NOT NULL,
    CONSTRAINT fk_sm_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_sm_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);
CREATE INDEX idx_sm_product ON stock_movements(product_id);
CREATE INDEX idx_sm_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_sm_date ON stock_movements(movement_date);

CREATE TABLE device_components (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255),
    manufacturer VARCHAR(255),
    specs TEXT,
    status VARCHAR(50) NOT NULL,
    tech_note TEXT,
    CONSTRAINT fk_comp_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE rma_tickets (
    id BIGSERIAL PRIMARY KEY,
    rma_code VARCHAR(100) NOT NULL UNIQUE,
    rma_type VARCHAR(50) NOT NULL,
    product_id BIGINT,
    component_id BIGINT,
    customer_id BIGINT,
    serial_number VARCHAR(255),
    physical_condition_note TEXT,
    evidence_photo_urls TEXT,
    fault_type VARCHAR(50) NOT NULL,
    fault_description TEXT,
    warranty_decision VARCHAR(50) NOT NULL,
    warranty_exclusion_reason TEXT,
    status VARCHAR(50) NOT NULL,
    vendor_name VARCHAR(255),
    vendor_ticket_code VARCHAR(255),
    vendor_sent_date DATE,
    vendor_expected_return_date DATE,
    vendor_actual_return_date DATE,
    estimated_cost DECIMAL(19, 2),
    actual_cost DECIMAL(19, 2),
    is_paid_by_customer BOOLEAN,
    received_by VARCHAR(255),
    technician_note TEXT,
    received_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    closed_at TIMESTAMP,
    CONSTRAINT fk_rma_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_rma_component FOREIGN KEY (component_id) REFERENCES device_components(id),
    CONSTRAINT fk_rma_customer FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE TABLE sos_tickets (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    backup_device_id BIGINT,
    status VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_sos_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_sos_backup FOREIGN KEY (backup_device_id) REFERENCES products(id)
);

CREATE TABLE shipper_wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(19, 2) NOT NULL DEFAULT 0,
    total_collected DECIMAL(19, 2) NOT NULL DEFAULT 0,
    total_settled DECIMAL(19, 2) NOT NULL DEFAULT 0,
    delivery_count INT DEFAULT 0,
    last_delivery_at TIMESTAMP,
    last_settled_at TIMESTAMP,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transaction_logs (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    balance_before DECIMAL(19, 2),
    balance_after DECIMAL(19, 2),
    order_id VARCHAR(100),
    note TEXT,
    performed_by VARCHAR(255),
    proof_image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_log_wallet FOREIGN KEY (wallet_id) REFERENCES shipper_wallets(id)
);

CREATE TABLE site_settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value TEXT,
    description TEXT
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(100),
    customer_id BIGINT,
    product_id BIGINT,
    type VARCHAR(50),
    status VARCHAR(50),
    issue_description TEXT,
    rejected_reason TEXT,
    appointment_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_ticket_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_ticket_product FOREIGN KEY (product_id) REFERENCES products(id)
);
