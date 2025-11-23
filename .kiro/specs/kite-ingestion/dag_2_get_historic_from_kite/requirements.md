# Requirements Document

## Introduction

This document specifies the requirements for DAG 2: Historic Data Ingestion from Kite Connect API. The system shall fetch historical OHLCV (Open, High, Low, Close, Volume) data for instruments from the Kite Connect API and store it in a PostgreSQL database. The system shall intelligently determine date ranges to fetch based on existing data, support configurable parameters for candle intervals and instrument filtering, and handle the initial bootstrap scenario where no historical data exists.

## Glossary

- **System**: The DAG 2 Historic Data Ingestion module
- **Kite Connect API**: The Zerodha Kite Connect REST API for fetching market data
- **OHLCV Data**: Open, High, Low, Close, Volume candlestick data for a given time period
- **Instrument**: A tradable security identified by instrument_token and exchange
- **Candle Interval**: The time period for each OHLCV data point (e.g., day, 60minute, 30minute)
- **kite_instrument_master**: Database table containing the master list of all instruments
- **kite_ohlcv_historic**: Database table storing historical OHLCV data as a TimescaleDB hypertable
- **TimescaleDB**: PostgreSQL extension for time-series data optimization
- **Hypertable**: A TimescaleDB abstraction that partitions data by time for efficient querying and storage
- **Bootstrap Date**: The default starting date (1995-01-01) used when no historical data exists for an instrument
- **Date Gap**: The period between the maximum existing date and the current date for which data needs to be fetched
- **Rate Limit**: The maximum number of API requests allowed per unit of time by Kite Connect API (3 requests per second)
- **Batch Processing**: Processing multiple instruments in a single operation to minimize API calls

## Requirements

### Requirement 1

**User Story:** As a data engineer, I want to fetch historical OHLCV data from Kite Connect API for all instruments, so that I can build a comprehensive historical database for backtesting and analysis.

#### Acceptance Criteria

1. WHEN the System executes, THE System SHALL fetch the complete list of instruments from kite_instrument_master table
2. WHEN filtering instruments, THE System SHALL include only instruments matching the configured instrument_type values
3. WHEN filtering instruments, THE System SHALL include only instruments matching the configured exchange values
4. WHEN the System processes an instrument list, THE System SHALL fetch historical data for instruments in parallel using configurable worker threads
5. WHEN the System fetches historical data for an instrument, THE System SHALL use the configured candle_interval parameter

### Requirement 2

**User Story:** As a data engineer, I want the system to intelligently determine which date ranges to fetch, so that I avoid redundant API calls and minimize data transfer.

#### Acceptance Criteria

1. WHEN the System determines the date range for an instrument, THE System SHALL query kite_ohlcv_historic table for the maximum existing date for that instrument
2. IF no historical data exists for an instrument, THEN THE System SHALL use 1995-01-01 as the from_date
3. IF historical data exists for an instrument, THEN THE System SHALL use the day after the maximum existing date as the from_date
4. WHEN the System determines the to_date, THE System SHALL use the current date
5. IF the from_date equals or exceeds the to_date, THEN THE System SHALL skip fetching data for that instrument

### Requirement 3

**User Story:** As a data engineer, I want historical data stored in a structured database table optimized for time-series queries, so that I can efficiently query and analyze the data.

#### Acceptance Criteria

1. WHEN the System initializes, THE System SHALL create the kite_ohlcv_historic table if it does not exist
2. WHEN creating the table, THE System SHALL convert it to a TimescaleDB hypertable partitioned by the date column
3. WHEN storing OHLCV data, THE System SHALL include instrument_token, exchange, date, open, high, low, close, volume, and candle_interval fields
4. WHEN inserting OHLCV data, THE System SHALL use an upsert operation to handle duplicate records
5. WHEN a duplicate record is detected, THE System SHALL update the existing record with new values
6. WHEN storing data, THE System SHALL maintain a composite primary key of instrument_token, exchange, date, and candle_interval

### Requirement 4

**User Story:** As a system administrator, I want the DAG to support configurable parameters, so that I can control which data is fetched without modifying code.

#### Acceptance Criteria

1. WHEN the System loads configuration, THE System SHALL read a candle_interval parameter with a default value of "day"
2. WHEN the System loads configuration, THE System SHALL read an instrument_types parameter with a default value of ["EQ"]
3. WHEN the System loads configuration, THE System SHALL read an exchanges parameter with a default value of ["NSE", "BSE"]
4. WHEN the System loads configuration, THE System SHALL read an enabled parameter to control DAG execution
5. WHEN the enabled parameter is false, THEN THE System SHALL skip execution and log a warning message

### Requirement 5

**User Story:** As a data engineer, I want the system to handle API errors gracefully, so that temporary failures do not cause the entire DAG to fail.

#### Acceptance Criteria

1. WHEN the Kite Connect API returns an error for an instrument, THE System SHALL log the error with instrument details
2. WHEN an API error occurs for an instrument, THE System SHALL continue processing remaining instruments
3. WHEN the System encounters rate limiting, THE System SHALL implement exponential backoff retry logic
4. WHEN the System completes execution, THE System SHALL log summary statistics including success count and failure count
5. IF all instruments fail to fetch, THEN THE System SHALL raise an exception to indicate DAG failure

