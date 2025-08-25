-- MoneyPlant Portfolio Feature Entities
-- This script defines portfolio-related tables building on existing entities:
-- - public.users (user accounts)
-- - public.nse_eq_master (equity master, symbol PK)
-- - public.nse_eq_ohlcv_historic (historic equity prices)
-- - public.nse_idx_master (indices master, unique index_name)
-- - public.nse_idx_ohlcv_historic (historic index prices)
--
-- Notes:
-- - All tables are created in the public schema and use identity/bigserial primary keys.
-- - FK relationships reference existing master tables; ON DELETE behaviors are chosen for data integrity.
-- - CHECK constraints enforce simple enumerations without creating custom enum types.
-- - Indexes are provided for common query patterns.


-- 1) Portfolios: user-level container
CREATE TABLE IF NOT EXISTS public.portfolios (
    id              bigserial PRIMARY KEY,
    user_id         bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name            varchar(200) NOT NULL,
    description     text NULL,
    base_currency   varchar(10) NULL DEFAULT 'INR',
    inception_date  date NULL,
    risk_profile    varchar(50) NULL, -- e.g., CONSERVATIVE, MODERATE, AGGRESSIVE (free text with app-level validation)
    is_active       boolean NOT NULL DEFAULT true,
    target_allocation jsonb NULL, -- optional model allocation by symbol/sector/asset class
    created_at      timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolios_user_name_uk UNIQUE (user_id, name)
);
COMMENT ON TABLE public.portfolios IS 'User portfolios container with base currency and metadata';

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.portfolios (user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_active ON public.portfolios (is_active);


-- 2) Portfolio holdings (current aggregated positions per symbol)
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id              bigserial PRIMARY KEY,
    portfolio_id    bigint NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    symbol          text NOT NULL REFERENCES public.nse_eq_master(symbol) ON UPDATE CASCADE,
    quantity        numeric(20,6) NOT NULL DEFAULT 0,
    avg_cost        numeric(20,6) NOT NULL DEFAULT 0, -- average price per share (incl. fees if desired)
    realized_pnl    numeric(20,6) NOT NULL DEFAULT 0, -- cumulative realized PnL for this symbol
    last_updated    timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolio_holdings_portfolio_symbol_uk UNIQUE (portfolio_id, symbol)
);
COMMENT ON TABLE public.portfolio_holdings IS 'Aggregated current position per symbol within a portfolio';

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio ON public.portfolio_holdings (portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_symbol ON public.portfolio_holdings (symbol);


-- 3) Portfolio transactions (lots, cash-impacting events)
CREATE TABLE IF NOT EXISTS public.portfolio_transactions (
    id              bigserial PRIMARY KEY,
    portfolio_id    bigint NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    symbol          text NULL REFERENCES public.nse_eq_master(symbol) ON UPDATE CASCADE, -- nullable for pure cash flows
    trade_date      date NOT NULL,
    trade_time      timestamptz NULL,
    txn_type        varchar(20) NOT NULL,
    -- txn_type expected values: BUY, SELL, DIVIDEND, SPLIT, BONUS, FEES, TAX, DEPOSIT, WITHDRAWAL, INTEREST
    quantity        numeric(20,6) NOT NULL DEFAULT 0, -- positive for BUY, negative for SELL if desired; app can enforce sign
    price           numeric(20,6) NOT NULL DEFAULT 0, -- per-share price for equity transactions
    fees            numeric(20,6) NOT NULL DEFAULT 0,
    taxes           numeric(20,6) NOT NULL DEFAULT 0,
    notes           text NULL,
    created_at      timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolio_transactions_type_chk CHECK (
        txn_type IN ('BUY','SELL','DIVIDEND','SPLIT','BONUS','FEES','TAX','DEPOSIT','WITHDRAWAL','INTEREST')
    )
);
COMMENT ON TABLE public.portfolio_transactions IS 'All portfolio transactions: trades and cash-impacting events';

