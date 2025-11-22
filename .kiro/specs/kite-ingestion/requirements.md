# Requirements Document

## Introduction

The Kite Ingestion System is a Java-based data pipeline that fetches market data from Zerodha's Kite Connect API and stores it in PostgreSQL. This system will be implemented in the `engines` module under the `com.moneyplant.engines.ingestion` package, following Spring Boot best practices and the existing architecture patterns in the MoneyPlant platform. The system consists of two main components: (1) importing the complete instrument master list from Kite Connect, and (2) fetching historical OHLCV data for instruments.

## Glossary

- **Kite Connect API**: Zerodha's REST API for accessing market data and trading functionality
- **Instrument**: A tradable security (equity, derivative, commodity, etc.) with metadata like symbol, exchange, token, etc.
- **Kite Instrument Master**: PostgreSQL table storing master data for all instruments from Kite Connect API
- **Trading Symbol**: The unique identifier for an instrument on an exchange (e.g., 'RELIANCE', 'TCS')
- **Instrument Token**: Zerodha's unique numeric identifier for each instrument
- **Exchange Token**: Exchange-specific identifier for an instrument
- **Segment**: The market segment where an instrument trades (e.g., 'NSE', 'BSE', 'NFO-FUT', 'NFO-OPT')
- **OHLCV Data**: Open, High, Low, Close, Volume market data for a specific timeframe
- **Timeframe**: The interval for OHLCV data (e.g., 'minute', 'day', '5minute', '15minute')
- **Backfill**: The process of fetching historical data for a date range
- **Engines Module**: The Spring Boot application in `./engines` that handles data ingestion

## Requirements

### Requirement 1

**User Story:** As a data engineer, I want to fetch the complete instrument list from Kite Connect API, so that I have up-to-date master data for all tradable instruments.

#### Acceptance Criteria

1. WHEN the system initiates an instrument fetch THEN the Kite Ingestion System SHALL authenticate with Kite Connect API using valid credentials stored in application configuration
2. WHEN authentication succeeds THEN the Kite Ingestion System SHALL retrieve the complete instrument list from the endpoint "https://api.kite.trade/instruments"
3. WHEN the instrument list is retrieved THEN the Kite Ingestion System SHALL parse all instrument fields including tradingsymbol, exchange, instrument_token, exchange_token, instrument_type, name, segment, expiry, strike, tick_size, and lot_size
4. WHEN parsing completes THEN the Kite Ingestion System SHALL validate that all required fields (instrument_token, exchange, tradingsymbol) are present for each instrument
5. WHEN validation succeeds THEN the Kite Ingestion System SHALL transform the data to match the target database schema

### Requirement 2

**User Story:** As a database administrator, I want the system to create a kite_instrument_master table with a schema matching the Kite API response, so that all instrument data can be stored efficiently.

#### Acceptance Criteria

1. WHEN the system initializes THEN the Kite Ingestion System SHALL create a kite_instrument_master table using Flyway migrations if it does not exist
2. WHEN the table is created THEN the Kite Ingestion System SHALL include columns for instrument_token, exchange, tradingsymbol, exchange_token, instrument_type, name, segment, expiry, strike, tick_size, and lot_size
3. WHEN defining column types THEN the Kite Ingestion System SHALL use appropriate PostgreSQL data types matching the Kite API response format
4. WHEN the table is created THEN the Kite Ingestion System SHALL set a composite primary key on (instrument_token, exchange) for uniqueness
5. WHEN the table is created THEN the Kite Ingestion System SHALL create indexes on tradingsymbol, exchange, and instrument_type for query performance

### Requirement 3

**User Story:** As a data engineer, I want the system to store fetched instruments in the kite_instrument_master table using Spring Data JPA, so that the data is persisted and available for downstream applications.

#### Acceptance Criteria

1. WHEN instrument data is ready for storage THEN the Kite Ingestion System SHALL map Kite API fields to JPA entity fields
2. WHEN field mapping is complete THEN the Kite Ingestion System SHALL use Spring Data JPA repository save operations with merge semantics for upsert behavior
3. WHEN performing upserts THEN the Kite Ingestion System SHALL use the composite key (instrument_token, exchange) for conflict resolution
4. WHEN upsert operations complete THEN the Kite Ingestion System SHALL log the count of inserted and updated records
5. WHEN database errors occur THEN the Kite Ingestion System SHALL rollback the transaction using Spring's @Transactional annotation

