-- Migration V003: Insert default screener functions
-- Populates screener_functions and screener_function_params tables with common functions

-- ---------------------------------------------------------------------
-- 1) INSERT DEFAULT SCREENER FUNCTIONS
-- ---------------------------------------------------------------------

INSERT INTO screener_functions (
    function_name, 
    label, 
    return_type, 
    sql_template, 
    category, 
    description, 
    examples, 
    sort_order
) VALUES
-- Aggregation Functions
('AVG', 'Average', 'NUMBER', 'AVG({{field}})', 'Aggregation', 
 'Calculate the average value of a numeric field across all matching records', 
 '["AVG(market_cap)", "AVG(pe_ratio)"]', 1),

('SUM', 'Sum', 'NUMBER', 'SUM({{field}})', 'Aggregation', 
 'Calculate the sum of all values in a numeric field', 
 '["SUM(revenue)", "SUM(net_profit)"]', 2),

('COUNT', 'Count', 'INTEGER', 'COUNT({{field}})', 'Aggregation', 
 'Count the number of non-null values in a field', 
 '["COUNT(*)", "COUNT(DISTINCT sector)"]', 3),

('MAX', 'Maximum', 'NUMBER', 'MAX({{field}})', 'Aggregation', 
 'Find the maximum value in a numeric field', 
 '["MAX(market_cap)", "MAX(price)"]', 4),

('MIN', 'Minimum', 'NUMBER', 'MIN({{field}})', 'Aggregation', 
 'Find the minimum value in a numeric field', 
 '["MIN(pe_ratio)", "MIN(debt_to_equity)"]', 5),

-- Statistical Functions
('PERCENTILE', 'Percentile', 'NUMBER', 'PERCENTILE_CONT({{percentile}}) WITHIN GROUP (ORDER BY {{field}})', 'Statistical', 
 'Calculate the specified percentile value of a field', 
 '["PERCENTILE(market_cap, 0.75)", "PERCENTILE(roe, 0.9)"]', 6),

('STDDEV', 'Standard Deviation', 'NUMBER', 'STDDEV({{field}})', 'Statistical', 
 'Calculate the standard deviation of values in a numeric field', 
 '["STDDEV(pe_ratio)", "STDDEV(roe)"]', 7),

('VARIANCE', 'Variance', 'NUMBER', 'VARIANCE({{field}})', 'Statistical', 
 'Calculate the variance of values in a numeric field', 
 '["VARIANCE(market_cap)", "VARIANCE(revenue_growth)"]', 8),

-- Ranking Functions
('RANK', 'Rank', 'INTEGER', 'RANK() OVER (ORDER BY {{field}} {{direction}})', 'Ranking', 
 'Rank values in ascending or descending order with gaps for ties', 
 '["RANK(market_cap, DESC)", "RANK(pe_ratio, ASC)"]', 9),

('DENSE_RANK', 'Dense Rank', 'INTEGER', 'DENSE_RANK() OVER (ORDER BY {{field}} {{direction}})', 'Ranking', 
 'Rank values without gaps for ties', 
 '["DENSE_RANK(roe, DESC)", "DENSE_RANK(debt_to_equity, ASC)"]', 10),

('ROW_NUMBER', 'Row Number', 'INTEGER', 'ROW_NUMBER() OVER (ORDER BY {{field}} {{direction}})', 'Ranking', 
 'Assign unique sequential numbers to rows', 
 '["ROW_NUMBER(market_cap, DESC)", "ROW_NUMBER(price, ASC)"]', 11),

-- Mathematical Functions
('ABS', 'Absolute Value', 'NUMBER', 'ABS({{field}})', 'Mathematical', 
 'Return the absolute value of a number', 
 '["ABS(earnings_growth)", "ABS(price_change_1d)"]', 12),

('ROUND', 'Round', 'NUMBER', 'ROUND({{field}}, {{decimals}})', 'Mathematical', 
 'Round a number to specified decimal places', 
 '["ROUND(pe_ratio, 2)", "ROUND(market_cap, 0)"]', 13),

('CEIL', 'Ceiling', 'INTEGER', 'CEIL({{field}})', 'Mathematical', 
 'Round up to the nearest integer', 
 '["CEIL(pe_ratio)", "CEIL(debt_to_equity)"]', 14),

('FLOOR', 'Floor', 'INTEGER', 'FLOOR({{field}})', 'Mathematical', 
 'Round down to the nearest integer', 
 '["FLOOR(pe_ratio)", "FLOOR(roe)"]', 15),

-- Date Functions
('EXTRACT_YEAR', 'Extract Year', 'INTEGER', 'EXTRACT(YEAR FROM {{field}})', 'Date', 
 'Extract the year from a date field', 
 '["EXTRACT_YEAR(listing_date)", "EXTRACT_YEAR(last_earnings_date)"]', 16),

('EXTRACT_MONTH', 'Extract Month', 'INTEGER', 'EXTRACT(MONTH FROM {{field}})', 'Date', 
 'Extract the month from a date field', 
 '["EXTRACT_MONTH(listing_date)", "EXTRACT_MONTH(dividend_date)"]', 17),

