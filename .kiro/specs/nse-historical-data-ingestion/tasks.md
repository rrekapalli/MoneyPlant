# NSE Historical Data Ingestion - Implementation Tasks

## Overview

This implementation plan focuses on building a Java-based service to download NSE bhavcopy files and store raw OHLCV data in PostgreSQL/TimescaleDB. The implementation will integrate with the existing Ingestion Engine architecture.

## Task List

- [x] 1. Set up project structure and database schema
  - Create historical ingestion module under `engines/src/main/java/com/moneyplant/engines/ingestion/historical/`
  - Update `nse_eq_ohlcv_historic` table schema to match bhav copy columns
  - Remove `created_at` and `updated_at` columns if they exist
  - Create `ingestion_jobs` table for job tracking
  - Add necessary Maven dependencies:
    - Spring WebFlux (WebClient for HTTP requests)
    - Apache Spark (spark-core, spark-sql)
    - PostgreSQL JDBC driver
    - Resilience4j for retry logic
  - Create staging directory configuration
  - _Requirements: 1.1, 1.4, 2.1_

- [x] 2. Implement data models
  - [x] 2.1 Create BhavCopyData model
    - Include all bhav copy fields: symbol, series, date, time, prev_close, open, high, low, last, close, avg_price, volume, turnover_lacs, no_of_trades, deliv_qty, deliv_per
    - Add validation annotations
    - _Requirements: 1.5_
  
  - [x] 2.2 Create IngestionJob entity
    - Map to `ingestion_jobs` table
    - Include fields: jobId, jobType, status, startDate, endDate, symbols, totalDates, processedDates, totalRecords, insertedRecords, failedRecords, errorMessage, startedAt, completedAt
    - Create IngestionJobStatus enum (PENDING, RUNNING, COMPLETED, FAILED, TIMEOUT)
    - _Requirements: 3.5, 3.7, 3.8_
  
  - [x] 2.3 Create IngestionResult model
    - Include summary fields: totalDatesProcessed, totalRecordsProcessed, totalRecordsInserted, totalRecordsFailed, duration
    - Implement merge() method for combining results
    - _Requirements: 2.9_

- [x] 3. Implement NSE bhavcopy downloader
  - [x] 3.1 Create NseBhavCopyDownloader service
    - Implement NSE session initialization with proper headers (User-Agent, Referer, Accept)
    - Visit NSE homepage to set cookies
    - _Requirements: 1.1, 1.3_
  
  - [x] 3.2 Implement download logic
    - Build URL: `https://www.nseindia.com/content/historical/EQUITIES/{year}/{month}/cm{DDMMMYYYY}bhav.csv.zip`
    - Download ZIP file using WebClient
    - Handle 404 as missing data (weekend/holiday)
    - Implement retry logic: 6 attempts with exponential backoff (1s, 2s, 4s, 8s, 16s, 32s)
    - Add 300ms delay between consecutive downloads
    - _Requirements: 1.2, 1.8, 1.9, 1.10, 6.1, 6.2_
  
  - [x] 3.3 Implement ZIP extraction to staging directory
    - Extract ZIP file and save CSV to staging directory
    - Use filename format: bhav_{YYYYMMDD}.csv
    - Create staging directory: /tmp/bhav_staging/{jobId}/
    - _Requirements: 1.4, 1.12_

- [x] 4. Implement Spark processing service
  - [x] 4.1 Create SparkConfig
    - Configure SparkSession with optimal settings
    - Set master: local[*] (use all cores)
    - Set executor memory: 4GB
    - Set driver memory: 2GB
    - Enable adaptive query execution
    - _Requirements: 1.5_
  
  - [x] 4.2 Create SparkProcessingService
    - Implement processAndStore() method
    - Read all CSV files from staging directory using Spark
    - Apply schema mapping and transformations
    - Convert DATE1 to timestamp
    - Add timeframe column with value '1day'
    - _Requirements: 1.5, 1.6, 1.7_
  
  - [x] 4.3 Implement Spark JDBC bulk insert
    - Use Spark JDBC writer with SaveMode.Append
    - Configure batch size: 10,000 records
    - Configure num partitions: 4 (parallel connections)
    - Write to nse_eq_ohlcv_historic table
    - _Requirements: 2.2, 2.3, 2.7_
  
  - [x] 4.4 Implement error handling
    - Log Spark processing errors
    - Skip invalid rows during transformation
    - Return ingestion statistics
    - _Requirements: 1.11, 2.8_