### Requirement 4

**User Story:** As a system operator, I want the ingestion process to follow Spring Boot best practices with service layer architecture, so that the codebase is maintainable and testable.

#### Acceptance Criteria

1. WHEN the module is structured THEN the Kite Ingestion System SHALL organize code into service, repository, model, and config packages under com.moneyplant.engines.ingestion
2. WHEN business logic is implemented THEN the Kite Ingestion System SHALL place it in service classes annotated with @Service
3. WHEN database access is needed THEN the Kite Ingestion System SHALL use Spring Data JPA repositories extending JpaRepository
4. WHEN configuration is required THEN the Kite Ingestion System SHALL use Spring's @ConfigurationProperties for externalized configuration
5. WHEN the service executes THEN the Kite Ingestion System SHALL use SLF4J with Logback for logging following existing patterns

### Requirement 5

**User Story:** As a system operator, I want comprehensive error handling and logging using Spring Boot patterns, so that I can monitor the ingestion process and troubleshoot issues effectively.

#### Acceptance Criteria

1. WHEN any operation executes THEN the Kite Ingestion System SHALL log the operation start time and completion status using SLF4J
2. WHEN API calls are made THEN the Kite Ingestion System SHALL implement retry logic using Resilience4j with exponential backoff for transient failures
3. WHEN errors occur THEN the Kite Ingestion System SHALL log detailed error messages including context and stack traces
4. WHEN authentication fails THEN the Kite Ingestion System SHALL throw a custom KiteAuthenticationException with clear error messages
5. WHEN operations complete THEN the Kite Ingestion System SHALL log summary statistics including record counts and execution duration

### Requirement 6

**User Story:** As a developer, I want the system to use Spring's WebClient for HTTP communication with Kite API, so that API interactions are non-blocking and efficient.

#### Acceptance Criteria

1. WHEN the system needs to interact with Kite API THEN the Kite Ingestion System SHALL use Spring WebClient configured with appropriate timeouts and connection pooling
2. WHEN authentication is required THEN the Kite Ingestion System SHALL include the API key and access token in request headers
3. WHEN API credentials are needed THEN the Kite Ingestion System SHALL read them from application.yml using @ConfigurationProperties
4. WHEN API responses are received THEN the Kite Ingestion System SHALL parse JSON responses using Jackson ObjectMapper
5. WHEN rate limiting occurs THEN the Kite Ingestion System SHALL handle HTTP 429 responses with appropriate backoff using Resilience4j

### Requirement 7

**User Story:** As a system operator, I want REST API endpoints to trigger instrument ingestion and historical data fetching, so that I can initiate data ingestion on demand or via scheduled jobs.

#### Acceptance Criteria

1. WHEN a REST endpoint is created THEN the Kite Ingestion System SHALL provide a POST /api/ingestion/kite/instruments endpoint to trigger instrument master import
2. WHEN the endpoint is invoked THEN the Kite Ingestion System SHALL execute the ingestion asynchronously and return an immediate response with a job ID
3. WHEN a historical data endpoint is created THEN the Kite Ingestion System SHALL provide a POST /api/ingestion/kite/historical endpoint accepting parameters for instrument_token, from_date, to_date, and interval
4. WHEN the historical endpoint is invoked THEN the Kite Ingestion System SHALL validate input parameters and return appropriate error responses for invalid inputs
5. WHEN ingestion completes THEN the Kite Ingestion System SHALL provide a GET /api/ingestion/kite/status/{jobId} endpoint to check job status

### Requirement 8

**User Story:** As a data analyst, I want the system to store all instruments from all exchanges and types, so that the kite_instrument_master table provides comprehensive market coverage.

#### Acceptance Criteria

1. WHEN instruments are fetched from Kite API THEN the Kite Ingestion System SHALL store all instruments regardless of exchange or instrument type
2. WHEN storing instruments THEN the Kite Ingestion System SHALL preserve all metadata including exchange, segment, instrument_type, expiry, strike, and lot_size
3. WHEN the ingestion completes THEN the Kite Ingestion System SHALL log summary statistics broken down by exchange and instrument_type
4. WHEN querying is needed THEN the Kite Ingestion System SHALL provide repository methods with indexes on exchange and instrument_type for efficient filtering
5. WHEN no instruments are found THEN the Kite Ingestion System SHALL log a warning and complete gracefully without errors

