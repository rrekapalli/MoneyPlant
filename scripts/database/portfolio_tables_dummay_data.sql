-- MoneyPlant: Dummy data for portfolio and portfolio_* tables
-- File: scripts/database/portfolio_tables_dummay_data.sql
-- This script creates two sample portfolios first, then uses their primary keys
-- in all portfolio_* tables. It assumes the following referenced data exists:
--   - public.users: user with id = 1 (adjust if needed)
--   - public.nse_eq_master (e.g., symbols 'TCS', 'INFY', 'RELIANCE')
--   - public.nse_idx_master (e.g., index_name 'NIFTY 50', 'NIFTY NEXT 50')
-- You may adjust symbols/index names/user_id to match your environment.

BEGIN;

-- Optional: clear existing data for a clean slate
TRUNCATE TABLE
    public.portfolio_cash_flows,
    public.portfolio_transactions,
    public.portfolio_holding_valuation_daily,
    public.portfolio_valuation_daily,
    public.portfolio_metrics_daily,
    public.portfolio_holdings,
    public.portfolio_benchmarks,
    public.portfolios
RESTART IDENTITY;

-- ---------------------------------------------------------------------------
-- portfolios: create base portfolios first
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolios (user_id, name, description, base_currency, inception_date, risk_profile, is_active)
VALUES
    (1, 'Demo Portfolio 1', 'Sample portfolio for dummy data', 'INR', DATE '2025-08-20', 'MODERATE', true),
    (1, 'Demo Portfolio 2', 'Second sample portfolio',       'INR', DATE '2025-08-20', 'AGGRESSIVE', true);

