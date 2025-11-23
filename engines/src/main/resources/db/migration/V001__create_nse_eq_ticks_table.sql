-- Migration script for creating nse_eq_ticks table with TimescaleDB hypertable
-- This script is idempotent and can be run multiple times safely

-- Note: TimescaleDB extension should already be installed on the database
-- If not, run: CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create intraday tick data table (current day only)
-- This table stores real-time tick data during market hours
-- Data is archived to Apache Hudi at end of day and table is truncated
CREATE TABLE IF NOT EXISTS nse_eq_ticks (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    price NUMERIC(18,4) NOT NULL,
    volume BIGINT NOT NULL,
    bid NUMERIC(18,4),
    ask NUMERIC(18,4),
    metadata JSONB,
    CONSTRAINT nse_eq_ticks_price_positive CHECK (price > 0),
    CONSTRAINT nse_eq_ticks_volume_non_negative CHECK (volume >= 0)
);

-- Create hypertable for efficient time-series operations
-- This converts the regular table into a TimescaleDB hypertable
-- Chunk interval of 1 hour means data is partitioned by hour for optimal performance
SELECT create_hypertable('nse_eq_ticks', 'time', 
    chunk_time_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- Create composite index for efficient symbol-based time-series queries
-- This index is critical for querying tick data by symbol and time range
CREATE INDEX IF NOT EXISTS idx_ticks_symbol_time ON nse_eq_ticks (symbol, time DESC);

-- Create index on time column for time-based queries
CREATE INDEX IF NOT EXISTS idx_ticks_time ON nse_eq_ticks (time DESC);

-- Note: No compression or retention policies needed as table is truncated daily
-- Historical data is archived to Apache Hudi at end of day

-- Convert existing nse_eq_ohlcv_historic table to TimescaleDB hypertable (if exists)
-- This table stores historical OHLCV data for backtesting and analysis
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'nse_eq_ohlcv_historic') THEN
        -- Check if it's already a hypertable
        IF NOT EXISTS (
            SELECT 1 FROM timescaledb_information.hypertables 
            WHERE hypertable_schema = 'public' AND hypertable_name = 'nse_eq_ohlcv_historic'
        ) THEN
            -- Convert to hypertable with 1-day chunks
            PERFORM create_hypertable('nse_eq_ohlcv_historic', 'time',
                chunk_time_interval => INTERVAL '1 day',
                migrate_data => TRUE);
            
            RAISE NOTICE 'Converted nse_eq_ohlcv_historic to TimescaleDB hypertable';
        ELSE
            RAISE NOTICE 'nse_eq_ohlcv_historic is already a hypertable';
        END IF;
    ELSE
        -- Create new table if it doesn't exist
        CREATE TABLE nse_eq_ohlcv_historic (
            time TIMESTAMPTZ NOT NULL,
            symbol VARCHAR(20) NOT NULL,
            timeframe VARCHAR(10) NOT NULL,
            open NUMERIC(18,4) NOT NULL,
            high NUMERIC(18,4) NOT NULL,
            low NUMERIC(18,4) NOT NULL,
            close NUMERIC(18,4) NOT NULL,
            volume BIGINT NOT NULL,
            CONSTRAINT nse_eq_ohlcv_prices_positive CHECK (open > 0 AND high > 0 AND low > 0 AND close > 0),
            CONSTRAINT nse_eq_ohlcv_high_low CHECK (high >= low),
            CONSTRAINT nse_eq_ohlcv_volume_non_negative CHECK (volume >= 0)
        );
        
        -- Create hypertable
        PERFORM create_hypertable('nse_eq_ohlcv_historic', 'time',
            chunk_time_interval => INTERVAL '1 day');
        
        RAISE NOTICE 'Created nse_eq_ohlcv_historic table as TimescaleDB hypertable';
    END IF;
END $$;

-- Create indexes for efficient querying of OHLCV data
CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_timeframe_time 
    ON nse_eq_ohlcv_historic (symbol, timeframe, time DESC);

CREATE INDEX IF NOT EXISTS idx_ohlcv_time 
    ON nse_eq_ohlcv_historic (time DESC);

-- Enable compression for older OHLCV data (optional, for cost savings)
-- This compresses data older than 30 days to save storage space
ALTER TABLE nse_eq_ohlcv_historic SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'symbol,timeframe',
    timescaledb.compress_orderby = 'time DESC'
);

-- Add compression policy for data older than 30 days
-- This automatically compresses chunks older than 30 days
SELECT add_compression_policy('nse_eq_ohlcv_historic', INTERVAL '30 days', if_not_exists => TRUE);

-- Create continuous aggregate for daily candles (optional, for performance)
-- This pre-computes daily candles from 1-minute data for faster queries
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_candles
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS day,
    symbol,
    first(open, time) AS open,
    max(high) AS high,
    min(low) AS low,
    last(close, time) AS close,
    sum(volume) AS volume
FROM nse_eq_ohlcv_historic
WHERE timeframe = '1min'
GROUP BY day, symbol;

-- Add refresh policy for continuous aggregate
-- This automatically refreshes the materialized view
SELECT add_continuous_aggregate_policy('daily_candles',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON nse_eq_ticks TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON nse_eq_ohlcv_historic TO your_app_user;
-- GRANT SELECT ON daily_candles TO your_app_user;

-- Create function to truncate tick table (used by end-of-day archival)
CREATE OR REPLACE FUNCTION truncate_nse_eq_ticks()
RETURNS void AS $$
BEGIN
    TRUNCATE TABLE nse_eq_ticks;
    RAISE NOTICE 'Truncated nse_eq_ticks table';
END;
$$ LANGUAGE plpgsql;

-- Create function to get tick count for a specific date
CREATE OR REPLACE FUNCTION get_tick_count_for_date(target_date DATE)
RETURNS BIGINT AS $$
DECLARE
    tick_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO tick_count
    FROM nse_eq_ticks
    WHERE time >= target_date::TIMESTAMPTZ
      AND time < (target_date + INTERVAL '1 day')::TIMESTAMPTZ;
    
    RETURN tick_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get latest tick timestamp
CREATE OR REPLACE FUNCTION get_latest_tick_timestamp()
RETURNS TIMESTAMPTZ AS $$
DECLARE
    latest_time TIMESTAMPTZ;
BEGIN
    SELECT MAX(time) INTO latest_time FROM nse_eq_ticks;
    RETURN latest_time;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE nse_eq_ticks IS 'Intraday tick data for NSE equities. Data is archived to Hudi at end of day and table is truncated.';
COMMENT ON TABLE nse_eq_ohlcv_historic IS 'Historical OHLCV data for NSE equities. Optimized with TimescaleDB for time-series queries.';
COMMENT ON MATERIALIZED VIEW daily_candles IS 'Pre-computed daily candles from 1-minute data. Automatically refreshed every hour.';
COMMENT ON FUNCTION truncate_nse_eq_ticks() IS 'Truncates the nse_eq_ticks table. Used by end-of-day archival process.';
COMMENT ON FUNCTION get_tick_count_for_date(DATE) IS 'Returns the count of ticks for a specific date. Used for data integrity verification.';
COMMENT ON FUNCTION get_latest_tick_timestamp() IS 'Returns the timestamp of the latest tick. Used for monitoring data freshness.';
