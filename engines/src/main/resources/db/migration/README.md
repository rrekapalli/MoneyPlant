# Database Migration Scripts

This directory contains Flyway migration scripts for the Ingestion Engine database schema.

## Prerequisites

1. **PostgreSQL Database**: Version 12 or higher
2. **TimescaleDB Extension**: Must be installed on the PostgreSQL database
3. **Flyway**: Configured in the Spring Boot application for automatic migrations

## Installation of TimescaleDB

### On Ubuntu/Debian:
```bash
# Add TimescaleDB repository
sudo sh -c "echo 'deb https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -c -s) main' > /etc/apt/sources.list.d/timescaledb.list"
wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | sudo apt-key add -

# Install TimescaleDB
sudo apt-get update
sudo apt-get install timescaledb-2-postgresql-14

# Configure PostgreSQL
sudo timescaledb-tune --quiet --yes

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### On macOS:
```bash
# Using Homebrew
brew tap timescale/tap
brew install timescaledb

# Configure PostgreSQL
timescaledb-tune --quiet --yes

# Restart PostgreSQL
brew services restart postgresql
```

### On Docker:
```yaml
# Use TimescaleDB Docker image
services:
  postgres:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_DB: MoneyPlant
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    ports:
      - "5432:5432"
```

## Migration Scripts

### V1__create_timescaledb_schema.sql

This script creates the core TimescaleDB schema for the Ingestion Engine:

1. **nse_eq_ticks**: Hypertable for intraday tick data (current day only)
   - Stores real-time tick data with 1-hour chunks
   - Truncated daily after archival to Apache Hudi
   - Optimized for high-frequency inserts

2. **nse_eq_ohlcv_historic**: Hypertable for historical OHLCV data
   - Converts existing table to hypertable (if exists)
   - Stores historical price data with 1-day chunks
   - Compression enabled for data older than 30 days

3. **daily_candles**: Continuous aggregate view
   - Pre-computed daily candles from 1-minute data
   - Automatically refreshed every hour
   - Improves query performance for daily timeframe

4. **archival_metadata**: Tracking table for end-of-day archival
   - Records archival operations to Apache Hudi
   - Tracks success/failure and record counts

## Running Migrations

### Automatic (Recommended)

Migrations run automatically when the Spring Boot application starts:

```bash
cd engines
./mvnw spring-boot:run
```

### Manual Execution

If you need to run migrations manually:

```bash
# Using psql
psql -U postgres -d MoneyPlant -f src/main/resources/db/migration/V1__create_timescaledb_schema.sql

# Using Flyway CLI
flyway -url=jdbc:postgresql://localhost:5432/MoneyPlant \
       -user=postgres \
       -password=mysecretpassword \
       migrate
```

## Verification

After running migrations, verify the setup:

```sql
-- Check if TimescaleDB extension is installed
SELECT * FROM pg_extension WHERE extname = 'timescaledb';

-- Check hypertables
SELECT * FROM timescaledb_information.hypertables;

-- Check compression policies
SELECT * FROM timescaledb_information.compression_settings;

-- Check continuous aggregates
SELECT * FROM timescaledb_information.continuous_aggregates;

-- Check chunk information
SELECT * FROM timescaledb_information.chunks;

-- Test tick data insertion
INSERT INTO nse_eq_ticks (time, symbol, price, volume)
VALUES (NOW(), 'RELIANCE', 2450.50, 1000000);

-- Query latest tick
SELECT * FROM get_latest_tick('RELIANCE');
```

## Rollback

To rollback migrations (use with caution):

```sql
-- Drop tables in reverse order
DROP MATERIALIZED VIEW IF EXISTS daily_candles CASCADE;
DROP TABLE IF EXISTS archival_metadata CASCADE;
DROP TABLE IF EXISTS nse_eq_ticks CASCADE;
-- Note: nse_eq_ohlcv_historic is not dropped as it may contain existing data

-- Drop functions
DROP FUNCTION IF EXISTS get_latest_tick(VARCHAR);
DROP FUNCTION IF EXISTS get_tick_count_for_date(DATE);
```

## Performance Tuning

### Recommended PostgreSQL Settings

Add to `postgresql.conf`:

```ini
# TimescaleDB settings
shared_preload_libraries = 'timescaledb'
timescaledb.max_background_workers = 8

# Memory settings
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 64MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Parallel query settings
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

### Monitoring Queries

```sql
-- Check table sizes
SELECT 
    hypertable_name,
    pg_size_pretty(hypertable_size(format('%I.%I', hypertable_schema, hypertable_name)::regclass)) AS size
FROM timescaledb_information.hypertables;

-- Check compression ratio
SELECT 
    chunk_schema || '.' || chunk_name AS chunk,
    pg_size_pretty(before_compression_total_bytes) AS before,
    pg_size_pretty(after_compression_total_bytes) AS after,
    ROUND((1 - after_compression_total_bytes::numeric / before_compression_total_bytes::numeric) * 100, 2) AS compression_ratio
FROM timescaledb_information.compressed_chunk_stats
ORDER BY before_compression_total_bytes DESC
LIMIT 10;

-- Check chunk statistics
SELECT 
    hypertable_name,
    chunk_name,
    range_start,
    range_end,
    pg_size_pretty(total_bytes) AS size
FROM timescaledb_information.chunks
ORDER BY range_start DESC
LIMIT 10;
```

## Troubleshooting

### Issue: TimescaleDB extension not found

**Solution**: Install TimescaleDB extension (see Installation section above)

### Issue: Permission denied on create_hypertable

**Solution**: Ensure the database user has superuser privileges or the `timescaledb` role:

```sql
GRANT timescaledb TO your_app_user;
```

### Issue: Migration fails with "relation already exists"

**Solution**: The script is idempotent. If tables already exist, it will skip creation. Check logs for specific errors.

### Issue: Compression policy not working

**Solution**: Ensure background workers are configured:

```sql
-- Check background workers
SELECT * FROM timescaledb_information.jobs;

-- Manually run compression job
CALL run_job(job_id);
```

## Additional Resources

- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
