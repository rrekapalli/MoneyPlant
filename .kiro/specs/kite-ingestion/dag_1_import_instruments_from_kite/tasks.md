# Implementation Plan

- [x] 1. Set up project structure and shared components
  - Create directory structure for stock_ingestion module
  - Set up shared/config and shared/utils folders
  - Create __init__.py files for proper Python package structure
  - _Requirements: 4.1, 4.3_

- [x] 1.1 Create root-level configuration system
  - Implement config/config.json with schema for API keys and database settings
  - Support environment variable substitution (${VAR_NAME} syntax) from root-level .env file
  - Use python-dotenv to load environment variables from .env file
  - Add validation for required configuration fields
  - _Requirements: 9.1_

- [x] 1.2 Implement configuration loader module
  - Create shared/config/config_loader.py with ConfigLoader class
  - Implement load_root_config() method to load root configuration
  - Implement load_dag_config() method to load DAG-specific configuration
  - Implement get_with_default() method for fallback values
  - Handle missing configuration files with clear error messages
  - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [x] 1.3 Write property test for configuration loading
  - **Property 21: Default value fallback**
  - **Validates: Requirements 9.4**

- [x] 1.4 Implement logging configuration module
  - Create shared/config/logging_config.py following nse_airflow pattern
  - Set up structured logging with timestamps and log levels
  - Configure log output to both console and file
  - _Requirements: 4.5, 5.1_

- [x] 1.5 Create database manager module
  - Implement shared/utils/db_manager.py with DatabaseManager class
  - Implement get_connection() method with connection pooling
  - Implement execute_query() method for non-returning queries
  - Implement execute_many() method for batch operations
  - Implement transaction management with automatic rollback on errors
  - _Requirements: 3.5, 4.4_

- [x] 1.6 Write property test for transaction rollback
  - **Property 10: Transaction rollback on error**
  - **Validates: Requirements 3.5**

- [x] 1.7 Create Kite API client wrapper
  - Implement shared/utils/kite_client_wrapper.py with KiteClientWrapper class
  - Import and wrap KiteAPIClient from kite_trader.core.kite_api_client
  - Implement authenticate() method using existing KiteAPIClient
  - Implement fetch_instruments() method to call Kite API instruments endpoint
  - Implement filter_instruments() method for exchange-based filtering
  - Add retry logic with exponential backoff for API calls
  - _Requirements: 6.1, 6.2, 6.3, 6.5, 5.2_

- [x] 1.8 Write property test for retry with exponential backoff
  - **Property 12: Retry with exponential backoff**
  - **Validates: Requirements 5.2**

- [x] 2. Implement DAG 1: Import Instruments from Kite
  - Create dag_1_import_instruments_from_kite folder structure
  - Set up DAG-specific configuration file
  - _Requirements: 4.1, 4.2_

- [x] 2.1 Create DAG 1 configuration file
  - Create dag_1_import_instruments_from_kite/config.json
  - Define parameters: exchanges, batch_size, retry_attempts, retry_delay_seconds
  - Set enabled flag and schedule information
  - _Requirements: 9.2, 9.3_

- [x] 2.2 Create kite_instrument_master table schema
  - Create dag_1_import_instruments_from_kite/schema.sql
  - Define kite_instrument_master table with all required columns matching Kite API response
  - Set composite primary key on (instrument_token, exchange)
  - Create indexes on tradingsymbol, exchange, instrument_type, segment
  - Add unique constraint on (tradingsymbol, exchange)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.3 Implement table creation function
  - Create create_kite_instrument_master_table() function in import_instruments.py
  - Read and execute schema.sql using DatabaseManager
  - Implement idempotent table creation (IF NOT EXISTS)
  - Log table creation status
  - _Requirements: 2.1_

- [x] 2.4 Write property test for idempotent table creation
  - **Property 5: Idempotent table creation**
  - **Validates: Requirements 2.1**

- [x] 2.5 Implement instrument data model
  - Create Instrument dataclass in import_instruments.py
  - Implement to_dict() method for database insertion
  - Implement from_kite_response() class method for parsing API response
  - Implement validate() method for data validation
  - _Requirements: 1.3, 1.4_

- [x] 2.6 Write property test for field parsing
  - **Property 2: All required fields are parsed**
  - **Validates: Requirements 1.3**

- [x] 2.7 Write property test for required field validation
  - **Property 3: Required field validation**
  - **Validates: Requirements 1.4**

- [x] 2.8 Implement data transformation logic
  - Create transform_instruments() function
  - Map Kite API fields to database columns
  - Handle null values and data type conversions
  - Preserve all metadata fields
  - _Requirements: 1.5, 3.1, 8.2_

- [x] 2.9 Write property test for transformation correctness
  - **Property 4: Schema transformation correctness**
  - **Validates: Requirements 1.5**

- [x] 2.10 Write property test for metadata preservation
  - **Property 17: Metadata preservation**
  - **Validates: Requirements 8.2**

