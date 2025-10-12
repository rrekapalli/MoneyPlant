-- Production data population script for Criteria Builder
-- This script populates the criteria metadata tables with production-ready data

-- ---------------------------------------------------------------------
-- PRODUCTION FIELD METADATA
-- ---------------------------------------------------------------------

-- Clear existing data (if any) and insert production field metadata
DELETE FROM field_metadata WHERE field_name IN (
    'market_cap', 'pe_ratio', 'pb_ratio', 'ev_ebitda', 'debt_to_equity', 
    'current_ratio', 'interest_coverage', 'roe', 'roa', 'net_profit_margin',
    'revenue_growth', 'earnings_growth', 'book_value_growth', 'price', 
    'volume', 'price_change_1d', 'sector', 'industry', 'market_cap_category',
    'rsi_14', 'sma_50', 'sma_200', 'dividend_yield', 'peg_ratio', 'beta'
);

INSERT INTO field_metadata (
    field_name, display_name, db_column, data_type, allowed_operators, 
    category, description, example_value, validation_rules, sort_order
) VALUES
-- Enhanced Valuation Fields
('market_cap', 'Market Capitalization', 'market_cap', 'CURRENCY', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Valuation', 'Total market value of all outstanding shares', '₹50,000 Cr', 
 '{"min": 0, "unit": "INR", "format": "currency"}', 1),

('pe_ratio', 'P/E Ratio', 'pe_ratio', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Valuation', 'Price to Earnings ratio - lower values may indicate undervaluation', '15.5', 
 '{"min": 0, "max": 1000, "decimals": 2}', 2),

('pb_ratio', 'P/B Ratio', 'pb_ratio', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Valuation', 'Price to Book ratio - compares market value to accounting book value', '2.3', 
 '{"min": 0, "max": 100, "decimals": 2}', 3),

('ev_ebitda', 'EV/EBITDA', 'ev_ebitda', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Valuation', 'Enterprise Value to EBITDA - measures company valuation', '12.8', 
 '{"min": 0, "max": 500, "decimals": 2}', 4),

('peg_ratio', 'PEG Ratio', 'peg_ratio', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Valuation', 'Price/Earnings to Growth ratio - considers growth in valuation', '1.2', 
 '{"min": 0, "max": 10, "decimals": 2}', 5),

-- Financial Strength Fields
('debt_to_equity', 'Debt to Equity', 'debt_to_equity', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Financial Strength', 'Total debt relative to shareholders equity', '0.45', 
 '{"min": 0, "max": 10, "decimals": 2}', 6),

('current_ratio', 'Current Ratio', 'current_ratio', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Financial Strength', 'Current assets divided by current liabilities', '1.8', 
 '{"min": 0, "max": 20, "decimals": 2}', 7),

('interest_coverage', 'Interest Coverage Ratio', 'interest_coverage', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Financial Strength', 'Ability to pay interest expenses on outstanding debt', '8.5', 
 '{"min": 0, "decimals": 2}', 8),

-- Profitability Metrics
('roe', 'Return on Equity', 'roe', 'PERCENT', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Profitability', 'Net income as percentage of shareholders equity', '18.5%', 
 '{"min": -100, "max": 100, "unit": "%", "decimals": 2}', 9),

('roa', 'Return on Assets', 'roa', 'PERCENT', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Profitability', 'Net income as percentage of total assets', '12.3%', 
 '{"min": -100, "max": 100, "unit": "%", "decimals": 2}', 10),

('net_profit_margin', 'Net Profit Margin', 'net_profit_margin', 'PERCENT', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Profitability', 'Net profit as percentage of total revenue', '15.2%', 
 '{"min": -100, "max": 100, "unit": "%", "decimals": 2}', 11),

-- Growth Indicators
('revenue_growth', 'Revenue Growth (YoY)', 'revenue_growth_yoy', 'PERCENT', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Growth', 'Year-over-year revenue growth percentage', '12.3%', 
 '{"min": -100, "max": 1000, "unit": "%", "decimals": 2}', 12),

('earnings_growth', 'Earnings Growth (YoY)', 'earnings_growth_yoy', 'PERCENT', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Growth', 'Year-over-year earnings growth percentage', '25.8%', 
 '{"min": -100, "max": 1000, "unit": "%", "decimals": 2}', 13),

-- Price and Trading Data
('price', 'Current Price', 'current_price', 'CURRENCY', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Price & Volume', 'Current market price per share', '₹1,250.75', 
 '{"min": 0, "unit": "INR", "format": "currency", "decimals": 2}', 14),

('volume', 'Average Volume (30D)', 'avg_volume_30d', 'INTEGER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Price & Volume', '30-day average daily trading volume', '1,50,000', 
 '{"min": 0, "format": "number"}', 15),

('dividend_yield', 'Dividend Yield', 'dividend_yield', 'PERCENT', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Income', 'Annual dividend as percentage of current price', '2.8%', 
 '{"min": 0, "max": 20, "unit": "%", "decimals": 2}', 16),

