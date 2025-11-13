# Task 1: Setup Complete

## ✅ Completed Items

### 1. Project Structure Created
Created the historical ingestion module under `engines/src/main/java/com/moneyplant/engines/ingestion/historical/` with the following structure:

```
historical/
├── config/          # Configuration classes (Spark, Ingestion settings)
├── controller/      # REST API endpoints
├── model/           # Data models and entities
├── provider/        # Data providers (NSE downloader)
├── repository/      # Database repositories
├── service/         # Business logic services
├── README.md        # Module documentation
└── SETUP_COMPLETE.md # This file
```

### 2. Database Schema Updated
Created migration file: `V3__update_nse_eq_ohlcv_historic_for_bhav_copy.sql`

**Changes to `nse_eq_ohlcv_historic` table:**
- ✅ Removed `created_at` and `updated_at` columns
- ✅ Added bhav copy specific columns:
  - `series` VARCHAR(10) - Series type (EQ, BE, etc.)
  - `prev_close` NUMERIC(18,4) - Previous day closing price
  - `last` NUMERIC(18,4) - Last traded price
  - `avg_price` NUMERIC(18,4) - Average traded price
  - `turnover_lacs` NUMERIC(20,2) - Total turnover in lakhs
  - `no_of_trades` INTEGER - Number of trades
  - `deliv_qty` BIGINT - Delivery quantity
  - `deliv_per` NUMERIC(5,2) - Delivery percentage
- ✅ Created unique constraint on (time, symbol, timeframe)
- ✅ Created index on series column

**Created `ingestion_jobs` table:**
- ✅ Tracks job execution with fields:
  - job_id (UUID)
  - job_type (NSE_BHAV_COPY, etc.)
  - status (PENDING, RUNNING, COMPLETED, FAILED, TIMEOUT)
  - start_date, end_date
  - symbols (optional filter)
  - progress tracking (total_dates, processed_dates)
  - record counts (total_records, inserted_records, failed_records)
  - timestamps (started_at, completed_at)
  - error_message
- ✅ Created indexes for efficient querying

### 3. Maven Dependencies Verified
All required dependencies are already present in `pom.xml`:
- ✅ Spring WebFlux (spring-boot-starter-webflux) - for WebClient HTTP requests
- ✅ Apache Spark Core (spark-core_2.12 v3.3.2) - for distributed processing
- ✅ Apache Spark SQL (spark-sql_2.12 v3.3.2) - for CSV processing and JDBC
- ✅ PostgreSQL JDBC driver (postgresql) - for database connectivity
- ✅ Resilience4j (resilience4j-spring-boot3 v2.1.0) - for retry logic
- ✅ Project Reactor (reactor-core) - for reactive programming

### 4. Configuration Files Created

**Main Configuration (`application.yml`):**
- ✅ Added `ingestion.providers.nse.historical` section with:
  - base-url: https://www.nseindia.com
  - download-delay-ms: 300
  - max-retries: 6
  - retry-backoff-multiplier: 2.0
  - job-timeout-hours: 6
  - staging-directory: /tmp/bhav_staging
  - default-start-date: 1998-01-01

- ✅ Updated `spark` section with:
  - JDBC batch-size: 10000
  - JDBC num-partitions: 4
  - Environment variable support for all settings

**Profile-Specific Configurations:**
- ✅ `application-dev.yml` - Development settings
  - Local Spark (local[*])
  - Smaller batch sizes
  - Debug logging enabled
  
- ✅ `application-test.yml` - Testing settings
  - Single-threaded Spark (local[1])
  - Minimal batch sizes
  - No download delays
  
- ✅ `application-prod.yml` - Production settings
  - External Spark cluster
  - Larger batch sizes (20000)
  - More partitions (8)
  - Minimal logging

### 5. Staging Directory Configuration
- ✅ Configured in application.yml
- ✅ Environment-specific paths:
  - Dev: /tmp/bhav_staging_dev
  - Test: /tmp/bhav_staging_test
  - Prod: /data/bhav_staging (configurable via env var)

## Requirements Satisfied

- ✅ **Requirement 1.1**: Project structure created for historical ingestion
- ✅ **Requirement 1.4**: Staging directory configuration added
- ✅ **Requirement 2.1**: Database schema updated to match bhav copy format

## Next Steps

The project structure and database schema are now ready. The next tasks will implement:
- Task 2: Data models (BhavCopyData, IngestionJob, IngestionResult)
- Task 3: NSE bhavcopy downloader
- Task 4: Spark processing service
- Task 5: Repository layer
- And so on...

## Running the Migration

To apply the database migration:

```bash
# The migration will run automatically on application startup
cd engines
mvn spring-boot:run

# Or manually run Flyway migration
mvn flyway:migrate
```

## Verification

To verify the setup:

1. Check that the directory structure exists:
   ```bash
   ls -la engines/src/main/java/com/moneyplant/engines/ingestion/historical/
   ```

2. Check that the migration file exists:
   ```bash
   ls -la engines/src/main/resources/db/migration/V3__*.sql
   ```

3. Check that configuration files exist:
   ```bash
   ls -la engines/src/main/resources/application*.yml
   ```

4. After running the application, verify the database schema:
   ```sql
   -- Check nse_eq_ohlcv_historic columns
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'nse_eq_ohlcv_historic'
   ORDER BY ordinal_position;
   
   -- Check ingestion_jobs table
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'ingestion_jobs'
   ORDER BY ordinal_position;
   ```
