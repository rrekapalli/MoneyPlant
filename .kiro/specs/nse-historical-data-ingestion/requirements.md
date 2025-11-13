# NSE Historical Data Ingestion with Corporate Actions - Requirements Document

## Introduction

This specification defines the requirements for implementing a Java-based NSE historical data ingestion service that replaces the Python-based bhav copy pipeline. The system will download NSE bhavcopy CSV files, process them in-memory, apply corporate action adjustments, calculate 52-week high/low values, and store the data directly in PostgreSQL/TimescaleDB.

The implementation will leverage the existing Ingestion Engine architecture (`engines/src/main/java/com/moneyplant/engines/ingestion/`) and integrate seamlessly with the current market data infrastructure. This service will provide adjusted historical OHLCV data for backtesting, strategy development, and portfolio analysis.

## Glossary

- **BhavCopy**: Daily settlement file published by NSE containing OHLCV data for all traded securities
- **OHLCV**: Open, High, Low, Close, Volume - standard market data format
- **NSEDataProvider**: Service responsible for fetching data from NSE APIs
- **TimescaleDB**: PostgreSQL extension optimized for time-series data
- **ApacheSpark**: Distributed data processing engine for parallel CSV processing
- **SparkDataFrame**: Distributed collection of data organized into named columns
- **BulkInsert**: Inserting large batches of database records in a single operation for optimal performance
- **ParallelProcessing**: Processing multiple CSV files concurrently using Spark workers

## Requirements

### Requirement 1: NSE Bhavcopy Download and Spark Processing

**User Story:** As a data engineer, I want to download NSE bhavcopy CSV files for a date range and process them using Apache Spark, so that I can ingest historical market data efficiently with parallel processing and bulk inserts.

#### Acceptance Criteria

1. WHEN historical data ingestion is initiated with start and end dates THEN the IngestionEngine SHALL download bhavcopy CSV files from NSE for each trading day in the range
2. WHEN downloading bhavcopy files THEN the IngestionEngine SHALL use the URL format `https://www.nseindia.com/content/historical/EQUITIES/{year}/{month}/cm{DDMMMYYYY}bhav.csv.zip`
3. WHEN NSE session is established THEN the IngestionEngine SHALL set required headers (User-Agent, Referer) and initialize cookies by visiting the NSE homepage
4. WHEN a bhavcopy file is downloaded THEN the IngestionEngine SHALL extract the ZIP file and save CSV content to a temporary staging directory
5. WHEN all CSV files are downloaded THEN the IngestionEngine SHALL use Apache Spark to read and process all CSV files in parallel
6. WHEN Spark reads CSV files THEN the IngestionEngine SHALL infer schema and map CSV columns: SYMBOL→symbol, SERIES→series, DATE1→time (converted to TIMESTAMPTZ), PREV_CLOSE→prev_close, OPEN_PRICE→open, HIGH_PRICE→high, LOW_PRICE→low, LAST_PRICE→last, CLOSE_PRICE→close, AVG_PRICE→avg_price, TTL_TRD_QNTY→volume, TURNOVER_LACS→turnover_lacs, NO_OF_TRADES→no_of_trades, DELIV_QTY→deliv_qty, DELIV_PER→deliv_per
7. WHEN Spark processes data THEN the IngestionEngine SHALL filter symbols based on universe or explicit symbol list using Spark DataFrame operations
8. WHEN a download fails with 404 status THEN the IngestionEngine SHALL skip the date (weekend/holiday) and continue with the next date
9. WHEN a download fails with other errors THEN the IngestionEngine SHALL retry up to 6 times with exponential backoff starting at 1 second
10. WHEN rate limiting is needed THEN the IngestionEngine SHALL implement a 300ms delay between consecutive downloads to avoid being blocked
11. WHEN Spark processing encounters invalid data THEN the IngestionEngine SHALL log the error and skip the invalid row while continuing to process valid rows
12. WHEN processing completes THEN the IngestionEngine SHALL clean up temporary CSV files from staging directory

### Requirement 2: PostgreSQL/TimescaleDB Storage with Spark Bulk Insert