('DATE_DIFF', 'Date Difference', 'INTEGER', 'DATE_PART(''day'', {{end_date}} - {{start_date}})', 'Date', 
 'Calculate the difference in days between two dates', 
 '["DATE_DIFF(CURRENT_DATE, listing_date)", "DATE_DIFF(earnings_date, announcement_date)"]', 18),

-- String Functions
('UPPER', 'Uppercase', 'STRING', 'UPPER({{field}})', 'String', 
 'Convert text to uppercase', 
 '["UPPER(sector)", "UPPER(company_name)"]', 19),

('LOWER', 'Lowercase', 'STRING', 'LOWER({{field}})', 'String', 
 'Convert text to lowercase', 
 '["LOWER(industry)", "LOWER(exchange)"]', 20),

('LENGTH', 'String Length', 'INTEGER', 'LENGTH({{field}})', 'String', 
 'Get the length of a text field', 
 '["LENGTH(company_name)", "LENGTH(symbol)"]', 21)

ON CONFLICT (function_name) DO NOTHING;

-- ---------------------------------------------------------------------
-- 2) INSERT FUNCTION PARAMETERS
-- ---------------------------------------------------------------------

-- Parameters for single-field functions (AVG, SUM, MAX, MIN, COUNT, STDDEV, VARIANCE, ABS, CEIL, FLOOR, UPPER, LOWER, LENGTH)
INSERT INTO screener_function_params (function_id, param_name, param_type, param_order, is_required, validation_rules, help_text) 
SELECT 
    sf.id,
    'field',
    'FIELD_REF',
    1,
    TRUE,
    '{}',
    'Select the field to apply the ' || sf.label || ' function to'
FROM screener_functions sf 
WHERE sf.function_name IN ('AVG', 'SUM', 'MAX', 'MIN', 'COUNT', 'STDDEV', 'VARIANCE', 'ABS', 'CEIL', 'FLOOR', 'UPPER', 'LOWER', 'LENGTH', 'EXTRACT_YEAR', 'EXTRACT_MONTH')
ON CONFLICT (function_id, param_name) DO NOTHING;

-- Parameters for PERCENTILE function
INSERT INTO screener_function_params (function_id, param_name, param_type, param_order, is_required, default_value, validation_rules, help_text) VALUES
((SELECT id FROM screener_functions WHERE function_name = 'PERCENTILE'), 'field', 'FIELD_REF', 1, TRUE, NULL, '{}', 'Field to calculate percentile for'),
((SELECT id FROM screener_functions WHERE function_name = 'PERCENTILE'), 'percentile', 'NUMBER', 2, TRUE, '0.5', '{"min": 0, "max": 1, "decimals": 2}', 'Percentile value between 0 and 1 (e.g., 0.75 for 75th percentile)')
ON CONFLICT (function_id, param_name) DO NOTHING;

-- Parameters for RANK, DENSE_RANK, ROW_NUMBER functions
INSERT INTO screener_function_params (function_id, param_name, param_type, param_order, is_required, default_value, validation_rules, help_text) 
SELECT 
    sf.id,
    CASE 
        WHEN param_order = 1 THEN 'field'
        WHEN param_order = 2 THEN 'direction'
    END,
    CASE 
        WHEN param_order = 1 THEN 'FIELD_REF'
        WHEN param_order = 2 THEN 'STRING'
    END,
    param_order,
    TRUE,
    CASE 
        WHEN param_order = 2 THEN 'DESC'
        ELSE NULL
    END,
    CASE 
        WHEN param_order = 2 THEN '{"enum": ["ASC", "DESC"]}'
        ELSE '{}'
    END,
    CASE 
        WHEN param_order = 1 THEN 'Field to rank by'
        WHEN param_order = 2 THEN 'Sort direction: ASC (ascending) or DESC (descending)'
    END
FROM screener_functions sf 
CROSS JOIN (SELECT 1 as param_order UNION SELECT 2) p
WHERE sf.function_name IN ('RANK', 'DENSE_RANK', 'ROW_NUMBER')
ON CONFLICT (function_id, param_name) DO NOTHING;

-- Parameters for ROUND function
INSERT INTO screener_function_params (function_id, param_name, param_type, param_order, is_required, default_value, validation_rules, help_text) VALUES
((SELECT id FROM screener_functions WHERE function_name = 'ROUND'), 'field', 'FIELD_REF', 1, TRUE, NULL, '{}', 'Field to round'),
((SELECT id FROM screener_functions WHERE function_name = 'ROUND'), 'decimals', 'INTEGER', 2, TRUE, '2', '{"min": 0, "max": 10}', 'Number of decimal places to round to')
ON CONFLICT (function_id, param_name) DO NOTHING;

-- Parameters for DATE_DIFF function
INSERT INTO screener_function_params (function_id, param_name, param_type, param_order, is_required, validation_rules, help_text) VALUES
((SELECT id FROM screener_functions WHERE function_name = 'DATE_DIFF'), 'end_date', 'FIELD_REF', 1, TRUE, '{}', 'End date field (later date)'),
((SELECT id FROM screener_functions WHERE function_name = 'DATE_DIFF'), 'start_date', 'FIELD_REF', 2, TRUE, '{}', 'Start date field (earlier date)')
ON CONFLICT (function_id, param_name) DO NOTHING;