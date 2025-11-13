-- Update nse_eq_ohlcv_historic table schema to match NSE bhav copy format
-- This migration:
-- 1. Removes created_at and updated_at columns (not needed for raw data)
-- 2. Adds bhav copy specific columns
-- 3. Creates ingestion_jobs table for job tracking
-- 4. Updates indexes for optimal query performance

-- ============================================================================
-- 1. Update nse_eq_ohlcv_historic table schema
-- ============================================================================

-- Remove created_at and updated_at columns if they exist
ALTER TABLE nse_eq_ohlcv_historic 
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- Add series column if it doesn't exist (for EQ, BE, etc.)
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nse_eq_ohlcv_historic' 
        AND column_name = 'series'
    ) THEN
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD COLUMN series VARCHAR(10);
    END IF;
END $;

-- Add prev_close column if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nse_eq_ohlcv_historic' 
        AND column_name = 'prev_close'
    ) THEN
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD COLUMN prev_close NUMERIC(18,4);
    END IF;
END $;

-- Add last column if it doesn't exist (last traded price)
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nse_eq_ohlcv_historic' 
        AND column_name = 'last'
    ) THEN
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD COLUMN last NUMERIC(18,4);
    END IF;
END $;

-- Add avg_price column if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nse_eq_ohlcv_historic' 
        AND column_name = 'avg_price'
    ) THEN
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD COLUMN avg_price NUMERIC(18,4);
    END IF;
END $;

-- Add turnover_lacs column if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nse_eq_ohlcv_historic' 
        AND column_name = 'turnover_lacs'
    ) THEN
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD COLUMN turnover_lacs NUMERIC(20,2);
    END IF;
END $;

-- Add no_of_trades column if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nse_eq_ohlcv_historic' 
        AND column_name = 'no_of_trades'
    ) THEN
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD COLUMN no_of_trades INTEGER;
    END IF;
END $;

-- Add deliv_qty column if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nse_eq_ohlcv_historic' 
        AND column_name = 'deliv_qty'
    ) THEN
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD COLUMN deliv_qty BIGINT;
    END IF;
END $;

-- Add deliv_per column if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nse_eq_ohlcv_historic' 
        AND column_name = 'deliv_per'
    ) THEN
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD COLUMN deliv_per NUMERIC(5,2);
    END IF;
END $;

-- Update primary key to include timeframe if not already set
-- Note: This is a complex operation and should be done carefully
-- We'll create a unique constraint instead if primary key change is risky
DO $
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'nse_eq_ohlcv_historic_unique_key'
    ) THEN
        -- Create unique constraint on (time, symbol, timeframe)
        ALTER TABLE nse_eq_ohlcv_historic 
            ADD CONSTRAINT nse_eq_ohlcv_historic_unique_key 
            UNIQUE (time, symbol, timeframe);
    END IF;
END $;

-- Create index on series for filtering
CREATE INDEX IF NOT EXISTS idx_ohlcv_series 
    ON nse_eq_ohlcv_historic(series);

-- ============================================================================
-- 2. Create ingestion_jobs table for job tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL UNIQUE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    symbols TEXT,
    total_dates INTEGER,
    processed_dates INTEGER DEFAULT 0,
    total_records BIGINT DEFAULT 0,
    inserted_records BIGINT DEFAULT 0,
    failed_records BIGINT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'TIMEOUT'))
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_job_id 
    ON ingestion_jobs(job_id);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status 
    ON ingestion_jobs(status);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_started_at 
    ON ingestion_jobs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_job_type 
    ON ingestion_jobs(job_type);

-- ============================================================================
-- 3. Add comments for documentation
-- ============================================================================

COMMENT ON TABLE nse_eq_ohlcv_historic IS 
    'Stores raw historical OHLCV data from NSE bhavcopy files';

COMMENT ON COLUMN nse_eq_ohlcv_historic.time IS 
    'Timestamp of the data point (date at midnight UTC for daily data)';

COMMENT ON COLUMN nse_eq_ohlcv_historic.symbol IS 
    'Stock symbol (e.g., RELIANCE, TCS)';

COMMENT ON COLUMN nse_eq_ohlcv_historic.series IS 
    'Series type (EQ, BE, etc.)';

COMMENT ON COLUMN nse_eq_ohlcv_historic.timeframe IS 
    'Timeframe of the data (1day for daily bhav copy)';

COMMENT ON COLUMN nse_eq_ohlcv_historic.prev_close IS 
    'Previous day closing price';

COMMENT ON COLUMN nse_eq_ohlcv_historic.last IS 
    'Last traded price';

COMMENT ON COLUMN nse_eq_ohlcv_historic.avg_price IS 
    'Average traded price';

COMMENT ON COLUMN nse_eq_ohlcv_historic.turnover_lacs IS 
    'Total turnover in lakhs';

COMMENT ON COLUMN nse_eq_ohlcv_historic.no_of_trades IS 
    'Number of trades';

COMMENT ON COLUMN nse_eq_ohlcv_historic.deliv_qty IS 
    'Delivery quantity';

COMMENT ON COLUMN nse_eq_ohlcv_historic.deliv_per IS 
    'Delivery percentage';

COMMENT ON TABLE ingestion_jobs IS 
    'Tracks historical data ingestion jobs with progress and status';

COMMENT ON COLUMN ingestion_jobs.job_id IS 
    'Unique identifier for the job (UUID)';

COMMENT ON COLUMN ingestion_jobs.job_type IS 
    'Type of ingestion job (e.g., NSE_BHAV_COPY)';

COMMENT ON COLUMN ingestion_jobs.status IS 
    'Current status of the job (PENDING, RUNNING, COMPLETED, FAILED, TIMEOUT)';

COMMENT ON COLUMN ingestion_jobs.symbols IS 
    'Comma-separated list of symbols to ingest (NULL for all symbols)';

-- ============================================================================
-- 4. Verification
-- ============================================================================

-- Verify table structure
DO $
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'nse_eq_ohlcv_historic'
    AND column_name IN ('time', 'symbol', 'series', 'timeframe', 'prev_close', 
                        'open', 'high', 'low', 'last', 'close', 'avg_price',
                        'volume', 'turnover_lacs', 'no_of_trades', 'deliv_qty', 'deliv_per');
    
    IF column_count = 16 THEN
        RAISE NOTICE 'nse_eq_ohlcv_historic table schema updated successfully';
    ELSE
        RAISE WARNING 'Expected 16 columns, found %', column_count;
    END IF;
    
    -- Verify ingestion_jobs table
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ingestion_jobs') THEN
        RAISE NOTICE 'ingestion_jobs table created successfully';
    ELSE
        RAISE WARNING 'ingestion_jobs table not found';
    END IF;
END $;

COMMIT;