- [x] 5. Implement repository layer
  - [x] 5.1 Create HistoricalOhlcvRepository
    - Implement getMaxDate() - returns MAX(time) across all data
    - Used for incremental ingestion detection
    - _Requirements: 3.1, 3.2_
  
  - [x] 5.2 Create IngestionJobRepository
    - Implement CRUD operations for IngestionJob entity
    - findByJobId(), save(), update()
    - _Requirements: 4.5, 4.6_

- [x] 6. Implement date range resolution service
  - [x] 6.1 Create DateRangeResolver service
    - Implement resolveDateRange() method
    - If both dates provided → use them
    - If no startDate → query nse_eq_ohlcv_historic for MAX(time)
    - If MAX(time) found → use MAX(time) + 1 as start (incremental)
    - If no existing data → use default 1998-01-01
    - If no endDate → use current date
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 6.2 Implement logging for date resolution
    - Log "Incremental ingestion from {max_date + 1} to {end_date}"
    - Log "Full ingestion from {start_date} to {end_date}"
    - _Requirements: 3.6, 3.7_
  
  - [x] 6.3 Create DateRange model
    - Simple POJO with start and end LocalDate fields
    - _Requirements: 3.1_

- [ ] 7. Implement job management service
  - [ ] 7.1 Create HistoricalDataJobService
    - Implement createJob() to initialize job record
    - Implement updateStatus() to update job status
    - Implement updateProgress() to track processed dates and records
    - Implement completeJob() to mark job as completed with statistics
    - Implement failJob() to mark job as failed with error message
    - Implement getJob() to query job status
    - _Requirements: 4.5, 4.6, 4.7, 4.8_
  
  - [ ] 7.2 Implement progress calculation
    - Calculate progress percentage: (processedDates / totalDates) × 100
    - Estimate time remaining based on average processing time per date
    - _Requirements: 5.7_

- [ ] 8. Implement ingestion orchestration service
  - [ ] 8.1 Create NseBhavCopyIngestionService
    - Implement startIngestion() to resolve date range
    - Use DateRangeResolver to determine date range
    - Use @Async for non-blocking execution
    - Return job ID immediately
    - _Requirements: 3.1, 4.5_
  
  - [ ] 8.2 Implement ingestion pipeline
    - Download bhavcopy files to staging directory
    - Trigger Spark processing for bulk insert
    - Clean up staging directory after processing
    - Update job progress
    - Handle errors and continue processing
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.12, 2.2, 3.8, 3.10_
  
  - [ ] 8.3 Implement logging
    - Log ingestion start with date range and total days
    - Log progress for each date: "Processing date {date} ({current}/{total})"
    - Log number of records from Spark processing
    - Log Spark bulk insert statistics
    - Log errors with date and exception details
    - Log summary on completion: total dates, records, errors, duration
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ] 8.4 Implement staging directory cleanup
    - Delete all CSV files after successful processing
    - Delete staging directory
    - Handle cleanup errors gracefully
    - _Requirements: 1.12_
  
  - [ ] 8.5 Implement timeout handling
    - Cancel job if execution exceeds configured timeout (default 6 hours)
    - Mark job as TIMEOUT status
    - _Requirements: 6.6_

- [ ] 9. Implement REST API endpoints
  - [ ] 9.1 Create HistoricalIngestionController
    - POST /api/v1/ingestion/historical/nse - trigger ingestion
    - Accept parameters: startDate (optional), endDate (optional)
    - Return job ID immediately
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [ ] 9.2 Implement job status endpoint
    - GET /api/v1/ingestion/historical/nse/{jobId} - query job status
    - Return: status, progress percentage, current date, total records, inserted records, failed records, error message
    - _Requirements: 4.6, 4.7, 4.8, 5.7_
  
  - [ ] 9.3 Create request/response DTOs
    - IngestionRequest: startDate (optional), endDate (optional)
    - IngestionJobResponse: jobId, message, status, progressPercentage, currentDate, totalRecords, insertedRecords, failedRecords, errorMessage
    - _Requirements: 4.1, 4.2_

