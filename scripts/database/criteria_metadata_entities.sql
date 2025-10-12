-- Migration script for criteria metadata entities
-- Adds field_metadata, screener_functions, and screener_function_params tables

-- ---------------------------------------------------------------------
-- 1) FIELD METADATA
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS field_metadata (
  field_metadata_id BIGSERIAL PRIMARY KEY,
  field_name        VARCHAR(100) NOT NULL UNIQUE,
  display_name      VARCHAR(200) NOT NULL,
  data_type         VARCHAR(50) NOT NULL,
  category          VARCHAR(100),
  description       TEXT,
  example_value     VARCHAR(500),
  validation_rules  JSONB,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order        INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_field_metadata_category ON field_metadata(category);
CREATE INDEX IF NOT EXISTS idx_field_metadata_is_active ON field_metadata(is_active);

-- ---------------------------------------------------------------------
-- 2) SCREENER FUNCTIONS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS screener_functions (
  function_id       BIGSERIAL PRIMARY KEY,
  function_name     VARCHAR(100) NOT NULL UNIQUE,
  display_name      VARCHAR(200) NOT NULL,
  sql_template      TEXT NOT NULL,
  category          VARCHAR(100),
  description       TEXT,
  examples          JSONB,
  return_type       VARCHAR(50) NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order        INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screener_functions_category ON screener_functions(category);
CREATE INDEX IF NOT EXISTS idx_screener_functions_is_active ON screener_functions(is_active);

-- ---------------------------------------------------------------------
-- 3) SCREENER FUNCTION PARAMETERS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS screener_function_params (
  param_id          BIGSERIAL PRIMARY KEY,
  function_id       BIGINT NOT NULL REFERENCES screener_functions(function_id) ON DELETE CASCADE,
  param_name        VARCHAR(100) NOT NULL,
  display_name      VARCHAR(200) NOT NULL,
  data_type         VARCHAR(50) NOT NULL,
  is_required       BOOLEAN NOT NULL DEFAULT TRUE,
  default_value     VARCHAR(500),
  param_order       INT NOT NULL,
  validation_rules  JSONB,
  help_text         TEXT,
  example_value     VARCHAR(500),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screener_function_params_function_id ON screener_function_params(function_id);
CREATE INDEX IF NOT EXISTS idx_screener_function_params_param_order ON screener_function_params(function_id, param_order);

-- ---------------------------------------------------------------------
-- 4) SAMPLE DATA FOR FIELD METADATA
-- ---------------------------------------------------------------------

INSERT INTO field_metadata (field_name, display_name, data_type, category, description, example_value, validation_rules, sort_order) VALUES
('market_cap', 'Market Capitalization', 'NUMBER', 'Valuation', 'Total market value of company shares', '50000000000', '{"min": 0, "unit": "INR"}', 1),
('pe_ratio', 'P/E Ratio', 'NUMBER', 'Valuation', 'Price to Earnings ratio', '15.5', '{"min": 0}', 2),
('pb_ratio', 'P/B Ratio', 'NUMBER', 'Valuation', 'Price to Book ratio', '2.3', '{"min": 0}', 3),
('debt_to_equity', 'Debt to Equity', 'NUMBER', 'Financial', 'Debt to Equity ratio', '0.45', '{"min": 0}', 4),
('roe', 'Return on Equity', 'NUMBER', 'Financial', 'Return on Equity percentage', '18.5', '{"unit": "%"}', 5),
('revenue_growth', 'Revenue Growth', 'NUMBER', 'Growth', 'Year over year revenue growth', '12.3', '{"unit": "%"}', 6),
('sector', 'Sector', 'STRING', 'Classification', 'Industry sector classification', 'Technology', '{}', 7),
('price', 'Current Price', 'NUMBER', 'Price', 'Current stock price', '1250.75', '{"min": 0, "unit": "INR"}', 8)
ON CONFLICT (field_name) DO NOTHING;

