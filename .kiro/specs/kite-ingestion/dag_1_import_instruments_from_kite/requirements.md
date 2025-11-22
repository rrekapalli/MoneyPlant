# Requirements Document

## Introduction

The Stock Ingestion module is a data pipeline system that fetches market data from various sources (initially Zerodha's Kite Connect API) and stores it in a PostgreSQL database. This module mirrors the architecture of the existing `nse_airflow` system but provides flexibility to use the best available data source. The initial implementation focuses on DAG 1: Import Instruments, which fetches the complete instrument list from Kite Connect and stores it in a new `kite_instrument_master` table with a minimal schema matching the Kite API response structure.

## Glossary

- **Stock Ingestion System**: The complete data pipeline system for fetching market data from various sources
- **Kite Connect API**: Zerodha's REST API for accessing market data and trading functionality (initial data source)
- **Instrument**: A tradable security (equity, derivative, commodity, etc.) with metadata like symbol, exchange, token, etc.
- **DAG (Directed Acyclic Graph)**: A modular data pipeline component that performs a specific data ingestion task
- **kite_instrument_master**: PostgreSQL table storing master data for all instruments from Kite Connect API across all exchanges and instrument types
- **Trading Symbol**: The unique identifier for an instrument on an exchange (e.g., 'RELIANCE', 'TCS')
- **Instrument Token**: Zerodha's unique numeric identifier for each instrument
- **Exchange Token**: Exchange-specific identifier for an instrument
- **Segment**: The market segment where an instrument trades (e.g., 'NSE', 'BSE', 'NFO-FUT', 'NFO-OPT')

## Requirements

### Requirement 1

**User Story:** As a data engineer, I want to fetch the complete instrument list from Kite Connect API, so that I have up-to-date master data for all tradable instruments.

#### Acceptance Criteria

1. WHEN the system initiates an instrument fetch THEN the Stock Ingestion System SHALL authenticate with Kite Connect API using valid credentials
2. WHEN authentication succeeds THEN the Stock Ingestion System SHALL retrieve the complete instrument list from the endpoint "https://api.kite.trade/instruments"
3. WHEN the instrument list is retrieved THEN the Stock Ingestion System SHALL parse all instrument fields including tradingsymbol, exchange, instrument_token, exchange_token, instrument_type, name, segment, expiry, strike, tick_size, and lot_size
4. WHEN parsing completes THEN the Stock Ingestion System SHALL validate that all required fields are present for each instrument
5. WHEN validation succeeds THEN the Stock Ingestion System SHALL transform the data to match the target database schema

### Requirement 2

**User Story:** As a database administrator, I want the system to create a new kite_instrument_master table with a minimal schema matching the Kite API response, so that all instrument data can be stored efficiently without unnecessary columns.

#### Acceptance Criteria

1. WHEN the system initializes THEN the Stock Ingestion System SHALL create a kite_instrument_master table if it does not exist
2. WHEN the table is created THEN the Stock Ingestion System SHALL include columns for tradingsymbol, exchange, instrument_token, exchange_token, instrument_type, name, segment, expiry, strike, tick_size, and lot_size
3. WHEN defining column types THEN the Stock Ingestion System SHALL use appropriate PostgreSQL data types matching the Kite API response format
4. WHEN the table is created THEN the Stock Ingestion System SHALL set a composite primary key on (instrument_token, exchange) for uniqueness
5. WHEN the table is created THEN the Stock Ingestion System SHALL create indexes on tradingsymbol, exchange, and instrument_type for query performance

### Requirement 3

**User Story:** As a data engineer, I want the system to store fetched instruments in the kite_instrument_master table, so that the data is persisted and available for downstream applications.

#### Acceptance Criteria

1. WHEN instrument data is ready for storage THEN the Stock Ingestion System SHALL map Kite API fields directly to kite_instrument_master columns
2. WHEN field mapping is complete THEN the Stock Ingestion System SHALL use upsert operations to insert or update instrument records
3. WHEN performing upserts THEN the Stock Ingestion System SHALL use the composite key (instrument_token, exchange) for conflict resolution
4. WHEN upsert operations complete THEN the Stock Ingestion System SHALL log the count of inserted and updated records
5. WHEN database errors occur THEN the Stock Ingestion System SHALL rollback the transaction and preserve data integrity

### Requirement 4

**User Story:** As a system operator, I want the ingestion process to follow the same modular DAG architecture as nse_airflow, so that the codebase is consistent and maintainable.

#### Acceptance Criteria

1. WHEN the module is structured THEN the Stock Ingestion System SHALL organize code into a dag_1_import_instruments_from_kite folder
2. WHEN the DAG is implemented THEN the Stock Ingestion System SHALL provide a main execution function that can be called independently
3. WHEN shared functionality is needed THEN the Stock Ingestion System SHALL place reusable code in a shared folder with config and utils subfolders
4. WHEN configuration is required THEN the Stock Ingestion System SHALL use a centralized config module for database and API settings
5. WHEN the DAG executes THEN the Stock Ingestion System SHALL use the same logging configuration pattern as nse_airflow

### Requirement 5

**User Story:** As a system operator, I want comprehensive error handling and logging, so that I can monitor the ingestion process and troubleshoot issues effectively.

#### Acceptance Criteria

1. WHEN any operation executes THEN the Stock Ingestion System SHALL log the operation start time and completion status
2. WHEN API calls are made THEN the Stock Ingestion System SHALL implement retry logic with exponential backoff for transient failures
3. WHEN errors occur THEN the Stock Ingestion System SHALL log detailed error messages including context and stack traces
4. WHEN authentication fails THEN the Stock Ingestion System SHALL provide clear error messages indicating credential issues
5. WHEN the DAG completes THEN the Stock Ingestion System SHALL log summary statistics including record counts and execution duration

### Requirement 6

**User Story:** As a developer, I want the system to reuse existing Kite API client code from kite_trader, so that authentication and API interaction logic is not duplicated.

#### Acceptance Criteria

1. WHEN the system needs to interact with Kite API THEN the Stock Ingestion System SHALL import and use the KiteAPIClient from kite_trader.core.kite_api_client
2. WHEN authentication is required THEN the Stock Ingestion System SHALL use the existing authenticate method from KiteAPIClient
3. WHEN API credentials are needed THEN the Stock Ingestion System SHALL read them from environment variables or configuration files
4. WHEN the KiteAPIClient is insufficient THEN the Stock Ingestion System SHALL extend it with new methods rather than creating duplicate code
5. WHEN new API methods are added THEN the Stock Ingestion System SHALL follow the same error handling and retry patterns as existing methods

### Requirement 7

**User Story:** As a system operator, I want an execution script similar to nse_airflow/execute_dags.py, so that I can run individual DAGs or all DAGs with a single command.

#### Acceptance Criteria

1. WHEN the execution script is created THEN the Stock Ingestion System SHALL provide a stock_ingestion/execute_dags.py file
2. WHEN the script is invoked without arguments THEN the Stock Ingestion System SHALL execute all available DAGs in sequence
3. WHEN the script is invoked with --dag 1 THEN the Stock Ingestion System SHALL execute only DAG 1
4. WHEN the script is invoked with --list THEN the Stock Ingestion System SHALL display all available DAGs with descriptions
5. WHEN DAGs execute THEN the Stock Ingestion System SHALL display progress information and execution timing for each DAG

### Requirement 8

**User Story:** As a data analyst, I want the system to store all instruments from all exchanges and types, so that the kite_instrument_master table provides comprehensive market coverage for various analysis needs.

#### Acceptance Criteria

1. WHEN instruments are fetched from Kite API THEN the Stock Ingestion System SHALL store all instruments regardless of exchange or instrument type
2. WHEN storing instruments THEN the Stock Ingestion System SHALL preserve all metadata including exchange, segment, instrument_type, expiry, strike, and lot_size
3. WHEN the ingestion completes THEN the Stock Ingestion System SHALL log summary statistics broken down by exchange and instrument_type
4. WHEN querying is needed THEN the Stock Ingestion System SHALL provide indexes on exchange and instrument_type for efficient filtering
5. WHEN no instruments are found THEN the Stock Ingestion System SHALL log a warning and complete gracefully without errors

### Requirement 9

**User Story:** As a system operator, I want JSON-based configuration files for each DAG and the execution environment, so that I can customize behavior without modifying code.

#### Acceptance Criteria

1. WHEN the system initializes THEN the Stock Ingestion System SHALL load root-level configuration from stock_ingestion/config/config.json for API keys and database settings
2. WHEN a DAG executes THEN the Stock Ingestion System SHALL load DAG-specific configuration from a config.json file within that DAG's folder (e.g., dag_1_import_instruments_from_kite/config.json)
3. WHEN DAG configuration is read THEN the Stock Ingestion System SHALL parse DAG-specific settings including start_date, end_date, frequency, symbol_list, and other parameters relevant to that DAG
4. WHEN a configuration parameter is missing THEN the Stock Ingestion System SHALL use sensible default values defined in the code
5. WHEN configuration errors occur THEN the Stock Ingestion System SHALL log detailed error messages and fail gracefully with clear guidance
