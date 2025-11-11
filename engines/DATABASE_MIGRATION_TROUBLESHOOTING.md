# Database Migration Troubleshooting Guide

## Common Migration Issues

### Issue 1: "column 'time' does not exist"

**Error Message:**
```
Error during hypertable conversion: column "time" does not exist
```

**Cause:**
The existing `nse_eq_ohlcv_historic` table uses a `date` column (DATE type) instead of a `time` column (TIMESTAMPTZ type). TimescaleDB hypertables require a timestamp column.

**Solution:**
The updated migration script (V2) now handles this automatically by:
1. Adding a `time` column (TIMESTAMPTZ)
2. Populating it from the existing `date` column
3. Converting the table to a hypertable

**To fix:**
```sql
-- Connect to database
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant

-- Run the updated migration script
\i engines/src/main/resources/db/migration/V2__convert_ohlcv_to_hypertable.sql
```

### Issue 2: "extension 'timescaledb' already exists"

**Error Message:**
```
extension "timescaledb" already exists, skipping
```

**Cause:**
This is just a notice, not an error. The TimescaleDB extension is already installed.

**Action:**
No action needed. This is expected behavior.

### Issue 3: "column type 'timestamp without time zone' used for 'created_at' does not follow best practices"

**Error Message:**
```
column type "timestamp without time zone" used for "created_at" does not follow best practices
column type "timestamp without time zone" used for "updated_at" does not follow best practices
```

**Cause:**
The existing table uses `TIMESTAMP` (without timezone) for `created_at` and `updated_at` columns. Best practice is to use `TIMESTAMPTZ` (with timezone).

**Impact:**
This is a warning, not an error. The table will work fine, but timezone-aware timestamps are recommended.

**Solution (Optional):**
If you want to fix this warning:
```sql
-- Convert created_at and updated_at to TIMESTAMPTZ
ALTER TABLE nse_eq_ohlcv_historic 
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

ALTER TABLE nse_eq_ohlcv_historic 
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
```

### Issue 4: TimescaleDB Extension Not Available

**Error Message:**
```
TimescaleDB extension not available - skipping hypertable conversion
```

**Cause:**
The PostgreSQL database does not have the TimescaleDB extension installed.

**Solution:**
You have two options:

**Option A: Install TimescaleDB (Recommended)**
```bash
# For Ubuntu/Debian
sudo apt-get install timescaledb-2-postgresql-15

# For other systems, see: https://docs.timescale.com/install/latest/
```

**Option B: Use Standard PostgreSQL (Works Fine)**
```sql
-- Run the alternative migration script
\i engines/src/main/resources/db/migration/V2_alternative__add_time_column_without_timescaledb.sql
```

The ingestion engine will work with standard PostgreSQL, but TimescaleDB provides:
- Better query performance for time-series data
- Automatic data compression
- Continuous aggregates
- Better storage efficiency

## Verification Steps

After running migrations, verify the setup:

```sql
-- Check if TimescaleDB extension is installed
SELECT * FROM pg_extension WHERE extname = 'timescaledb';

-- Check if nse_eq_ohlcv_historic is a hypertable
SELECT * FROM timescaledb_information.hypertables 
WHERE hypertable_name = 'nse_eq_ohlcv_historic';

-- Check table structure
\d nse_eq_ohlcv_historic

-- Verify time column exists and is populated
SELECT 
    COUNT(*) as total_rows,
    COUNT(time) as rows_with_time,
    MIN(time) as earliest_time,
    MAX(time) as latest_time
FROM nse_eq_ohlcv_historic;

-- Check if nse_eq_ticks table exists
\d nse_eq_ticks
```

## Expected Results

### With TimescaleDB:
```
✓ TimescaleDB extension installed
✓ nse_eq_ohlcv_historic is a hypertable
✓ time column exists and is populated
✓ Compression policy configured
✓ nse_eq_ticks table created
```

### Without TimescaleDB:
```
✓ nse_eq_ohlcv_historic is a regular table
✓ time column exists and is populated
✓ Indexes created for performance
✓ nse_eq_ticks table created
```

## Manual Migration Steps

If automatic migration fails, you can manually add the time column:

```sql
-- 1. Add time column
ALTER TABLE nse_eq_ohlcv_historic ADD COLUMN time TIMESTAMPTZ;

-- 2. Populate from date column
UPDATE nse_eq_ohlcv_historic 
SET time = date::TIMESTAMPTZ 
WHERE time IS NULL;

-- 3. Make it NOT NULL
ALTER TABLE nse_eq_ohlcv_historic ALTER COLUMN time SET NOT NULL;

-- 4. Create indexes
CREATE INDEX idx_ohlcv_time ON nse_eq_ohlcv_historic (time DESC);
CREATE INDEX idx_ohlcv_symbol_time ON nse_eq_ohlcv_historic (symbol, time DESC);

-- 5. (Optional) Convert to hypertable if TimescaleDB is available
SELECT create_hypertable('nse_eq_ohlcv_historic', 'time',
    chunk_time_interval => INTERVAL '1 month',
    migrate_data => TRUE);
```

## Rollback

If you need to rollback the migration:

```sql
-- Remove time column (if added)
ALTER TABLE nse_eq_ohlcv_historic DROP COLUMN IF EXISTS time;

-- Drop nse_eq_ticks table
DROP TABLE IF EXISTS nse_eq_ticks;
```

## Getting Help

If you encounter other issues:

1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-15-main.log`
2. Check TimescaleDB version: `SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';`
3. Check table permissions: `\dp nse_eq_ohlcv_historic`
4. Verify database connection: `\conninfo`

## Performance Tuning (Optional)

After successful migration, you can optimize performance:

```sql
-- Enable compression for older data (TimescaleDB only)
ALTER TABLE nse_eq_ohlcv_historic SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'symbol',
    timescaledb.compress_orderby = 'time DESC'
);

-- Add compression policy (compress data older than 90 days)
SELECT add_compression_policy('nse_eq_ohlcv_historic', INTERVAL '90 days');

-- Create continuous aggregate for daily candles (TimescaleDB only)
CREATE MATERIALIZED VIEW daily_ohlcv
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
GROUP BY day, symbol;

-- Add refresh policy
SELECT add_continuous_aggregate_policy('daily_ohlcv',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');
```