-- Risk Metrics
('beta', 'Beta', 'beta', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Risk', 'Measure of stock volatility relative to market', '1.2', 
 '{"min": -5, "max": 5, "decimals": 2}', 17),

-- Classification Fields
('sector', 'Sector', 'sector', 'ENUM', 
 '["EQUALS", "NOT_EQUALS", "IN", "NOT_IN"]',
 'Classification', 'Primary business sector', 'Technology', 
 '{"enum": ["Technology", "Banking & Finance", "Pharmaceuticals", "Automotive", "FMCG", "Energy & Power", "Infrastructure", "Metals & Mining", "Textiles", "Chemicals", "Real Estate", "Telecommunications", "Media & Entertainment"]}', 18),

('market_cap_category', 'Market Cap Category', 'market_cap_category', 'ENUM', 
 '["EQUALS", "NOT_EQUALS", "IN", "NOT_IN"]',
 'Classification', 'Market capitalization size category', 'Large Cap', 
 '{"enum": ["Large Cap", "Mid Cap", "Small Cap", "Micro Cap"]}', 19),

-- Technical Indicators
('rsi_14', 'RSI (14)', 'rsi_14', 'NUMBER', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Technical', 'Relative Strength Index over 14 periods', '65.2', 
 '{"min": 0, "max": 100, "decimals": 2}', 20),

('sma_50', '50-Day Moving Average', 'sma_50', 'CURRENCY', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Technical', '50-day Simple Moving Average price', '₹1,180.50', 
 '{"min": 0, "unit": "INR", "format": "currency", "decimals": 2}', 21),

('sma_200', '200-Day Moving Average', 'sma_200', 'CURRENCY', 
 '["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN"]',
 'Technical', '200-day Simple Moving Average price', '₹1,050.25', 
 '{"min": 0, "unit": "INR", "format": "currency", "decimals": 2}', 22);

-- ---------------------------------------------------------------------
-- PRODUCTION FUNCTION DEFINITIONS
-- ---------------------------------------------------------------------

-- Clear existing function data and insert production functions
DELETE FROM screener_function_params;
DELETE FROM screener_functions;

-- Reset sequences
ALTER SEQUENCE screener_functions_id_seq RESTART WITH 1;
ALTER SEQUENCE screener_function_params_id_seq RESTART WITH 1;

-- Insert production-ready functions
INSERT INTO screener_functions (
    function_name, label, return_type, sql_template, category, description, examples, sort_order
) VALUES
-- Statistical Functions
('PERCENTILE_90', '90th Percentile', 'NUMBER', 'PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY {{field}})', 'Statistical', 
 'Find the 90th percentile value - useful for identifying top performers', 
 '["Top 10% by Market Cap", "Top 10% by ROE"]', 1),

('PERCENTILE_75', '75th Percentile', 'NUMBER', 'PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY {{field}})', 'Statistical', 
 'Find the 75th percentile value - upper quartile', 
 '["Upper quartile by P/E Ratio", "Top 25% by Revenue Growth"]', 2),

('PERCENTILE_50', 'Median (50th Percentile)', 'NUMBER', 'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY {{field}})', 'Statistical', 
 'Find the median value - middle of the distribution', 
 '["Median Market Cap", "Median ROE"]', 3),

('PERCENTILE_25', '25th Percentile', 'NUMBER', 'PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY {{field}})', 'Statistical', 
 'Find the 25th percentile value - lower quartile', 
 '["Lower quartile by Debt/Equity", "Bottom 25% by P/E"]', 4),

-- Ranking Functions
('TOP_N_BY_FIELD', 'Top N by Field', 'INTEGER', 'RANK() OVER (ORDER BY {{field}} DESC)', 'Ranking', 
 'Rank stocks by a field in descending order', 
 '["Top stocks by Market Cap", "Highest ROE stocks"]', 5),

('BOTTOM_N_BY_FIELD', 'Bottom N by Field', 'INTEGER', 'RANK() OVER (ORDER BY {{field}} ASC)', 'Ranking', 
 'Rank stocks by a field in ascending order', 
 '["Lowest P/E stocks", "Least debt stocks"]', 6),

-- Sector Analysis Functions
('SECTOR_RANK', 'Rank within Sector', 'INTEGER', 'RANK() OVER (PARTITION BY sector ORDER BY {{field}} DESC)', 'Sector Analysis', 
 'Rank a stock within its sector by specified field', 
 '["Best ROE in Technology sector", "Highest growth in Banking"]', 7),

('SECTOR_PERCENTILE', 'Percentile within Sector', 'NUMBER', 'PERCENT_RANK() OVER (PARTITION BY sector ORDER BY {{field}})', 'Sector Analysis', 
 'Calculate percentile rank within sector', 
 '["Market cap percentile in sector", "ROE percentile in industry"]', 8),

-- Value Screening Functions
('GRAHAM_NUMBER', 'Graham Number', 'NUMBER', 'SQRT(15 * {{eps}} * 1.5 * {{book_value_per_share}})', 'Value Investing', 
 'Calculate Benjamin Graham intrinsic value estimate', 
 '["Graham Number vs Current Price"]', 9),

