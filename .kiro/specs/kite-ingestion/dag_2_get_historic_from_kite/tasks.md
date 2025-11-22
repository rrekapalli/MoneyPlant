# Implementation Plan

- [x] 1. Create database schema and table structure
  - Create schema.sql file in stock_ingestion/dag_2_get_historic_from_kite/ folder
  - Define kite_ohlcv_historic table with all required columns
  - Include TimescaleDB hypertable conversion
  - Add indexes for query performance
  - _Requirements: 3.1, 3.2, 3.5, 3.6_

- [x] 2. Implement OHLCVCandle data model
  - Create OHLCVCandle dataclass with all required fields
  - Implement from_kite_response() class method to parse API response
  - Implement to_dict() method for database insertion
  - Implement validate() method for data validation
  - _Requirements: 3.3, 7.1, 7.2, 7.3_

- [x] 2.1 Write property test for OHLCV data validation
  - **Property 9: Required fields validation**
  - **Property 10: Numeric fields contain valid numbers**
  - **Property 11: Date field is valid**
  - **Validates: Requirements 7.1, 7.2, 7.3**

- [x] 3. Extend KiteClientWrapper with historical data fetching
  - Add fetch_historical_data() method to KiteClientWrapper
  - Implement API call to Kite historical endpoint
  - Parse API response into list of OHLCV dictionaries
  - Handle API errors and return appropriate error information
  - _Requirements: 1.5, 5.1_

- [x] 3.1 Write property test for API error resilience
  - **Property 7: API errors don't stop processing**
  - **Validates: Requirements 5.2**

- [x] 4. Implement RateLimiter utility class
  - Create RateLimiter class with configurable requests per second
  - Implement wait_if_needed() method to enforce delays
  - Track last request timestamp
  - Calculate and enforce minimum delay between requests
  - _Requirements: 8.1_

- [x] 4.1 Write property test for rate limiting
  - **Property 12: Rate limiting enforces minimum delay**
  - **Validates: Requirements 8.1**

- [x] 5. Implement retry logic with exponential backoff
  - Create retry decorator or utility function
  - Implement exponential backoff calculation
  - Add configurable max retry attempts
  - Handle rate limit errors specifically
  - _Requirements: 5.3, 8.2, 8.3_

- [x] 5.1 Write property test for exponential backoff
  - **Property 8: Exponential backoff increases retry delays**
  - **Validates: Requirements 5.3, 8.3**

- [x] 6. Extend DatabaseManager with OHLCV-specific methods
  - Add get_instruments_by_filter() method to fetch filtered instruments
  - Add get_max_date_for_instrument() method to query existing data
  - Add upsert_ohlcv_data() method for batch upsert operations
  - Implement transaction handling for batch operations
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.4, 3.5, 9.3_

- [x] 6.1 Write property test for instrument filtering
  - **Property 1: Instrument filtering by type is correct**
  - **Property 2: Instrument filtering by exchange is correct**
  - **Validates: Requirements 1.2, 1.3**

- [x] 6.2 Write property test for upsert behavior
  - **Property 6: Upsert updates existing records**
  - **Validates: Requirements 3.4, 3.5**

- [x] 7. Implement date range calculation logic
  - Create function to determine from_date based on existing data
  - Use bootstrap date (1995-01-01) when no data exists
  - Use max_date + 1 day when data exists
  - Always use current date as to_date
  - Skip instruments where from_date >= to_date
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7.1 Write property test for date range calculation
  - **Property 3: Date range calculation uses max date plus one**
  - **Property 4: To-date is always current date**
  - **Validates: Requirements 2.3, 2.4**