### Requirement 6

**User Story:** As a data engineer, I want comprehensive logging throughout the data ingestion process, so that I can monitor progress and troubleshoot issues.

#### Acceptance Criteria

1. WHEN the System starts execution, THE System SHALL log the total number of instruments to process
2. WHEN the System processes each instrument, THE System SHALL log the instrument_token, exchange, and date range being fetched
3. WHEN the System successfully stores data, THE System SHALL log the number of records inserted and updated
4. WHEN the System completes execution, THE System SHALL log total execution time and summary statistics
5. WHEN the System encounters errors, THE System SHALL log error details with sufficient context for debugging

### Requirement 7

**User Story:** As a data engineer, I want the system to validate data received from the API, so that only valid records are stored in the database.

#### Acceptance Criteria

1. WHEN the System receives OHLCV data from the API, THE System SHALL validate that required fields are present
2. WHEN the System validates OHLCV data, THE System SHALL verify that numeric fields contain valid numbers
3. WHEN the System validates OHLCV data, THE System SHALL verify that the date field is a valid date
4. IF validation fails for a record, THEN THE System SHALL log the validation error and skip that record
5. WHEN the System completes validation, THE System SHALL log the count of valid and invalid records

### Requirement 8

**User Story:** As a system administrator, I want the DAG to respect Kite API rate limits and handle API constraints, so that the system does not get blocked or throttled.

#### Acceptance Criteria

1. WHEN the System makes consecutive API requests, THE System SHALL enforce a minimum delay of 334 milliseconds between requests to respect the 3 requests per second limit using thread-safe rate limiting
2. WHEN the System receives a rate limit error response, THE System SHALL wait for the specified retry-after duration before retrying the request
3. WHEN the System implements retry logic for rate limit errors, THE System SHALL use exponential backoff with a maximum of 3 retry attempts
4. WHEN the maximum retry count is reached for an instrument, THE System SHALL log the failure and continue with the next instrument
5. WHEN the System encounters date ranges exceeding 2000 days, THE System SHALL automatically chunk the range into smaller periods
6. WHEN the System completes execution, THE System SHALL log the total number of API requests made and the average request rate

### Requirement 9

**User Story:** As a data engineer, I want the system to process instruments efficiently with parallel processing, so that I minimize execution time while maintaining data integrity.

#### Acceptance Criteria

1. WHEN the System processes instruments, THE System SHALL use configurable parallel workers to process multiple instruments simultaneously
2. WHEN the System processes instruments in parallel, THE System SHALL maintain thread-safe rate limiting across all workers
3. WHEN the System completes processing an instrument, THE System SHALL immediately persist the data to the database per instrument
4. WHEN an instrument processing fails, THE System SHALL log the error and continue with remaining instruments
5. WHEN the System completes execution, THE System SHALL log the total number of instruments processed in parallel

### Requirement 10

**User Story:** As a data engineer, I want the system to handle multiple data formats from the Kite API, so that the system is robust against API changes.

#### Acceptance Criteria

1. WHEN the System receives OHLCV data in array format, THE System SHALL parse [date, open, high, low, close, volume] correctly
2. WHEN the System receives OHLCV data in dictionary format, THE System SHALL parse {date, open, high, low, close, volume} correctly
3. WHEN the System encounters unknown data formats, THE System SHALL log the error and skip the invalid record
4. WHEN the System processes mixed data formats within the same response, THE System SHALL handle each record according to its format
5. WHEN the System validates parsed data, THE System SHALL ensure all required fields are present regardless of input format

### Requirement 11

**User Story:** As a system administrator, I want the system to automatically handle API limitations, so that large historical data requests succeed without manual intervention.

#### Acceptance Criteria

1. WHEN the System calculates a date range exceeding 2000 days, THE System SHALL automatically split it into chunks of 1999 days or less
2. WHEN the System processes date chunks, THE System SHALL fetch each chunk sequentially with proper rate limiting
3. WHEN a date chunk fails to fetch, THE System SHALL log the error and continue with remaining chunks for that instrument
4. WHEN the System completes all chunks for an instrument, THE System SHALL combine and persist all data together
5. WHEN the System logs chunk processing, THE System SHALL indicate the chunk number and total chunks for transparency

### Requirement 12

**User Story:** As a developer, I want the DAG to leverage existing shared infrastructure components, so that the system maintains consistency and reduces code duplication.

#### Acceptance Criteria

1. WHEN the System loads configuration, THE System SHALL use the ConfigLoader class from stock_ingestion.shared.config.config_loader
2. WHEN the System connects to the database, THE System SHALL use the DatabaseManager class from stock_ingestion.shared.utils.db_manager
3. WHEN the System authenticates with Kite API, THE System SHALL use the KiteClientWrapper class from stock_ingestion.shared.utils.kite_client_wrapper
4. WHEN the System logs operations, THE System SHALL use the OperationTimer utility from stock_ingestion.shared.config.logging_config
5. WHEN the System reads API credentials, THE System SHALL use the root configuration loaded from the .env file at the root folder