-- ---------------------------------------------------------------------------
-- portfolio_holdings: current aggregated positions per symbol
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolio_holdings (id, portfolio_id, symbol, quantity, avg_cost, realized_pnl, last_updated) VALUES
    (1, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'TCS',       25.000000, 3500.000000,   0.000000, NOW()),
    (2, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'INFY',      40.000000, 1500.000000, 500.000000, NOW()),
    (3, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'RELIANCE',  10.000000, 2400.000000,   0.000000, NOW()),
    (4, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 2'), 'INFY',      15.000000, 1480.000000,   0.000000, NOW());

-- ---------------------------------------------------------------------------
-- portfolio_transactions: trade and cash-impacting events
-- txn_type in ('BUY','SELL','DIVIDEND','SPLIT','BONUS','FEES','TAX','DEPOSIT','WITHDRAWAL','INTEREST')
-- For cash-only events (DEPOSIT/WITHDRAWAL/FEES/TAX/INTEREST), symbol may be NULL
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolio_transactions (id, portfolio_id, symbol, trade_date, trade_time, txn_type, quantity, price, fees, taxes, notes, created_at, updated_at) VALUES
    (1001, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'TCS',      DATE '2025-08-20', NOW(), 'BUY',       10.000000, 3450.000000, 10.000000, 5.000000,  'Initial buy TCS', NOW(), NOW()),
    (1002, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'INFY',     DATE '2025-08-21', NOW(), 'BUY',       40.000000, 1490.000000, 15.000000, 7.000000,  'Buy INFY', NOW(), NOW()),
    (1003, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), NULL,       DATE '2025-08-21', NOW(), 'DEPOSIT',    0.000000,    0.000000,  0.000000, 0.000000,  'Cash deposit', NOW(), NOW()),
    (1004, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'INFY',     DATE '2025-08-22', NOW(), 'DIVIDEND',   0.000000,   16.000000,  0.000000, 0.000000,  'Dividend credit', NOW(), NOW()),
    (1005, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'RELIANCE', DATE '2025-08-22', NOW(), 'BUY',       10.000000, 2420.000000, 10.000000, 5.000000,  'Buy Reliance', NOW(), NOW()),
    (1006, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'TCS',      DATE '2025-08-23', NOW(), 'SELL',       5.000000, 3600.000000, 10.000000, 8.000000,  'Partial TCS profit-booking', NOW(), NOW()),
    (1007, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 2'), 'INFY',     DATE '2025-08-21', NOW(), 'BUY',       15.000000, 1475.000000, 10.000000, 4.000000,  'P2 Buy INFY', NOW(), NOW()),
    (1008, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 2'), NULL,       DATE '2025-08-21', NOW(), 'DEPOSIT',    0.000000,    0.000000,  0.000000, 0.000000,  'P2 Cash deposit', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- portfolio_cash_flows: explicit cash ledger (link to transactions optional)
-- flow_type in ('DEPOSIT','WITHDRAWAL','DIVIDEND','INTEREST','FEES','TAX')
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolio_cash_flows (id, portfolio_id, flow_date, amount, flow_type, reference_txn_id, created_at) VALUES
    (2001, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), DATE '2025-08-21',  200000.000000, 'DEPOSIT',   1003, NOW()),
    (2002, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), DATE '2025-08-22',     640.000000, 'DIVIDEND',  1004, NOW()),
    (2003, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), DATE '2025-08-23',     -18.000000, 'FEES',      1006, NOW()),
    (2004, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 2'), DATE '2025-08-21',  100000.000000, 'DEPOSIT',   1008, NOW());

-- ---------------------------------------------------------------------------
-- portfolio_valuation_daily: portfolio-level valuation snapshots
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolio_valuation_daily (id, portfolio_id, date, total_market_value, total_cost_basis, cash_balance, net_invested, pnl_daily, pnl_total, return_daily_pct, return_cumulative_pct, twr_daily_pct, twr_cumulative_pct, mwr_cumulative_pct, created_at) VALUES
    (3001, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), DATE '2025-08-21',  250000.000000, 240000.000000,  50000.000000, 200000.000000,  1500.000000, 10000.000000, 0.006000, 0.050000, 0.005000, 0.045000, 0.044000, NOW()),
    (3002, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), DATE '2025-08-22',  255500.000000, 241000.000000,  50500.000000, 200000.000000,  1000.000000, 11500.000000, 0.004000, 0.057500, 0.004000, 0.049000, 0.046000, NOW()),
    (3003, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 2'), DATE '2025-08-21',  120000.000000, 117000.000000,  20000.000000, 100000.000000,   700.000000,  3000.000000, 0.006000, 0.030000, 0.006000, 0.028000, 0.027000, NOW());

-- ---------------------------------------------------------------------------
-- portfolio_holding_valuation_daily: holding-level snapshots per symbol
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolio_holding_valuation_daily (id, portfolio_id, symbol, date, quantity, market_price, market_value, cost_basis, pnl_daily, pnl_total, weight_pct, created_at) VALUES
    (4001, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'TCS',      DATE '2025-08-21', 10.000000, 3520.000000, 35200.000000, 34500.000000,  200.000000,  700.000000, 0.140000, NOW()),
    (4002, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'INFY',     DATE '2025-08-21', 40.000000, 1505.000000, 60200.000000, 59600.000000,  100.000000,  600.000000, 0.240000, NOW()),
    (4003, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'RELIANCE', DATE '2025-08-22', 10.000000, 2440.000000, 24400.000000, 24200.000000,  100.000000,  200.000000, 0.096000, NOW()),
    (4004, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 2'), 'INFY',     DATE '2025-08-21', 15.000000, 1488.000000, 22320.000000, 22125.000000,   45.000000,  195.000000, 0.186000, NOW());

-- ---------------------------------------------------------------------------
-- portfolio_metrics_daily: analytics and risk metrics per portfolio per day
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolio_metrics_daily (id, portfolio_id, date, nav, twr_daily_pct, twr_cumulative_pct, mwr_cumulative_pct, irr_to_date_pct, irr_annualized_pct, xirr_to_date_pct, xirr_annualized_pct, cagr_pct, ytd_return_pct, return_1m_pct, return_3m_pct, return_6m_pct, return_1y_pct, return_3y_annualized_pct, return_5y_annualized_pct, drawdown_pct, max_drawdown_pct, volatility_30d_pct, volatility_90d_pct, downside_deviation_30d_pct, sharpe_30d, sortino_30d, calmar_1y, treynor_30d, beta_30d, alpha_30d, tracking_error_30d, information_ratio_30d, var_95_30d, cvar_95_30d, upside_capture_1y, downside_capture_1y, active_return_30d_pct, created_at) VALUES
    (5001, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), DATE '2025-08-21', 100.00000000, 0.005000, 0.045000, 0.044000, 0.043000, 0.045000, 0.043500, 0.045500, 0.040000, 0.020000, 0.030000, 0.060000, 0.080000, 0.120000, 0.110000, 0.100000, -0.050000, -0.120000, 0.180000, 0.220000, 0.150000, 1.200000, 1.300000, 0.900000, 0.800000, 0.950000, 0.010000, 0.070000, 0.150000, 0.200000, 1.100000, 0.900000, 0.005000, 0.005000, NOW()),
    (5002, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), DATE '2025-08-22', 100.40000000, 0.004000, 0.049000, 0.046000, 0.044000, 0.046000, 0.044500, 0.046500, 0.041000, 0.021000, 0.031000, 0.061000, 0.081000, 0.121000, 0.111000, 0.101000, -0.048000, -0.118000, 0.179000, 0.219000, 0.149000, 1.210000, 1.310000, 0.910000, 0.810000, 0.960000, 0.011000, 0.071000, 0.151000, 0.201000, 1.090000, 0.910000, 0.004000, 0.004000, NOW()),
    (5003, (SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 2'), DATE '2025-08-21', 100.00000000, 0.006000, 0.028000, 0.027000, 0.026000, 0.028000, 0.026500, 0.028500, 0.025000, 0.015000, 0.020000, 0.040000, 0.060000, 0.090000, 0.085000, 0.080000, -0.030000, -0.080000, 0.140000, 0.190000, 0.120000, 0.900000, 1.000000, 0.700000, 0.600000, 0.850000, 0.008000, 0.050000, 0.120000, 0.160000, 0.900000, 0.850000, 0.006000, 0.006000, NOW());

-- ---------------------------------------------------------------------------
-- portfolio_benchmarks: index benchmarks per portfolio
-- ---------------------------------------------------------------------------
INSERT INTO public.portfolio_benchmarks (portfolio_id, index_name, weight_pct, created_at) VALUES
    ((SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'NIFTY 50',       0.700000, NOW()),
    ((SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 1'), 'NIFTY NEXT 50',  0.300000, NOW()),
    ((SELECT id FROM public.portfolios WHERE name = 'Demo Portfolio 2'), 'NIFTY 50',       1.000000, NOW());

COMMIT;
