-- Migration V002: Insert default field metadata
-- Populates field_metadata table with common stock screening fields

INSERT INTO field_metadata (
    field_name, 
    display_name, 
    db_column, 
    data_type, 
    allowed_operators, 
    category, 
    description, 
    example_value, 
    validation_rules, 
    sort_order
) VALUES
-- Valuation Fields
('market_cap', 'Market Capitalization', 'market_cap', 'CURRENCY', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Valuation', 'Total market value of company shares outstanding', '₹50,000 Cr', 
 '{"min": 0, "unit": "INR", "format": "currency"}', 1),

('pe_ratio', 'P/E Ratio', 'pe_ratio', 'NUMBER', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Valuation', 'Price to Earnings ratio - indicates valuation relative to earnings', '15.5', 
 '{"min": 0, "max": 1000, "decimals": 2}', 2),

('pb_ratio', 'P/B Ratio', 'pb_ratio', 'NUMBER', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Valuation', 'Price to Book ratio - compares market value to book value', '2.3', 
 '{"min": 0, "max": 100, "decimals": 2}', 3),

('ev_ebitda', 'EV/EBITDA', 'ev_ebitda', 'NUMBER', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Valuation', 'Enterprise Value to EBITDA ratio', '12.8', 
 '{"min": 0, "max": 500, "decimals": 2}', 4),

-- Financial Health Fields
('debt_to_equity', 'Debt to Equity', 'debt_to_equity', 'NUMBER', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Financial Health', 'Debt to Equity ratio - measures financial leverage', '0.45', 
 '{"min": 0, "max": 10, "decimals": 2}', 5),

('current_ratio', 'Current Ratio', 'current_ratio', 'NUMBER', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Financial Health', 'Current assets to current liabilities ratio', '1.8', 
 '{"min": 0, "max": 20, "decimals": 2}', 6),

('interest_coverage', 'Interest Coverage', 'interest_coverage', 'NUMBER', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Financial Health', 'Ability to pay interest on debt', '8.5', 
 '{"min": 0, "decimals": 2}', 7),

-- Profitability Fields
('roe', 'Return on Equity', 'roe', 'PERCENT', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Profitability', 'Return on Equity percentage - measures profitability', '18.5%', 
 '{"min": -100, "max": 100, "unit": "%", "decimals": 2}', 8),

('roa', 'Return on Assets', 'roa', 'PERCENT', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Profitability', 'Return on Assets percentage', '12.3%', 
 '{"min": -100, "max": 100, "unit": "%", "decimals": 2}', 9),

('net_profit_margin', 'Net Profit Margin', 'net_profit_margin', 'PERCENT', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Profitability', 'Net profit as percentage of revenue', '15.2%', 
 '{"min": -100, "max": 100, "unit": "%", "decimals": 2}', 10),

-- Growth Fields
('revenue_growth', 'Revenue Growth', 'revenue_growth_yoy', 'PERCENT', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Growth', 'Year over year revenue growth percentage', '12.3%', 
 '{"min": -100, "max": 1000, "unit": "%", "decimals": 2}', 11),

('earnings_growth', 'Earnings Growth', 'earnings_growth_yoy', 'PERCENT', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Growth', 'Year over year earnings growth percentage', '25.8%', 
 '{"min": -100, "max": 1000, "unit": "%", "decimals": 2}', 12),

('book_value_growth', 'Book Value Growth', 'book_value_growth_yoy', 'PERCENT', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Growth', 'Year over year book value growth', '18.7%', 
 '{"min": -100, "max": 1000, "unit": "%", "decimals": 2}', 13),

-- Price and Volume Fields
('price', 'Current Price', 'current_price', 'CURRENCY', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Price & Volume', 'Current stock price', '₹1,250.75', 
 '{"min": 0, "unit": "INR", "format": "currency", "decimals": 2}', 14),

('volume', 'Trading Volume', 'avg_volume_30d', 'INTEGER', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Price & Volume', '30-day average trading volume', '1,50,000', 
 '{"min": 0, "format": "number"}', 15),

('price_change_1d', '1-Day Price Change', 'price_change_1d', 'PERCENT', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Price & Volume', 'Price change in last 1 day', '2.5%', 
 '{"min": -50, "max": 50, "unit": "%", "decimals": 2}', 16),

-- Classification Fields
('sector', 'Sector', 'sector', 'ENUM', 
 '["EQUALS", "NOT_EQUALS", "IN", "NOT_IN"]',
 'Classification', 'Industry sector classification', 'Technology', 
 '{"enum": ["Technology", "Banking", "Pharmaceuticals", "Automotive", "FMCG", "Energy", "Infrastructure", "Metals", "Textiles", "Chemicals"]}', 17),

('industry', 'Industry', 'industry', 'ENUM', 
 '["EQUALS", "NOT_EQUALS", "IN", "NOT_IN"]',
 'Classification', 'Specific industry within sector', 'Software Services', 
 '{}', 18),

('market_cap_category', 'Market Cap Category', 'market_cap_category', 'ENUM', 
 '["EQUALS", "NOT_EQUALS", "IN", "NOT_IN"]',
 'Classification', 'Market capitalization category', 'Large Cap', 
 '{"enum": ["Large Cap", "Mid Cap", "Small Cap", "Micro Cap"]}', 19),

-- Technical Indicators
('rsi_14', 'RSI (14)', 'rsi_14', 'NUMBER', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Technical', 'Relative Strength Index (14 periods)', '65.2', 
 '{"min": 0, "max": 100, "decimals": 2}', 20),

('sma_50', '50-Day SMA', 'sma_50', 'CURRENCY', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Technical', '50-day Simple Moving Average', '₹1,180.50', 
 '{"min": 0, "unit": "INR", "format": "currency", "decimals": 2}', 21),

('sma_200', '200-Day SMA', 'sma_200', 'CURRENCY', 
 '["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "BETWEEN", "IN", "NOT_IN"]',
 'Technical', '200-day Simple Moving Average', '₹1,050.25', 
 '{"min": 0, "unit": "INR", "format": "currency", "decimals": 2}', 22)

ON CONFLICT (field_name) DO NOTHING;