CREATE INDEX IF NOT EXISTS idx_portfolio_txn_portfolio_date ON public.portfolio_transactions (portfolio_id, trade_date);
CREATE INDEX IF NOT EXISTS idx_portfolio_txn_symbol ON public.portfolio_transactions (symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_txn_type ON public.portfolio_transactions (txn_type);


-- 4) Portfolio cash flows (explicit cash ledger; often derived from transactions but kept for clarity)
CREATE TABLE IF NOT EXISTS public.portfolio_cash_flows (
    id              bigserial PRIMARY KEY,
    portfolio_id    bigint NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    flow_date       date NOT NULL,
    amount          numeric(20,6) NOT NULL, -- positive = inflow, negative = outflow
    flow_type       varchar(20) NOT NULL, -- e.g., DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEES, TAX
    reference_txn_id bigint NULL REFERENCES public.portfolio_transactions(id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolio_cash_flows_type_chk CHECK (
        flow_type IN ('DEPOSIT','WITHDRAWAL','DIVIDEND','INTEREST','FEES','TAX')
    )
);
COMMENT ON TABLE public.portfolio_cash_flows IS 'Explicit cash movements at portfolio level (links to transactions when applicable)';

CREATE INDEX IF NOT EXISTS idx_portfolio_cash_flows_portfolio_date ON public.portfolio_cash_flows (portfolio_id, flow_date);
CREATE INDEX IF NOT EXISTS idx_portfolio_cash_flows_type ON public.portfolio_cash_flows (flow_type);


-- 5) Daily portfolio-level valuation snapshot
CREATE TABLE IF NOT EXISTS public.portfolio_valuation_daily (
    id                  bigserial PRIMARY KEY,
    portfolio_id        bigint NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    date                date NOT NULL,
    total_market_value  numeric(20,6) NOT NULL DEFAULT 0,
    total_cost_basis    numeric(20,6) NOT NULL DEFAULT 0,
    cash_balance        numeric(20,6) NOT NULL DEFAULT 0,
    net_invested        numeric(20,6) NOT NULL DEFAULT 0, -- cumulative deposits - withdrawals
    pnl_daily           numeric(20,6) NOT NULL DEFAULT 0,
    pnl_total           numeric(20,6) NOT NULL DEFAULT 0,
    return_daily_pct    numeric(12,6) NULL,
    return_cumulative_pct numeric(12,6) NULL, -- based on MV and net invested
    twr_daily_pct       numeric(12,6) NULL, -- time-weighted return for the day
    twr_cumulative_pct  numeric(12,6) NULL,
    mwr_cumulative_pct  numeric(12,6) NULL, -- money-weighted return up to date (approx/periodic)
    created_at          timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolio_valuation_daily_uk UNIQUE (portfolio_id, date)
);
COMMENT ON TABLE public.portfolio_valuation_daily IS 'Portfolio-level daily valuation, PnL, and return metrics';

CREATE INDEX IF NOT EXISTS idx_portfolio_valuation_portfolio_date ON public.portfolio_valuation_daily (portfolio_id, date);


-- 6) Daily holding-level valuation snapshot (per symbol)
CREATE TABLE IF NOT EXISTS public.portfolio_holding_valuation_daily (
    id                  bigserial PRIMARY KEY,
    portfolio_id        bigint NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    symbol              text NOT NULL REFERENCES public.nse_eq_master(symbol) ON UPDATE CASCADE,
    date                date NOT NULL,
    quantity            numeric(20,6) NOT NULL DEFAULT 0,
    market_price        numeric(20,6) NOT NULL DEFAULT 0,
    market_value        numeric(20,6) NOT NULL DEFAULT 0,
    cost_basis          numeric(20,6) NOT NULL DEFAULT 0,
    pnl_daily           numeric(20,6) NOT NULL DEFAULT 0,
    pnl_total           numeric(20,6) NOT NULL DEFAULT 0,
    weight_pct          numeric(10,6) NULL,
    created_at          timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolio_holding_valuation_daily_uk UNIQUE (portfolio_id, symbol, date)
);
COMMENT ON TABLE public.portfolio_holding_valuation_daily IS 'Holding-level daily valuation and PnL for each portfolio symbol';

CREATE INDEX IF NOT EXISTS idx_phvd_portfolio_date ON public.portfolio_holding_valuation_daily (portfolio_id, date);
CREATE INDEX IF NOT EXISTS idx_phvd_symbol_date ON public.portfolio_holding_valuation_daily (symbol, date);