('PEG_SCREENING', 'PEG Ratio Analysis', 'NUMBER', '{{pe_ratio}} / NULLIF({{earnings_growth}}, 0)', 'Value Investing', 
 'Price/Earnings to Growth ratio for growth at reasonable price', 
 '["PEG < 1 for undervalued growth stocks"]', 10),

-- Quality Metrics
('PIOTROSKI_SCORE', 'Piotroski F-Score Component', 'INTEGER', 
 'CASE WHEN {{field}} > 0 THEN 1 ELSE 0 END', 'Quality', 
 'Component calculation for Piotroski F-Score quality assessment', 
 '["Positive ROA score", "Positive Operating Cash Flow score"]', 11),

-- Technical Analysis
('PRICE_VS_SMA', 'Price vs Moving Average', 'NUMBER', '({{current_price}} - {{sma}}) / {{sma}} * 100', 'Technical', 
 'Calculate percentage difference between current price and moving average', 
 '["Price above 50-day SMA", "Price below 200-day SMA"]', 12),

('BOLLINGER_POSITION', 'Bollinger Band Position', 'NUMBER', 
 '({{current_price}} - {{sma_20}}) / (2 * {{stddev_20}})', 'Technical', 
 'Position within Bollinger Bands (-1 to +1)', 
 '["Oversold position", "Overbought position"]', 13);

-- Insert function parameters for production functions
INSERT INTO screener_function_params (function_id, param_name, param_type, param_order, is_required, validation_rules, help_text) VALUES
-- Parameters for percentile functions (single field)
((SELECT id FROM screener_functions WHERE function_name = 'PERCENTILE_90'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Select field to find 90th percentile for'),
((SELECT id FROM screener_functions WHERE function_name = 'PERCENTILE_75'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Select field to find 75th percentile for'),
((SELECT id FROM screener_functions WHERE function_name = 'PERCENTILE_50'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Select field to find median for'),
((SELECT id FROM screener_functions WHERE function_name = 'PERCENTILE_25'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Select field to find 25th percentile for'),

-- Parameters for ranking functions
((SELECT id FROM screener_functions WHERE function_name = 'TOP_N_BY_FIELD'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Field to rank by (highest values first)'),
((SELECT id FROM screener_functions WHERE function_name = 'BOTTOM_N_BY_FIELD'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Field to rank by (lowest values first)'),
((SELECT id FROM screener_functions WHERE function_name = 'SECTOR_RANK'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Field to rank within sector'),
((SELECT id FROM screener_functions WHERE function_name = 'SECTOR_PERCENTILE'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Field to calculate sector percentile for'),

-- Parameters for Graham Number calculation
((SELECT id FROM screener_functions WHERE function_name = 'GRAHAM_NUMBER'), 'eps', 'FIELD_REF', 1, TRUE, '{}', 'Earnings per share field'),
((SELECT id FROM screener_functions WHERE function_name = 'GRAHAM_NUMBER'), 'book_value_per_share', 'FIELD_REF', 2, TRUE, '{}', 'Book value per share field'),

-- Parameters for PEG calculation
((SELECT id FROM screener_functions WHERE function_name = 'PEG_SCREENING'), 'pe_ratio', 'FIELD_REF', 1, TRUE, '{}', 'P/E ratio field'),
((SELECT id FROM screener_functions WHERE function_name = 'PEG_SCREENING'), 'earnings_growth', 'FIELD_REF', 2, TRUE, '{}', 'Earnings growth rate field'),

-- Parameters for Piotroski score component
((SELECT id FROM screener_functions WHERE function_name = 'PIOTROSKI_SCORE'), 'field', 'FIELD_REF', 1, TRUE, '{}', 'Financial metric field (positive = 1 point)'),

-- Parameters for technical analysis functions
((SELECT id FROM screener_functions WHERE function_name = 'PRICE_VS_SMA'), 'current_price', 'FIELD_REF', 1, TRUE, '{}', 'Current price field'),
((SELECT id FROM screener_functions WHERE function_name = 'PRICE_VS_SMA'), 'sma', 'FIELD_REF', 2, TRUE, '{}', 'Moving average field'),

((SELECT id FROM screener_functions WHERE function_name = 'BOLLINGER_POSITION'), 'current_price', 'FIELD_REF', 1, TRUE, '{}', 'Current price field'),
((SELECT id FROM screener_functions WHERE function_name = 'BOLLINGER_POSITION'), 'sma_20', 'FIELD_REF', 2, TRUE, '{}', '20-day moving average field'),
((SELECT id FROM screener_functions WHERE function_name = 'BOLLINGER_POSITION'), 'stddev_20', 'FIELD_REF', 3, TRUE, '{}', '20-day standard deviation field');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_field_metadata_production_lookup ON field_metadata(field_name, is_active, category);
CREATE INDEX IF NOT EXISTS idx_screener_functions_production_lookup ON screener_functions(function_name, is_active, category);

-- Update statistics
ANALYZE field_metadata;
ANALYZE screener_functions;
ANALYZE screener_function_params;