- [ ] 10. Implement configuration
  - [ ] 10.1 Create HistoricalIngestionConfig
    - Define configuration properties under `ingestion.nse.historical`
    - base-url (default: https://www.nseindia.com)
    - download-delay-ms (default: 300)
    - max-retries (default: 6)
    - retry-backoff-multiplier (default: 2.0)
    - job-timeout-hours (default: 6)
    - staging-directory (default: /tmp/bhav_staging)
    - default-start-date (default: 1998-01-01)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ] 10.2 Create SparkConfig
    - Define Spark configuration properties under `spark`
    - app-name (default: NSE-Bhav-Ingestion)
    - master (default: local[*])
    - executor-memory (default: 4g)
    - driver-memory (default: 2g)
    - jdbc.batch-size (default: 10000)
    - jdbc.num-partitions (default: 4)
    - _Requirements: 1.5, 2.3, 2.7_
  
  - [ ] 10.3 Configure Spring profiles
    - Create application-dev.yml, application-test.yml, application-prod.yml
    - Support profile-specific overrides
    - _Requirements: 7.7_
  
  - [ ] 10.4 Implement configuration validation
    - Validate required settings on startup
    - Fail fast if configuration is invalid
    - _Requirements: 7.9_

- [ ] 12. Implement error handling and resilience
  - [ ] 12.1 Configure retry policy
    - Use Resilience4j or Spring Retry
    - Retry downloads up to 6 times with exponential backoff
    - _Requirements: 6.1_
  
  - [ ] 12.2 Implement database retry
    - Retry batch inserts up to 3 times on connection failures
    - Log failed batches and continue with next batch
    - _Requirements: 6.4, 6.5_
  
  - [ ] 12.3 Implement resume functionality
    - Track last successfully processed date in job record
    - Support resuming interrupted jobs
    - _Requirements: 6.8_

- [ ] 13. Testing
  - [ ] 13.1 Create unit tests
    - Test DateRangeResolver logic
    - Test date range generation
    - Test URL formatting
    - Test Spark transformations with sample data
    - _Requirements: All_
  
  - [ ] 13.2 Create integration tests
    - Test Spark processing with sample CSV files
    - Test database operations with Testcontainers
    - Test date range resolution with mock data
    - Test complete ingestion flow with mock NSE responses
    - Test incremental ingestion scenarios
    - Test error handling and retry logic
    - Test staging directory cleanup
    - _Requirements: All_
  
  - [ ] 13.3 Create end-to-end tests
    - Test REST API endpoints
    - Test job status tracking
    - Test concurrent job execution
    - Test incremental ingestion via API
    - Test Spark bulk insert performance
    - _Requirements: 4.1, 4.6_

- [ ] 14. Documentation
  - [ ] 14.1 Create README
    - Setup instructions
    - Spark configuration guide
    - API documentation (simplified - only date parameters)
    - Date range resolution behavior
    - Incremental ingestion examples
    - Staging directory management
    - Performance tuning tips
    - _Requirements: All_
  
  - [ ] 14.2 Create deployment guide
    - Docker deployment with Spark
    - Kubernetes deployment
    - Spark resource allocation
    - Troubleshooting guide
    - _Requirements: All_

## Implementation Notes

### Leveraging Existing Code

**Existing Infrastructure:**
- Use existing `engines` module structure
- Reuse existing database connection configuration
- Leverage existing Spring Boot setup
- Use existing logging configuration

**Database:**
- Update existing `nse_eq_ohlcv_historic` table schema
- Ensure TimescaleDB hypertable is configured
- Create new `ingestion_jobs` table

### Technology Stack

- Java 21
- Spring Boot 3.x
- Spring WebFlux (WebClient for HTTP requests)
- Project Reactor (Flux/Mono for reactive streams)
- Apache Spark 3.5+ (CSV processing and bulk inserts)
- PostgreSQL/TimescaleDB
- Resilience4j for retry logic
- Spring Boot Actuator for monitoring
- Testcontainers for integration testing

### Development Approach

1. Start with data models and database schema
2. Implement downloader (save to staging directory)
3. Implement Spark processing service
4. Implement repository layer (simplified)
5. Implement date range resolution
6. Implement service layer (job management + ingestion orchestration)
7. Implement REST API (simplified - only date parameters)
8. Add configuration (Spark + ingestion)
9. Add error handling and monitoring
10. Write tests (including Spark tests)
11. Create documentation

### Success Criteria

- Successfully download NSE bhavcopy files to staging directory
- Process all CSV files using Apache Spark in parallel
- Store all symbols (no filtering) in `nse_eq_ohlcv_historic` table using bulk inserts
- Achieve 100,000+ records/second insert rate with Spark
- Handle errors gracefully with retry logic
- Track job progress and status
- Provide simplified REST API (only date parameters)
- Support incremental ingestion (automatic date range detection)
- Clean up staging directory after processing
- Complete ingestion for years of historical data efficiently