-- 7) Portfolio metrics and analytics (rolling stats, risk, performance)
CREATE TABLE IF NOT EXISTS public.portfolio_metrics_daily (
    id                      bigserial PRIMARY KEY,
    portfolio_id            bigint NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    date                    date NOT NULL,
    nav                     numeric(20,8) NULL, -- Net Asset Value (per 1 unit; assume 1 unit unless unitization is used)
    -- Returns
    twr_daily_pct           numeric(12,6) NULL,
    twr_cumulative_pct      numeric(12,6) NULL,
    mwr_cumulative_pct      numeric(12,6) NULL, -- approximate MWR/XIRR based metric up to date
    irr_to_date_pct         numeric(12,6) NULL, -- IRR based on discrete cash flows up to date (periodic IRR)
    irr_annualized_pct      numeric(12,6) NULL, -- annualized IRR
    xirr_to_date_pct        numeric(12,6) NULL, -- day-precise XIRR up to date
    xirr_annualized_pct     numeric(12,6) NULL, -- annualized XIRR
    cagr_pct                numeric(12,6) NULL, -- compound annual growth rate from inception to date
    ytd_return_pct          numeric(12,6) NULL, -- calendar Year-To-Date return
    return_1m_pct           numeric(12,6) NULL,
    return_3m_pct           numeric(12,6) NULL,
    return_6m_pct           numeric(12,6) NULL,
    return_1y_pct           numeric(12,6) NULL,
    return_3y_annualized_pct numeric(12,6) NULL,
    return_5y_annualized_pct numeric(12,6) NULL,
    -- Risk and efficiency
    drawdown_pct            numeric(12,6) NULL,
    max_drawdown_pct        numeric(12,6) NULL,
    volatility_30d_pct      numeric(12,6) NULL,
    volatility_90d_pct      numeric(12,6) NULL,
    downside_deviation_30d_pct numeric(12,6) NULL,
    sharpe_30d              numeric(14,6) NULL,
    sortino_30d             numeric(14,6) NULL,
    calmar_1y               numeric(14,6) NULL,
    treynor_30d             numeric(14,6) NULL,
    beta_30d                numeric(14,6) NULL,
    alpha_30d               numeric(14,6) NULL,
    tracking_error_30d      numeric(14,6) NULL,
    information_ratio_30d   numeric(14,6) NULL,
    var_95_30d              numeric(20,6) NULL, -- Value-at-Risk 95% over 30 days (portfolio currency units)
    cvar_95_30d             numeric(20,6) NULL, -- Conditional VaR (Expected Shortfall)
    -- Benchmark capture and active metrics
    upside_capture_1y       numeric(12,6) NULL,
    downside_capture_1y     numeric(12,6) NULL,
    active_return_30d_pct   numeric(12,6) NULL,
    created_at              timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT portfolio_metrics_daily_uk UNIQUE (portfolio_id, date)
);
COMMENT ON TABLE public.portfolio_metrics_daily IS 'Time series of portfolio analytics and risk metrics for benchmarking and monitoring';

CREATE INDEX IF NOT EXISTS idx_portfolio_metrics_portfolio_date ON public.portfolio_metrics_daily (portfolio_id, date);


-- 8) Portfolio benchmarks (map to NSE indices with optional weights)
CREATE TABLE IF NOT EXISTS public.portfolio_benchmarks (
    portfolio_id    bigint NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    index_name      varchar(200) NOT NULL REFERENCES public.nse_idx_master(index_name) ON UPDATE CASCADE,
    weight_pct      numeric(10,6) NOT NULL DEFAULT 1.0,
    created_at      timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (portfolio_id, index_name)
);
COMMENT ON TABLE public.portfolio_benchmarks IS 'Benchmark indices assigned to a portfolio with optional weights (sum may equal 1)';

CREATE INDEX IF NOT EXISTS idx_portfolio_benchmarks_portfolio ON public.portfolio_benchmarks (portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_benchmarks_index_name ON public.portfolio_benchmarks (index_name);


-- Optional helper view: latest holdings valuation per portfolio (if needed by the app)
-- CREATE OR REPLACE VIEW public.v_portfolio_latest_holding_values AS
-- SELECT DISTINCT ON (portfolio_id, symbol)
--        portfolio_id, symbol, date, quantity, market_price, market_value, cost_basis, pnl_total, weight_pct
-- FROM public.portfolio_holding_valuation_daily
-- ORDER BY portfolio_id, symbol, date DESC;
