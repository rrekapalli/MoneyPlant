-- Flyway Migration V4: Create Kite Ingestion Tables
-- Creates tables for storing Kite Connect API data:
-- 1. kite_instrument_master: Master data for all instruments
-- 2. kite_ohlcv_historic: Historical OHLCV data as TimescaleDB hypertable

-- ============================================================================
-- Table: kite_instrument_master
-- Purpose: Store master data for all instruments from Kite Connect API
-- ============================================================================

CREATE TABLE IF NOT EXISTS kite_instrument_master (
    -- Primary identifiers
    instrument_token VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    
    -- Instrument details
    exchange_token VARCHAR(50),
    tradingsymbol VARCHAR(100) NOT NULL,
    name VARCHAR(255),
    
    -- Price and trading parameters
    last_price FLOAT8,
    tick_size FLOAT8,
    lot_size INTEGER,
    
    -- Derivative-specific fields (NULL for equities)
    expiry DATE,
    strike FLOAT8,
    
    -- Classification
    instrument_type VARCHAR(10),
    segment VARCHAR(20),
    
    -- Metadata timestamps
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    PRIMARY KEY (instrument_token, exchange)
);

-- Indexes for kite_instrument_master
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_tradingsymbol 
    ON kite_instrument_master(tradingsymbol);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_exchange 
    ON kite_instrument_master(exchange);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_instrument_type 
    ON kite_instrument_master(instrument_type);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_segment 
    ON kite_instrument_master(segment);

-- ============================================================================
-- Table: kite_ohlcv_historic
-- Purpose: Store historical OHLCV data from Kite Connect API
-- Note: This table is converted to a TimescaleDB hypertable for time-series optimization
-- ============================================================================

CREATE TABLE IF NOT EXISTS kite_ohlcv_historic (
    -- Primary identifiers
    instrument_token VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    
    -- Time dimension (used for TimescaleDB partitioning)
    date TIMESTAMPTZ NOT NULL,
    
    -- Candle interval
    candle_interval VARCHAR(20) NOT NULL,
    
    -- OHLCV data
    open FLOAT8 NOT NULL,
    high FLOAT8 NOT NULL,
    low FLOAT8 NOT NULL,
    close FLOAT8 NOT NULL,
    volume BIGINT NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Composite primary key
    PRIMARY KEY (instrument_token, exchange, date, candle_interval)
);

-- Convert to TimescaleDB hypertable for time-series optimization
-- Partitions data by date with 7-day chunks for optimal query performance
SELECT create_hypertable(
    'kite_ohlcv_historic',
    'date',
    if_not_exists => TRUE,
    migrate_data => TRUE,
    chunk_time_interval => INTERVAL '7 days'
);

-- Indexes for kite_ohlcv_historic
-- Optimized for common query patterns

-- Index for querying by instrument and time range
CREATE INDEX IF NOT EXISTS idx_ohlcv_instrument_token_date 
    ON kite_ohlcv_historic(instrument_token, date DESC);

-- Index for querying by exchange and time range
CREATE INDEX IF NOT EXISTS idx_ohlcv_exchange_date 
    ON kite_ohlcv_historic(exchange, date DESC);

-- Index for querying by candle interval and time range
CREATE INDEX IF NOT EXISTS idx_ohlcv_candle_interval_date 
    ON kite_ohlcv_historic(candle_interval, date DESC);

-- Composite index for common query pattern: instrument + exchange + interval
CREATE INDEX IF NOT EXISTS idx_ohlcv_instrument_exchange_interval 
    ON kite_ohlcv_historic(instrument_token, exchange, candle_interval, date DESC);

-- ============================================================================
-- TimescaleDB Compression Configuration
-- Purpose: Enable compression for older data to save storage space
-- ============================================================================

-- Enable compression for the hypertable
-- Compress by instrument_token, exchange, and candle_interval for better compression ratio
ALTER TABLE kite_ohlcv_historic SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'instrument_token, exchange, candle_interval'
);

-- Add compression policy: compress data older than 30 days
-- This runs automatically in the background
SELECT add_compression_policy('kite_ohlcv_historic', INTERVAL '30 days');

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE kite_instrument_master IS 'Master data for all tradable instruments from Kite Connect API';
COMMENT ON TABLE kite_ohlcv_historic IS 'Historical OHLCV data from Kite Connect API (TimescaleDB hypertable)';

COMMENT ON COLUMN kite_instrument_master.instrument_token IS 'Zerodha unique numeric identifier for the instrument';
COMMENT ON COLUMN kite_instrument_master.exchange IS 'Exchange where the instrument trades (NSE, BSE, NFO, etc.)';
COMMENT ON COLUMN kite_instrument_master.tradingsymbol IS 'Trading symbol of the instrument';

COMMENT ON COLUMN kite_ohlcv_historic.date IS 'Timestamp of the candle (partitioning column for TimescaleDB)';
COMMENT ON COLUMN kite_ohlcv_historic.candle_interval IS 'Candle interval (minute, 5minute, 15minute, day, etc.)';