### Requirement 9

**User Story:** As a system operator, I want YAML-based configuration using Spring Boot's application.yml, so that I can customize behavior without modifying code.

#### Acceptance Criteria

1. WHEN the system initializes THEN the Kite Ingestion System SHALL load configuration from application.yml for API keys, database settings, and ingestion parameters
2. WHEN profile-specific configuration is needed THEN the Kite Ingestion System SHALL support Spring profiles (dev, test, prod) with application-{profile}.yml files
3. WHEN configuration is read THEN the Kite Ingestion System SHALL use @ConfigurationProperties classes with validation annotations
4. WHEN a configuration parameter is missing THEN the Kite Ingestion System SHALL use sensible default values defined in the configuration class
5. WHEN configuration errors occur THEN the Kite Ingestion System SHALL fail fast at startup with clear error messages using Spring Boot's validation

### Requirement 10

**User Story:** As a data engineer, I want to fetch historical OHLCV data from Kite Connect API for specific instruments and date ranges, so that I can backfill historical market data.

#### Acceptance Criteria

1. WHEN historical data is requested THEN the Kite Ingestion System SHALL accept parameters for instrument_token, from_date, to_date, and interval (minute, day, 5minute, etc.)
2. WHEN the date range is specified THEN the Kite Ingestion System SHALL validate that from_date is before to_date and both are not in the future
3. WHEN fetching historical data THEN the Kite Ingestion System SHALL call the Kite API endpoint "https://api.kite.trade/instruments/historical/{instrument_token}/{interval}"
4. WHEN the API response is received THEN the Kite Ingestion System SHALL parse OHLCV data including timestamp, open, high, low, close, and volume
5. WHEN parsing completes THEN the Kite Ingestion System SHALL store the data in a kite_historical_data table with appropriate indexes

### Requirement 11

**User Story:** As a database administrator, I want the system to use TimescaleDB hypertables for storing OHLCV data, so that historical market data is persisted efficiently with time-series optimizations.

#### Acceptance Criteria

1. WHEN the system initializes THEN the Kite Ingestion System SHALL create a kite_ohlcv_historic table using Flyway migrations if it does not exist
2. WHEN the table is created THEN the Kite Ingestion System SHALL include columns for instrument_token, exchange, date (TIMESTAMPTZ), candle_interval, open, high, low, close, volume, and created_at
3. WHEN defining column types THEN the Kite Ingestion System SHALL use FLOAT8 for price fields and BIGINT for volume fields
4. WHEN the table is created THEN the Kite Ingestion System SHALL set a composite primary key on (instrument_token, exchange, date, candle_interval) for uniqueness
5. WHEN the table is created THEN the Kite Ingestion System SHALL convert it to a TimescaleDB hypertable partitioned by date for time-series query optimization

### Requirement 12

**User Story:** As a data engineer, I want the system to handle Kite API rate limits gracefully, so that ingestion continues without failures when rate limits are encountered.

#### Acceptance Criteria

1. WHEN the Kite API returns HTTP 429 (Too Many Requests) THEN the Kite Ingestion System SHALL pause requests and wait for the time specified in the Retry-After header
2. WHEN no Retry-After header is present THEN the Kite Ingestion System SHALL use exponential backoff starting with 1 second delay
3. WHEN rate limiting occurs repeatedly THEN the Kite Ingestion System SHALL log warnings with details about the rate limit
4. WHEN fetching data for multiple instruments THEN the Kite Ingestion System SHALL implement request throttling to stay within API rate limits
5. WHEN rate limits are exceeded THEN the Kite Ingestion System SHALL continue processing remaining instruments after the backoff period

### Requirement 13

**User Story:** As a system operator, I want the system to support batch processing for historical data ingestion, so that I can efficiently backfill data for multiple instruments.

#### Acceptance Criteria

1. WHEN a batch request is submitted THEN the Kite Ingestion System SHALL accept a list of instrument_tokens with a common date range and interval
2. WHEN processing a batch THEN the Kite Ingestion System SHALL process instruments sequentially to respect API rate limits
3. WHEN a batch is processing THEN the Kite Ingestion System SHALL track progress and provide status updates via the status endpoint
4. WHEN individual instrument fetches fail THEN the Kite Ingestion System SHALL continue processing remaining instruments and report failures in the final summary
5. WHEN a batch completes THEN the Kite Ingestion System SHALL log summary statistics including success count, failure count, and total records ingested