**User Story:** As a system administrator, I want historical OHLCV data stored efficiently in PostgreSQL/TimescaleDB using Spark bulk inserts, so that I can achieve maximum write throughput and minimize ingestion time.

#### Acceptance Criteria

1. WHEN storing historical data THEN the IngestionEngine SHALL use the existing `nse_eq_ohlcv_historic` TimescaleDB hypertable
2. WHEN inserting data THEN the IngestionEngine SHALL use Spark JDBC writer with bulk insert mode for optimal performance
3. WHEN Spark writes to database THEN the IngestionEngine SHALL use batch size of 10000 records per batch (configurable)
4. WHEN duplicate data is detected THEN the IngestionEngine SHALL implement upsert logic using ON CONFLICT (symbol, time, timeframe) DO UPDATE
5. WHEN data is inserted THEN the IngestionEngine SHALL include columns: time, symbol, series, timeframe, prev_close, open, high, low, last, close, avg_price, volume, turnover_lacs, no_of_trades, deliv_qty, deliv_per
6. WHEN timeframe is set THEN the IngestionEngine SHALL use '1day' for daily bhavcopy data
7. WHEN Spark writes data THEN the IngestionEngine SHALL use multiple parallel connections (configurable, default 4) for faster writes
8. WHEN storage operation fails THEN the IngestionEngine SHALL log the error with symbol and date information for troubleshooting
9. WHEN ingestion completes THEN the IngestionEngine SHALL return a summary with total records processed, inserted, and failed
8. WHEN storage operation fails THEN the IngestionEngine SHALL log the error with symbol and date information for troubleshooting
9. WHEN ingestion completes THEN the IngestionEngine SHALL return a summary with total records processed, inserted, and failed
10. WHEN created_at or updated_at columns exist THEN the IngestionEngine SHALL remove these columns as they are not required

### Requirement 3: Smart Date Range Detection

**User Story:** As a data engineer, I want the system to automatically determine the appropriate date range for ingestion based on existing data, so that I can efficiently update historical data without manual date calculations.

#### Acceptance Criteria

1. WHEN start date is not provided THEN the IngestionEngine SHALL query `nse_eq_ohlcv_historic` table to get MAX(time) across all data
2. WHEN MAX(time) is found THEN the IngestionEngine SHALL use MAX(time) + 1 day as the start date for incremental ingestion
3. WHEN no existing data is found THEN the IngestionEngine SHALL use a default start date of 1998-01-01 (NSE historical data availability)
4. WHEN end date is not provided THEN the IngestionEngine SHALL use current date as the end date
5. WHEN both start and end dates are provided explicitly THEN the IngestionEngine SHALL use the provided dates without querying existing data
6. WHEN incremental ingestion is detected (MAX(time) exists) THEN the IngestionEngine SHALL log "Incremental ingestion from {max_date + 1} to {end_date}"
7. WHEN full ingestion is detected (no existing data) THEN the IngestionEngine SHALL log "Full ingestion from {start_date} to {end_date}"
8. WHEN date range is resolved THEN the IngestionEngine SHALL download bhavcopy files for each date in the range
9. WHEN bhavcopy file is parsed THEN the IngestionEngine SHALL filter symbols based on universe or explicit symbol list before storing
10. WHEN no universe or symbols are specified THEN the IngestionEngine SHALL store all symbols from the bhavcopy file

### Requirement 4: Service Integration and API

**User Story:** As an application developer, I want REST API endpoints to trigger historical data ingestion and query ingestion status, so that I can integrate historical data loading into my workflows.

#### Acceptance Criteria

1. WHEN REST API is called THEN the IngestionEngine SHALL provide endpoint POST `/api/v1/ingestion/historical/nse` to trigger bhavcopy ingestion
2. WHEN ingestion request is received THEN the IngestionEngine SHALL accept parameters: startDate (optional), endDate (optional)
3. WHEN no parameters are provided THEN the IngestionEngine SHALL use smart date range detection (incremental ingestion from MAX(time) + 1)
4. WHEN bhavcopy files are processed THEN the IngestionEngine SHALL store all symbols from each file without filtering
5. WHEN ingestion is triggered THEN the IngestionEngine SHALL execute asynchronously and return a job ID immediately
6. WHEN job status is queried THEN the IngestionEngine SHALL provide endpoint GET `/api/v1/ingestion/historical/nse/{jobId}` returning status, progress, and summary
7. WHEN ingestion completes THEN the IngestionEngine SHALL update job status to 'COMPLETED' with statistics (records processed, duration, errors)
8. WHEN ingestion fails THEN the IngestionEngine SHALL update job status to 'FAILED' with error details