- [x] 2.11 Implement upsert logic in DatabaseManager
  - Add upsert_instruments() method to DatabaseManager class
  - Use INSERT ... ON CONFLICT ... DO UPDATE for upsert
  - Use composite key (instrument_token, exchange) for conflict detection
  - Return counts of inserted and updated records
  - Implement batch processing for large datasets
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 2.12 Write property test for upsert idempotence
  - **Property 7: Upsert idempotence**
  - **Validates: Requirements 3.2**

- [x] 2.13 Write property test for composite key uniqueness
  - **Property 8: Composite key uniqueness**
  - **Validates: Requirements 3.3**

- [x] 2.14 Write property test for upsert count logging
  - **Property 9: Upsert count logging**
  - **Validates: Requirements 3.4**

- [x] 2.15 Implement main DAG execution function
  - Create import_instruments_from_kite() function as main entry point
  - Load DAG configuration using ConfigLoader
  - Initialize KiteClientWrapper and authenticate
  - Fetch instruments from Kite API
  - Validate and transform instrument data
  - Create/verify kite_instrument_master table exists
  - Upsert instruments to database in batches
  - Log summary statistics by exchange and instrument_type
  - Handle errors gracefully with detailed logging
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.2, 5.1, 5.3, 5.5, 8.1, 8.3_

- [x] 2.16 Write property test for authentication precedes fetching
  - **Property 1: Authentication precedes data fetching**
  - **Validates: Requirements 1.1**

- [x] 2.17 Write property test for complete instrument storage
  - **Property 16: Complete instrument storage**
  - **Validates: Requirements 8.1**

- [x] 2.18 Write property test for summary statistics
  - **Property 18: Summary statistics by category**
  - **Validates: Requirements 8.3**

- [x] 3. Implement execute_dags.py script
  - Create stock_ingestion/execute_dags.py as main execution script
  - _Requirements: 7.1_

- [x] 3.1 Implement command-line argument parsing
  - Add argparse configuration for --dag, --list, --help options
  - Support comma-separated DAG IDs (e.g., --dag 1,2,3)
  - Support "all" keyword to execute all DAGs
  - Validate DAG IDs and provide clear error messages
  - _Requirements: 7.3, 7.4_

- [x] 3.2 Implement DAG registry and execution logic
  - Create DAG registry mapping DAG IDs to execution functions
  - Implement execute_dag_wrapper() for consistent DAG execution
  - Add timing and progress display for each DAG
  - Implement sequential execution of selected DAGs
  - Handle DAG failures gracefully and continue with remaining DAGs
  - _Requirements: 7.2, 7.5_

- [x] 3.3 Write property test for operation logging
  - **Property 11: Operation logging completeness**
  - **Validates: Requirements 5.1**

- [x] 3.4 Write property test for progress display
  - **Property 15: Progress display during execution**
  - **Validates: Requirements 7.5**

- [x] 3.3 Implement list_available_dags() function
  - Display all available DAGs with descriptions and schedules
  - Format output in a readable table format
  - Include usage examples
  - _Requirements: 7.4_

- [x] 3.4 Implement main() function
  - Parse command-line arguments
  - Handle --list option to display DAGs
  - Load root configuration
  - Execute selected DAGs with error handling
  - Display overall execution summary
  - Return appropriate exit code
  - _Requirements: 7.2, 7.3, 7.5_

- [x] 3.5 Write property test for DAG completion summary
  - **Property 14: DAG completion summary**
  - **Validates: Requirements 5.5**

- [x] 4. Create documentation and configuration files
  - Create comprehensive documentation for the module
  - Set up example configuration files
  - _Requirements: 4.1_

- [x] 4.1 Create README.md
  - Document module purpose and architecture
  - Provide installation instructions
  - Include usage examples for execute_dags.py
  - Document configuration file structure
  - Add troubleshooting section
  - _Requirements: 4.1_

- [x] 4.2 Create requirements.txt
  - List all Python dependencies
  - Include kiteconnect, psycopg2, hypothesis for testing
  - Pin versions for reproducibility
  - _Requirements: 4.1_

- [x] 4.3 Create example configuration files
  - Create .env.example at root level with Kite API credentials placeholders
  - Create config/config.json.example with placeholder values
  - Create dag_1_import_instruments_from_kite/config.json with sensible defaults
  - Document all configuration parameters
  - _Requirements: 9.1, 9.2_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Integration testing and validation
  - Test complete end-to-end workflow
  - Validate against real Kite API (in test environment)
  - _Requirements: All_

- [x] 6.1 Write integration test for complete DAG execution
  - Test full DAG 1 execution with mocked Kite API
  - Verify database state after execution
  - Verify all instruments are stored correctly
  - Verify logging output contains expected information

- [x] 6.2 Write integration test for error handling
  - Test authentication failure handling
  - Test API error handling with retries
  - Test database error handling with rollback
  - Test configuration error handling

- [x] 6.3 Write integration test for configuration system
  - Test loading root and DAG configurations
  - Test environment variable substitution
  - Test default value fallback
  - Test configuration validation

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