### Requirement 14

**User Story:** As a developer, I want the system to use Spring's async capabilities for long-running ingestion tasks, so that API endpoints remain responsive.

#### Acceptance Criteria

1. WHEN an ingestion task is triggered THEN the Kite Ingestion System SHALL execute it asynchronously using @Async annotation
2. WHEN async execution is configured THEN the Kite Ingestion System SHALL use a custom ThreadPoolTaskExecutor with appropriate pool sizes
3. WHEN an async task starts THEN the Kite Ingestion System SHALL generate a unique job ID and return it immediately to the caller
4. WHEN an async task is running THEN the Kite Ingestion System SHALL store job status in memory or database for status queries
5. WHEN an async task completes THEN the Kite Ingestion System SHALL update the job status with completion time and result summary

### Requirement 15

**User Story:** As a system operator, I want the system to integrate with the existing MoneyPlant platform architecture, so that it follows established patterns and can leverage existing infrastructure.

#### Acceptance Criteria

1. WHEN the system is deployed THEN the Kite Ingestion System SHALL use the existing PostgreSQL database configured in the engines module
2. WHEN configuration is needed THEN the Kite Ingestion System SHALL follow the existing pattern of using application.yml with environment-specific profiles
3. WHEN logging is implemented THEN the Kite Ingestion System SHALL use the existing Logback configuration in the engines module
4. WHEN REST endpoints are created THEN the Kite Ingestion System SHALL follow the existing API versioning and error response patterns
5. WHEN the system starts THEN the Kite Ingestion System SHALL integrate with Spring Boot's health check endpoints for monitoring

### Requirement 16

**User Story:** As a developer, I want the system to use the official KiteConnect Java library, so that API integration is reliable and follows Zerodha's recommended practices.

#### Acceptance Criteria

1. WHEN the system needs to communicate with Kite API THEN the Kite Ingestion System SHALL use the official com.zerodhatech.kiteconnect Java library
2. WHEN initializing the Kite client THEN the Kite Ingestion System SHALL configure it with API key and access token from application configuration
3. WHEN fetching instruments THEN the Kite Ingestion System SHALL use the KiteConnect.getInstruments() method
4. WHEN fetching historical data THEN the Kite Ingestion System SHALL use the KiteConnect.getHistoricalData() method with appropriate parameters
5. WHEN the library is insufficient THEN the Kite Ingestion System SHALL extend it with custom wrapper classes following Spring patterns

### Requirement 17

**User Story:** As a performance engineer, I want the system to use high-performance libraries and patterns, so that data ingestion is fast and efficient.

#### Acceptance Criteria

1. WHEN processing large datasets THEN the Kite Ingestion System SHALL use Spring Data JPA batch insert capabilities with appropriate batch sizes (e.g., 1000 records)
2. WHEN making multiple API calls THEN the Kite Ingestion System SHALL use parallel processing with CompletableFuture or Project Reactor for concurrent requests
3. WHEN parsing JSON responses THEN the Kite Ingestion System SHALL use Jackson with optimized settings for performance
4. WHEN writing to database THEN the Kite Ingestion System SHALL use JDBC batch operations through Spring's JdbcTemplate for bulk inserts
5. WHEN handling large result sets THEN the Kite Ingestion System SHALL use streaming and pagination to avoid memory issues

### Requirement 18

**User Story:** As a database administrator, I want the system to leverage TimescaleDB-specific optimizations, so that time-series queries are performant.

#### Acceptance Criteria

1. WHEN creating indexes THEN the Kite Ingestion System SHALL create composite indexes optimized for common query patterns (instrument_token, exchange, candle_interval, date DESC)
2. WHEN the hypertable is created THEN the Kite Ingestion System SHALL configure appropriate chunk time intervals (e.g., 7 days) for optimal query performance
3. WHEN querying historical data THEN the Kite Ingestion System SHALL use TimescaleDB-specific functions like time_bucket for aggregations
4. WHEN data retention is needed THEN the Kite Ingestion System SHALL support TimescaleDB retention policies for automatic data cleanup
5. WHEN compression is beneficial THEN the Kite Ingestion System SHALL enable TimescaleDB compression for older data chunks