### Requirement 5: Progress Tracking and Monitoring

**User Story:** As a DevOps engineer, I want real-time progress tracking and logging for historical data ingestion, so that I can monitor long-running jobs and troubleshoot issues.

#### Acceptance Criteria

1. WHEN ingestion starts THEN the IngestionEngine SHALL log the start time, date range, and total days to process
2. WHEN processing each date THEN the IngestionEngine SHALL log progress with format: "Processing date {date} ({current}/{total})"
3. WHEN download succeeds THEN the IngestionEngine SHALL log the number of records parsed from the bhavcopy file
4. WHEN batch insert completes THEN the IngestionEngine SHALL log the number of records inserted and batch execution time
5. WHEN errors occur THEN the IngestionEngine SHALL log error details with symbol, date, and exception message
6. WHEN ingestion completes THEN the IngestionEngine SHALL log summary statistics: total dates processed, total records inserted, total errors, total duration
7. WHEN progress is queried via API THEN the IngestionEngine SHALL return current progress percentage, estimated time remaining, and current processing date
8. WHEN monitoring metrics are exposed THEN the IngestionEngine SHALL provide Prometheus metrics for ingestion rate, error rate, and processing latency

### Requirement 6: Error Handling and Resilience

**User Story:** As a system reliability engineer, I want robust error handling and retry mechanisms, so that the ingestion process can recover from transient failures without manual intervention.

#### Acceptance Criteria

1. WHEN network errors occur THEN the IngestionEngine SHALL retry failed downloads up to 3 times with exponential backoff
2. WHEN NSE returns non-200 status codes THEN the IngestionEngine SHALL log the status code and response body for debugging
3. WHEN CSV parsing fails THEN the IngestionEngine SHALL skip the invalid row and continue processing remaining rows
4. WHEN database connection fails THEN the IngestionEngine SHALL retry the batch insert up to 3 times before failing the job
5. WHEN partial batch insert fails THEN the IngestionEngine SHALL log failed records and continue with next batch
6. WHEN job execution exceeds timeout (configurable, default 6 hours) THEN the IngestionEngine SHALL cancel the job and mark as 'TIMEOUT'
7. WHEN system resources are exhausted THEN the IngestionEngine SHALL implement backpressure by limiting concurrent date processing to 5 dates
8. WHEN ingestion is interrupted THEN the IngestionEngine SHALL support resume functionality by tracking last successfully processed date

### Requirement 7: Configuration and Deployment

**User Story:** As a system administrator, I want flexible configuration for NSE data ingestion parameters, so that I can tune performance and behavior for different environments.

#### Acceptance Criteria

1. WHEN configuration is loaded THEN the IngestionEngine SHALL read settings from `application.yml` under `ingestion.nse.historical` section
2. WHEN NSE API URL is configured THEN the IngestionEngine SHALL use configurable base URL (default: https://www.nseindia.com)
3. WHEN rate limiting is configured THEN the IngestionEngine SHALL use configurable delay between downloads (default: 300ms)
4. WHEN retry policy is configured THEN the IngestionEngine SHALL use configurable max retries (default: 3) and backoff multiplier (default: 2.0)
5. WHEN batch size is configured THEN the IngestionEngine SHALL use configurable batch size for database inserts (default: 1000)
6. WHEN timeout is configured THEN the IngestionEngine SHALL use configurable job timeout (default: 6 hours)
7. WHEN environment-specific settings are needed THEN the IngestionEngine SHALL support Spring profiles (dev, test, prod) with profile-specific overrides
8. WHEN configuration changes THEN the IngestionEngine SHALL support hot reload of non-critical settings without restart
9. WHEN deployment occurs THEN the IngestionEngine SHALL validate configuration on startup and fail fast if required settings are missing