- [x] 8. Implement batch processing logic
  - Create function to group instruments into batches
  - Implement batch processing loop with rate limiting
  - Handle batch transaction commits
  - Continue processing on batch failures
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 8.1 Write property test for batch processing
  - **Property 13: Instruments are grouped into correct batch sizes**
  - **Property 14: Batch processing is sequential with rate limiting**
  - **Property 15: Batch commits are transactional**
  - **Property 16: Batch failures don't stop processing**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [x] 9. Create DAG configuration file
  - Create config.json in stock_ingestion/dag_2_get_historic_from_kite/ folder
  - Define all configuration parameters with defaults
  - Include candle_interval, instrument_types, exchanges
  - Include batch_size, rate_limit, retry settings
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10. Implement main DAG execution function
  - Create import_historic_data_from_kite() function
  - Load configuration using ConfigLoader
  - Initialize DatabaseManager and create table
  - Authenticate with Kite API using KiteClientWrapper
  - Fetch and filter instruments from database
  - Process instruments in batches with rate limiting
  - Log progress and summary statistics
  - Handle errors gracefully and continue processing
  - _Requirements: 1.1, 1.4, 4.5, 5.4, 6.1, 6.2, 6.3, 6.4, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10.1 Write property test for all required fields storage
  - **Property 5: All required OHLCV fields are stored**
  - **Validates: Requirements 3.3**

- [x] 11. Add comprehensive logging throughout the DAG
  - Log DAG start with instrument count
  - Log each instrument being processed with details
  - Log API request counts and rates
  - Log database operation results (inserted/updated counts)
  - Log errors with sufficient context
  - Log execution summary with statistics
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.5_

- [x] 12. Implement error handling for all failure scenarios
  - Handle API authentication errors (fail DAG)
  - Handle API rate limit errors (retry with backoff)
  - Handle API network errors (retry and continue)
  - Handle invalid instrument errors (skip and continue)
  - Handle database connection errors (retry)
  - Handle database transaction errors (rollback and continue)
  - Handle validation errors (skip record and continue)
  - Raise exception if all instruments fail
  - _Requirements: 5.1, 5.2, 5.5, 7.4_

- [x] 13. Create main module file
  - Create import_historic_data.py in stock_ingestion/dag_2_get_historic_from_kite/ folder
  - Import all necessary components
  - Wire together all functions and classes
  - Add module-level documentation
  - _Requirements: All_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Write integration tests for end-to-end DAG execution
  - Test full DAG execution with small dataset
  - Test incremental updates (run twice, verify only new data fetched)
  - Test with disabled DAG configuration
  - Test database table creation and hypertable conversion
  - Test with various filter configurations

- [x] 16. Write unit tests for edge cases
  - Test configuration loading with missing values
  - Test with empty instrument list
  - Test with all instruments up-to-date (no data to fetch)
  - Test with invalid date ranges
  - Test with all API calls failing
  - Test validation with various invalid data formats

- [x] 17. Implement parallel processing with ThreadPoolExecutor
  - Create process_instrument() function for parallel execution
  - Implement ThreadPoolExecutor with configurable worker count
  - Add thread-safe rate limiting with threading.Lock
  - Update main function to use parallel processing
  - _Requirements: 1.4, 9.1, 9.2_

- [x] 17.1 Write property test for thread-safe rate limiting
  - **Property 20: Thread-safe rate limiting works across workers**
  - **Validates: Requirements 8.1, 9.2**

- [x] 18. Implement date range chunking for API limits
  - Create chunk_date_range() function
  - Split date ranges exceeding 2000 days into chunks
  - Update fetch logic to process chunks sequentially
  - Log chunk progress for transparency
  - _Requirements: 8.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 18.1 Write property test for date range chunking
  - **Property 19: Date range chunking respects API limits**
  - **Validates: Requirements 11.1**

- [x] 19. Implement flexible data format support
  - Update OHLCVCandle.from_kite_response() to handle arrays
  - Update OHLCVCandle.from_kite_response() to handle dictionaries
  - Add error handling for unknown formats
  - Test with mixed format responses
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 19.1 Write property test for array format parsing
  - **Property 17: Array format parsing is correct**
  - **Validates: Requirements 10.1**

- [x] 19.2 Write property test for dictionary format parsing
  - **Property 18: Dictionary format parsing is correct**
  - **Validates: Requirements 10.2**

- [x] 20. Implement per-instrument persistence
  - Update process_instrument() to persist data immediately
  - Remove batch-level transaction logic
  - Update error handling for per-instrument failures
  - Update logging for per-instrument progress
  - _Requirements: 9.3, 9.4_

- [x] 21. Update configuration and documentation
  - Add parallel_workers parameter to config.json
  - Update README with performance improvements
  - Document parallel processing architecture
  - Document date chunking behavior
  - Document flexible format support
  - _Requirements: All_

- [x] 22. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