-- ---------------------------------------------------------------------
-- 5) SAMPLE DATA FOR SCREENER FUNCTIONS
-- ---------------------------------------------------------------------

INSERT INTO screener_functions (function_name, display_name, sql_template, category, description, examples, return_type, sort_order) VALUES
('AVG', 'Average', 'AVG({0})', 'Aggregation', 'Calculate average value of a field', '["AVG(market_cap)", "AVG(pe_ratio)"]', 'NUMBER', 1),
('SUM', 'Sum', 'SUM({0})', 'Aggregation', 'Calculate sum of values', '["SUM(revenue)", "SUM(profit)"]', 'NUMBER', 2),
('COUNT', 'Count', 'COUNT({0})', 'Aggregation', 'Count number of records', '["COUNT(*)", "COUNT(DISTINCT sector)"]', 'NUMBER', 3),
('MAX', 'Maximum', 'MAX({0})', 'Aggregation', 'Find maximum value', '["MAX(market_cap)", "MAX(price)"]', 'NUMBER', 4),
('MIN', 'Minimum', 'MIN({0})', 'Aggregation', 'Find minimum value', '["MIN(pe_ratio)", "MIN(debt_to_equity)"]', 'NUMBER', 5),
('PERCENTILE', 'Percentile', 'PERCENTILE_CONT({1}) WITHIN GROUP (ORDER BY {0})', 'Statistical', 'Calculate percentile value', '["PERCENTILE(market_cap, 0.75)", "PERCENTILE(roe, 0.9)"]', 'NUMBER', 6),
('RANK', 'Rank', 'RANK() OVER (ORDER BY {0} {1})', 'Ranking', 'Rank values in ascending or descending order', '["RANK(market_cap, DESC)", "RANK(pe_ratio, ASC)"]', 'NUMBER', 7)
ON CONFLICT (function_name) DO NOTHING;

-- ---------------------------------------------------------------------
-- 6) SAMPLE DATA FOR FUNCTION PARAMETERS
-- ---------------------------------------------------------------------

-- Parameters for PERCENTILE function
INSERT INTO screener_function_params (function_id, param_name, display_name, data_type, is_required, param_order, validation_rules, help_text, example_value) VALUES
((SELECT function_id FROM screener_functions WHERE function_name = 'PERCENTILE'), 'field', 'Field', 'FIELD_REF', TRUE, 1, '{}', 'Field to calculate percentile for', 'market_cap'),
((SELECT function_id FROM screener_functions WHERE function_name = 'PERCENTILE'), 'percentile', 'Percentile Value', 'NUMBER', TRUE, 2, '{"min": 0, "max": 1}', 'Percentile value between 0 and 1', '0.75')
ON CONFLICT DO NOTHING;

-- Parameters for RANK function
INSERT INTO screener_function_params (function_id, param_name, display_name, data_type, is_required, param_order, validation_rules, help_text, example_value) VALUES
((SELECT function_id FROM screener_functions WHERE function_name = 'RANK'), 'field', 'Field', 'FIELD_REF', TRUE, 1, '{}', 'Field to rank by', 'market_cap'),
((SELECT function_id FROM screener_functions WHERE function_name = 'RANK'), 'direction', 'Sort Direction', 'STRING', TRUE, 2, '{"enum": ["ASC", "DESC"]}', 'Sort direction for ranking', 'DESC')
ON CONFLICT DO NOTHING;

-- Parameters for single-field aggregation functions (AVG, SUM, MAX, MIN, COUNT)
INSERT INTO screener_function_params (function_id, param_name, display_name, data_type, is_required, param_order, validation_rules, help_text, example_value) 
SELECT 
    sf.function_id,
    'field',
    'Field',
    'FIELD_REF',
    TRUE,
    1,
    '{}',
    'Field to apply ' || sf.display_name || ' function to',
    'market_cap'
FROM screener_functions sf 
WHERE sf.function_name IN ('AVG', 'SUM', 'MAX', 'MIN', 'COUNT')
ON CONFLICT DO NOTHING;