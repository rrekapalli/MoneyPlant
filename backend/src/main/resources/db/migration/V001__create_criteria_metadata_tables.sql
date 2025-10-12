-- Migration V001: Create criteria metadata tables
-- Creates field_metadata, screener_functions, and screener_function_params tables with proper indexes

-- ---------------------------------------------------------------------
-- 1) FIELD METADATA TABLE
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS field_metadata (
    id BIGSERIAL PRIMARY KEY,
    field_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    db_column VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('NUMBER', 'INTEGER', 'STRING', 'DATE', 'BOOLEAN', 'ENUM', 'PERCENT', 'CURRENCY')),
    allowed_operators JSONB,
    category VARCHAR(100),
    description TEXT,
    example_value VARCHAR(500),
    validation_rules JSONB,
    suggestions_api VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for field_metadata
CREATE INDEX IF NOT EXISTS idx_field_metadata_field_name ON field_metadata(field_name);
CREATE INDEX IF NOT EXISTS idx_field_metadata_category ON field_metadata(category);
CREATE INDEX IF NOT EXISTS idx_field_metadata_is_active ON field_metadata(is_active);
CREATE INDEX IF NOT EXISTS idx_field_metadata_data_type ON field_metadata(data_type);

-- ---------------------------------------------------------------------
-- 2) SCREENER FUNCTIONS TABLE
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS screener_functions (
    id BIGSERIAL PRIMARY KEY,
    function_name VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    return_type VARCHAR(50) NOT NULL CHECK (return_type IN ('NUMBER', 'INTEGER', 'STRING', 'DATE', 'BOOLEAN')),
    sql_template TEXT,
    category VARCHAR(100),
    description TEXT,
    examples JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for screener_functions
CREATE INDEX IF NOT EXISTS idx_screener_functions_function_name ON screener_functions(function_name);
CREATE INDEX IF NOT EXISTS idx_screener_functions_category ON screener_functions(category);
CREATE INDEX IF NOT EXISTS idx_screener_functions_is_active ON screener_functions(is_active);
CREATE INDEX IF NOT EXISTS idx_screener_functions_return_type ON screener_functions(return_type);

-- ---------------------------------------------------------------------
-- 3) SCREENER FUNCTION PARAMETERS TABLE
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS screener_function_params (
    id BIGSERIAL PRIMARY KEY,
    function_id BIGINT NOT NULL REFERENCES screener_functions(id) ON DELETE CASCADE,
    param_name VARCHAR(100) NOT NULL,
    param_type VARCHAR(50) NOT NULL CHECK (param_type IN ('NUMBER', 'INTEGER', 'STRING', 'DATE', 'BOOLEAN', 'FIELD_REF', 'FUNCTION_CALL')),
    param_order INTEGER NOT NULL,
    default_value TEXT,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    validation_rules JSONB,
    help_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_function_param_name UNIQUE (function_id, param_name),
    CONSTRAINT uk_function_param_order UNIQUE (function_id, param_order)
);

-- Indexes for screener_function_params
CREATE INDEX IF NOT EXISTS idx_screener_function_params_function_id ON screener_function_params(function_id);
CREATE INDEX IF NOT EXISTS idx_screener_function_params_param_order ON screener_function_params(function_id, param_order);

-- ---------------------------------------------------------------------
-- 4) UPDATE TRIGGERS FOR TIMESTAMPS
-- ---------------------------------------------------------------------

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_field_metadata_updated_at 
    BEFORE UPDATE ON field_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screener_functions_updated_at 
    BEFORE UPDATE ON screener_functions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screener_function_params_updated_at 
    BEFORE UPDATE ON screener_function_params 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();