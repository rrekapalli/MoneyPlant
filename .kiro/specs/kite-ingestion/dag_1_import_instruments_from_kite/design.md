# Design Document

## Overview

The Stock Ingestion system is a modular data pipeline that fetches market data from various sources (initially Kite Connect API) and stores it in PostgreSQL. The system follows the proven architecture pattern of the existing `nse_airflow` module, providing a scalable foundation for multiple data ingestion DAGs.

The initial implementation (DAG 1) focuses on importing the complete instrument list from Kite Connect API into a new `kite_instrument_master` table. The design emphasizes:

- **Modularity**: Each DAG is self-contained with its own configuration
- **Reusability**: Shared utilities and configurations are centralized
- **Flexibility**: Easy to add new data sources and DAGs
- **Reliability**: Comprehensive error handling and retry logic
- **Observability**: Detailed logging and execution metrics

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Stock Ingestion System                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │ execute_dags │─────▶│  DAG Router  │                     │
│  │    .py       │      │              │                     │
│  └──────────────┘      └──────┬───────┘                     │
│                               │                              │
│                               ▼                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         DAG 1: Import Instruments from Kite        │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  • Load DAG config                                  │    │
│  │  • Authenticate with Kite API                       │    │
│  │  • Fetch instrument list                            │    │
│  │  • Transform & validate data                        │    │
│  │  • Upsert to kite_instrument_master table           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Shared Components                       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  • Config Loader (root + DAG-specific)              │   │
│  │  • Database Connection Manager                       │   │
│  │  • Logging Configuration                             │   │
│  │  • KiteAPIClient (from kite_trader)                 │   │
│  │  • Utility Functions                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   Database      │
                  │                 │
                  │ • kite_         │
                  │   instrument_   │
                  │   master        │
                  └─────────────────┘
```

### Directory Structure

```
stock_ingestion/
├── execute_dags.py                          # Main execution script
├── requirements.txt                         # Python dependencies
├── README.md                                # Documentation
│
├── config/                                  # Root-level configuration
│   └── config.json                          # API keys, DB settings
│
├── shared/                                  # Shared modules
│   ├── __init__.py
│   ├── config/                              # Configuration modules
│   │   ├── __init__.py
│   │   ├── config_loader.py                # Config loading utilities
│   │   └── logging_config.py               # Logging setup
│   └── utils/                               # Utility modules
│       ├── __init__.py
│       ├── db_manager.py                   # Database operations
│       └── kite_client_wrapper.py          # Kite API wrapper
│
└── dag_1_import_instruments_from_kite/     # DAG 1 implementation
    ├── __init__.py
    ├── config.json                          # DAG-specific config
    ├── import_instruments.py                # Main DAG logic
    └── schema.sql                           # Table creation script
```

## Components and Interfaces

### 1. Execute DAGs Script (`execute_dags.py`)

**Purpose**: Main entry point for executing DAGs with command-line interface.

**Interface**:
```python
def main() -> bool:
    """
    Execute selected DAGs based on command-line arguments.
    
    Returns:
        bool: True if all DAGs succeeded, False otherwise
    """
    pass

def parse_arguments() -> argparse.Namespace:
    """Parse and validate command-line arguments."""
    pass

def execute_dag_wrapper(dag_id: int, name: str, func: Callable) -> Tuple[int, bool, str]:
    """
    Execute a single DAG with logging and error handling.
    
    Args:
        dag_id: DAG identifier
        name: DAG name for logging
        func: DAG execution function
        
    Returns:
        Tuple of (dag_id, success, result_message)
    """
    pass
```

**Command-Line Interface**:
- `python execute_dags.py` - Execute all DAGs
- `python execute_dags.py --dag 1` - Execute DAG 1 only
- `python execute_dags.py --list` - List all available DAGs
- `python execute_dags.py --help` - Show help message

### 2. Configuration Loader (`shared/config/config_loader.py`)

**Purpose**: Load and validate configuration from JSON files.

**Interface**:
```python
class ConfigLoader:
    """Handles loading of root and DAG-specific configurations."""
    
    @staticmethod
    def load_root_config() -> Dict[str, Any]:
        """
        Load root-level configuration (API keys, DB settings).
        
        Returns:
            Dictionary with configuration values
            
        Raises:
            ConfigurationError: If config file is missing or invalid
        """
        pass
    
    @staticmethod
    def load_dag_config(dag_folder: str) -> Dict[str, Any]:
        """
        Load DAG-specific configuration.
        
        Args:
            dag_folder: Path to DAG folder
            
        Returns:
            Dictionary with DAG configuration
            
        Raises:
            ConfigurationError: If config file is missing or invalid
        """
        pass
    
    @staticmethod
    def get_with_default(config: Dict, key: str, default: Any) -> Any:
        """Get configuration value with fallback to default."""
        pass
```

**Root Configuration Schema** (`config/config.json`):
```json
{
  "api": {
    "kite_api_key": "${KITE_API_KEY}",
    "kite_api_secret": "${KITE_API_SECRET}",
    "kite_access_token": "${KITE_ACCESS_TOKEN}"
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "database": "moneytree",
    "user": "${DB_USER}",
    "password": "${DB_PASSWORD}"
  },
  "logging": {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
  }
}
```

**Note**: Environment variables should be defined in a root-level `.env` file (not in `./kite_trader/.env`). The configuration loader will read from the root `.env` file using a library like `python-dotenv`.

**DAG Configuration Schema** (`dag_1_import_instruments_from_kite/config.json`):
```json
{
  "enabled": true,
  "schedule": "daily",
  "description": "Import complete instrument list from Kite Connect API",
  "parameters": {
    "exchanges": ["NSE", "BSE", "NFO", "BFO", "CDS", "MCX"],
    "batch_size": 1000,
    "retry_attempts": 3,
    "retry_delay_seconds": 5
  }
}
```

### 3. Database Manager (`shared/utils/db_manager.py`)

**Purpose**: Handle database connections and operations.

**Interface**:
```python
class DatabaseManager:
    """Manages PostgreSQL database connections and operations."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize with database configuration."""
        pass
    
    def get_connection(self) -> psycopg2.extensions.connection:
        """
        Get a database connection.
        
        Returns:
            Active database connection
            
        Raises:
            DatabaseError: If connection fails
        """
        pass
    
    def execute_query(self, query: str, params: Optional[Tuple] = None) -> None:
        """
        Execute a query without returning results.
        
        Args:
            query: SQL query string
            params: Query parameters
            
        Raises:
            DatabaseError: If query execution fails
        """
        pass
    
    def execute_many(self, query: str, data: List[Tuple]) -> int:
        """
        Execute a query with multiple parameter sets.
        
        Args:
            query: SQL query string
            data: List of parameter tuples
            
        Returns:
            Number of rows affected
            
        Raises:
            DatabaseError: If execution fails
        """
        pass
    
    def upsert_instruments(self, instruments: List[Dict]) -> Tuple[int, int]:
        """
        Upsert instruments into kite_instrument_master table.
        
        Args:
            instruments: List of instrument dictionaries
            
        Returns:
            Tuple of (inserted_count, updated_count)
            
        Raises:
            DatabaseError: If upsert fails
        """
        pass
    
    def close(self) -> None:
        """Close database connection."""
        pass
```

### 4. Kite Client Wrapper (`shared/utils/kite_client_wrapper.py`)

**Purpose**: Wrap KiteAPIClient with additional functionality for data ingestion.

**Interface**:
```python
class KiteClientWrapper:
    """Wrapper around KiteAPIClient for data ingestion operations."""
    
    def __init__(self, api_key: str, api_secret: str, access_token: str):
        """Initialize with Kite API credentials."""
        pass
    
    def authenticate(self) -> bool:
        """
        Authenticate with Kite Connect API.
        
        Returns:
            True if authentication successful
            
        Raises:
            AuthenticationError: If authentication fails
        """
        pass
    
    def fetch_instruments(self) -> List[Dict[str, Any]]:
        """
        Fetch complete instrument list from Kite API.
        
        Returns:
            List of instrument dictionaries
            
        Raises:
            APIError: If fetch fails
        """
        pass
    
    def filter_instruments(
        self, 
        instruments: List[Dict], 
        exchanges: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Filter instruments by exchange.
        
        Args:
            instruments: List of instruments
            exchanges: List of exchange codes to include
            
        Returns:
            Filtered list of instruments
        """
        pass
```

### 5. DAG 1: Import Instruments (`dag_1_import_instruments_from_kite/import_instruments.py`)

**Purpose**: Fetch and store instrument list from Kite Connect API.

**Interface**:
```python
def import_instruments_from_kite() -> str:
    """
    Main execution function for DAG 1.
    
    Workflow:
    1. Load DAG configuration
    2. Initialize Kite client and authenticate
    3. Fetch instrument list
    4. Validate and transform data
    5. Create/update kite_instrument_master table
    6. Upsert instruments to database
    7. Log summary statistics
    
    Returns:
        Success message with statistics
        
    Raises:
        DAGExecutionError: If any step fails
    """
    pass

def create_kite_instrument_master_table(db_manager: DatabaseManager) -> None:
    """
    Create kite_instrument_master table if it doesn't exist.
    
    Args:
        db_manager: Database manager instance
        
    Raises:
        DatabaseError: If table creation fails
    """
    pass

def validate_instruments(instruments: List[Dict]) -> List[Dict]:
    """
    Validate instrument data.
    
    Args:
        instruments: List of instrument dictionaries
        
    Returns:
        List of valid instruments
        
    Raises:
        ValidationError: If validation fails critically
    """
    pass

def transform_instruments(instruments: List[Dict]) -> List[Dict]:
    """
    Transform instrument data for database storage.
    
    Args:
        instruments: List of instrument dictionaries
        
    Returns:
        Transformed list ready for database insertion
    """
    pass
```

## Data Models

### Kite Instrument Master Table Schema

```sql
CREATE TABLE IF NOT EXISTS kite_instrument_master (
    -- Primary identifiers
    instrument_token BIGINT NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    
    -- Instrument details
    tradingsymbol VARCHAR(50) NOT NULL,
    exchange_token VARCHAR(50),
    instrument_type VARCHAR(10),
    name VARCHAR(255),
    segment VARCHAR(20),
    
    -- Derivative-specific fields (NULL for equities)
    expiry DATE,
    strike DECIMAL(15, 2),
    
    -- Trading parameters
    tick_size DECIMAL(10, 4),
    lot_size INTEGER,
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    PRIMARY KEY (instrument_token, exchange),
    CONSTRAINT unique_tradingsymbol_exchange UNIQUE (tradingsymbol, exchange)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_tradingsymbol 
    ON kite_instrument_master(tradingsymbol);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_exchange 
    ON kite_instrument_master(exchange);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_instrument_type 
    ON kite_instrument_master(instrument_type);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_segment 
    ON kite_instrument_master(segment);
```

### Instrument Data Model

**Python Representation**:
```python
@dataclass
class Instrument:
    """Represents a tradable instrument."""
    
    instrument_token: int
    exchange: str
    tradingsymbol: str
    exchange_token: Optional[str]
    instrument_type: Optional[str]
    name: Optional[str]
    segment: Optional[str]
    expiry: Optional[date]
    strike: Optional[Decimal]
    tick_size: Optional[Decimal]
    lot_size: Optional[int]
    last_updated: datetime = field(default_factory=datetime.now)
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database insertion."""
        pass
    
    @classmethod
    def from_kite_response(cls, data: Dict[str, Any]) -> 'Instrument':
        """Create Instrument from Kite API response."""
        pass
    
    def validate(self) -> bool:
        """Validate instrument data."""
        pass
```

### Configuration Data Models

**Root Configuration**:
```python
@dataclass
class APIConfig:
    """API configuration."""
    kite_api_key: str
    kite_api_secret: str
    kite_access_token: str

@dataclass
class DatabaseConfig:
    """Database configuration."""
    host: str
    port: int
    database: str
    user: str
    password: str

@dataclass
class RootConfig:
    """Root-level configuration."""
    api: APIConfig
    database: DatabaseConfig
    logging: Dict[str, Any]
```

**DAG Configuration**:
```python
@dataclass
class DAGConfig:
    """DAG-specific configuration."""
    enabled: bool
    schedule: str
    description: str
    parameters: Dict[str, Any]
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication precedes data fetching

*For any* instrument fetch operation, authentication with the Kite API must complete successfully before any data retrieval attempts are made.

**Validates: Requirements 1.1**

### Property 2: All required fields are parsed

*For any* valid Kite API response containing instruments, the parsed result must include all required fields (tradingsymbol, exchange, instrument_token, exchange_token, instrument_type, name, segment, expiry, strike, tick_size, lot_size) for each instrument.

**Validates: Requirements 1.3**

### Property 3: Required field validation

*For any* instrument in the parsed data, validation must verify that all required fields (instrument_token, exchange, tradingsymbol) are present and non-null.

**Validates: Requirements 1.4**

### Property 4: Schema transformation correctness

*For any* valid instrument that passes validation, the transformation function must produce output that matches the kite_instrument_master table schema with all fields correctly mapped.

**Validates: Requirements 1.5**

### Property 5: Idempotent table creation

*For any* number of initialization calls, the kite_instrument_master table must exist after execution, and running initialization multiple times must not cause errors or data loss.

**Validates: Requirements 2.1**

### Property 6: Field mapping completeness

*For any* instrument from the Kite API, the mapping to database columns must preserve all non-null fields without data loss.

**Validates: Requirements 3.1**

### Property 7: Upsert idempotence

*For any* instrument, performing an upsert operation multiple times with the same data must result in exactly one record in the database with the latest data.

**Validates: Requirements 3.2**

### Property 8: Composite key uniqueness

*For any* two instruments with the same (instrument_token, exchange) composite key, only one record must exist in the database after upsert operations complete.

**Validates: Requirements 3.3**

### Property 9: Upsert count logging

*For any* upsert operation, the system must log the count of inserted records and updated records, and the sum must equal the total number of instruments processed.

**Validates: Requirements 3.4**

### Property 10: Transaction rollback on error

*For any* database error that occurs during a transaction, the system must rollback all changes, leaving the database in its pre-transaction state.

**Validates: Requirements 3.5**

### Property 11: Operation logging completeness

*For any* operation execution, the logs must contain both a start timestamp and a completion status (success or failure) with execution duration.

**Validates: Requirements 5.1**

### Property 12: Retry with exponential backoff

*For any* transient API failure, the system must retry the operation with exponentially increasing delays (e.g., 1s, 2s, 4s) up to the configured maximum retry attempts.

**Validates: Requirements 5.2**

### Property 13: Error logging detail

*For any* error that occurs, the log entry must include the error message, context information (operation being performed), and a stack trace.

**Validates: Requirements 5.3**

### Property 14: DAG completion summary

*For any* DAG execution that completes (successfully or with errors), the logs must include summary statistics with record counts and total execution duration.

**Validates: Requirements 5.5**

### Property 15: Progress display during execution

*For any* DAG execution, the system must display progress information and timing metrics in the console output.

**Validates: Requirements 7.5**

### Property 16: Complete instrument storage

*For any* set of instruments fetched from the Kite API, the count of instruments stored in the database must equal the count of instruments fetched (no filtering or loss).

**Validates: Requirements 8.1**

### Property 17: Metadata preservation

*For any* instrument stored in the database, all metadata fields (exchange, segment, instrument_type, expiry, strike, lot_size) must match the values from the Kite API response.

**Validates: Requirements 8.2**

### Property 18: Summary statistics by category

*For any* completed ingestion, the logs must include summary statistics broken down by exchange and instrument_type showing counts for each category.

**Validates: Requirements 8.3**

### Property 19: DAG configuration loading

*For any* DAG execution, the system must successfully load the DAG-specific configuration from the config.json file in that DAG's folder.

**Validates: Requirements 9.2**

### Property 20: Configuration parsing completeness

*For any* valid DAG configuration file, all specified parameters must be parsed and available to the DAG execution function.

**Validates: Requirements 9.3**

### Property 21: Default value fallback

*For any* missing configuration parameter, the system must use a sensible default value and log a warning about the missing parameter.

**Validates: Requirements 9.4**

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Invalid API credentials
   - Expired access token
   - Network connectivity issues
   
   **Handling**: Log detailed error, provide clear guidance on credential configuration, fail fast without retries.

2. **API Errors**
   - Rate limiting (HTTP 429)
   - Server errors (HTTP 5xx)
   - Timeout errors
   
   **Handling**: Implement exponential backoff retry (max 3 attempts), log each retry attempt, fail gracefully after max retries.

3. **Data Validation Errors**
   - Missing required fields
   - Invalid data types
   - Constraint violations
   
   **Handling**: Log validation errors with details, skip invalid records, continue processing valid records, report summary at end.

4. **Database Errors**
   - Connection failures
   - Transaction deadlocks
   - Constraint violations
   
   **Handling**: Rollback transaction, log error with context, retry connection errors (max 3 attempts), fail gracefully.

5. **Configuration Errors**
   - Missing configuration files
   - Invalid JSON syntax
   - Missing required parameters
   
   **Handling**: Log detailed error with file path and issue, provide clear guidance, fail fast without execution.

### Error Handling Patterns

```python
# Pattern 1: Retry with exponential backoff
def retry_with_backoff(func, max_attempts=3, base_delay=1.0):
    """Execute function with exponential backoff retry."""
    for attempt in range(max_attempts):
        try:
            return func()
        except TransientError as e:
            if attempt == max_attempts - 1:
                raise
            delay = base_delay * (2 ** attempt)
            logger.warning(f"Attempt {attempt + 1} failed, retrying in {delay}s: {e}")
            time.sleep(delay)

# Pattern 2: Transaction with rollback
def execute_with_transaction(db_manager, operations):
    """Execute operations within a transaction with automatic rollback."""
    conn = db_manager.get_connection()
    try:
        with conn:
            for operation in operations:
                operation(conn)
        logger.info("Transaction committed successfully")
    except Exception as e:
        logger.error(f"Transaction failed, rolling back: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

# Pattern 3: Validation with error collection
def validate_instruments(instruments):
    """Validate instruments and collect errors."""
    valid_instruments = []
    errors = []
    
    for instrument in instruments:
        try:
            if validate_instrument(instrument):
                valid_instruments.append(instrument)
        except ValidationError as e:
            errors.append((instrument.get('tradingsymbol'), str(e)))
    
    if errors:
        logger.warning(f"Validation errors for {len(errors)} instruments")
        for symbol, error in errors:
            logger.debug(f"  {symbol}: {error}")
    
    return valid_instruments, errors
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific functionality of individual components:

1. **Configuration Loading**
   - Test loading valid configuration files
   - Test handling of missing configuration files
   - Test environment variable substitution
   - Test default value fallback

2. **Data Transformation**
   - Test instrument field mapping
   - Test handling of null/missing fields
   - Test data type conversions

3. **Database Operations**
   - Test connection establishment
   - Test query execution
   - Test transaction rollback
   - Test upsert logic

4. **API Client Wrapper**
   - Test authentication flow
   - Test instrument fetching (with mocked API)
   - Test error handling for API failures

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using the **Hypothesis** library for Python:

**Configuration**:
- Each property test will run a minimum of 100 iterations
- Tests will use Hypothesis to generate random valid inputs
- Each test will be tagged with a comment referencing the design document property

**Property Tests**:

1. **Property 2: All required fields are parsed**
   ```python
   # Feature: stock-ingestion, Property 2: All required fields are parsed
   @given(kite_api_response=valid_instrument_list())
   def test_all_fields_parsed(kite_api_response):
       """For any valid Kite API response, all required fields must be parsed."""
       parsed = parse_instruments(kite_api_response)
       required_fields = ['tradingsymbol', 'exchange', 'instrument_token', 
                         'exchange_token', 'instrument_type', 'name', 
                         'segment', 'expiry', 'strike', 'tick_size', 'lot_size']
       for instrument in parsed:
           for field in required_fields:
               assert field in instrument
   ```

2. **Property 4: Schema transformation correctness**
   ```python
   # Feature: stock-ingestion, Property 4: Schema transformation correctness
   @given(instrument=valid_instrument())
   def test_transformation_preserves_data(instrument):
       """For any valid instrument, transformation must preserve all data."""
       transformed = transform_instrument(instrument)
       assert transformed['instrument_token'] == instrument['instrument_token']
       assert transformed['exchange'] == instrument['exchange']
       assert transformed['tradingsymbol'] == instrument['tradingsymbol']
       # ... verify all fields
   ```

3. **Property 7: Upsert idempotence**
   ```python
   # Feature: stock-ingestion, Property 7: Upsert idempotence
   @given(instrument=valid_instrument())
   def test_upsert_idempotence(instrument, db_manager):
       """For any instrument, multiple upserts must result in one record."""
       # Upsert the same instrument 3 times
       for _ in range(3):
           db_manager.upsert_instruments([instrument])
       
       # Verify only one record exists
       count = db_manager.count_instruments(
           instrument['instrument_token'], 
           instrument['exchange']
       )
       assert count == 1
   ```

4. **Property 10: Transaction rollback on error**
   ```python
   # Feature: stock-ingestion, Property 10: Transaction rollback on error
   @given(instruments=list_of_instruments())
   def test_transaction_rollback(instruments, db_manager):
       """For any error during transaction, all changes must be rolled back."""
       initial_count = db_manager.count_all_instruments()
       
       # Insert one invalid instrument to trigger error
       invalid_instrument = {**instruments[0], 'instrument_token': None}
       instruments_with_error = instruments + [invalid_instrument]
       
       with pytest.raises(DatabaseError):
           db_manager.upsert_instruments(instruments_with_error)
       
       # Verify no changes were committed
       final_count = db_manager.count_all_instruments()
       assert final_count == initial_count
   ```

5. **Property 16: Complete instrument storage**
   ```python
   # Feature: stock-ingestion, Property 16: Complete instrument storage
   @given(instruments=list_of_instruments(min_size=10, max_size=100))
   def test_complete_storage(instruments, db_manager):
       """For any set of instruments, all must be stored without loss."""
       fetched_count = len(instruments)
       db_manager.upsert_instruments(instruments)
       
       stored_count = db_manager.count_instruments_by_tokens(
           [i['instrument_token'] for i in instruments]
       )
       assert stored_count == fetched_count
   ```

6. **Property 17: Metadata preservation**
   ```python
   # Feature: stock-ingestion, Property 17: Metadata preservation
   @given(instrument=valid_instrument())
   def test_metadata_preservation(instrument, db_manager):
       """For any instrument, all metadata must be preserved in storage."""
       db_manager.upsert_instruments([instrument])
       
       stored = db_manager.get_instrument(
           instrument['instrument_token'],
           instrument['exchange']
       )
       
       assert stored['exchange'] == instrument['exchange']
       assert stored['segment'] == instrument['segment']
       assert stored['instrument_type'] == instrument['instrument_type']
       assert stored['lot_size'] == instrument['lot_size']
       # ... verify all metadata fields
   ```

7. **Property 21: Default value fallback**
   ```python
   # Feature: stock-ingestion, Property 21: Default value fallback
   @given(config=dag_config_with_missing_params())
   def test_default_value_fallback(config):
       """For any missing parameter, a default must be used."""
       loaded_config = load_dag_config(config)
       
       # Verify defaults are applied for missing parameters
       assert 'batch_size' in loaded_config
       assert 'retry_attempts' in loaded_config
       assert loaded_config['batch_size'] > 0
       assert loaded_config['retry_attempts'] > 0
   ```

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **Complete DAG Execution**
   - Test full DAG 1 execution with mocked Kite API
   - Verify database state after execution
   - Verify logging output

2. **Configuration Integration**
   - Test loading both root and DAG configs
   - Test configuration override behavior
   - Test environment variable substitution

3. **Database Integration**
   - Test table creation
   - Test index creation
   - Test constraint enforcement
   - Test upsert behavior with real database

4. **Error Recovery**
   - Test retry behavior with simulated failures
   - Test transaction rollback with real database
   - Test graceful degradation

### Test Data Generators

Using Hypothesis strategies for generating test data:

```python
from hypothesis import strategies as st

@st.composite
def valid_instrument(draw):
    """Generate a valid instrument for testing."""
    return {
        'instrument_token': draw(st.integers(min_value=1, max_value=999999999)),
        'exchange': draw(st.sampled_from(['NSE', 'BSE', 'NFO', 'BFO'])),
        'tradingsymbol': draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd')))),
        'exchange_token': draw(st.text(min_size=1, max_size=50)),
        'instrument_type': draw(st.sampled_from(['EQ', 'FUT', 'OPT', 'CE', 'PE'])),
        'name': draw(st.text(min_size=1, max_size=255)),
        'segment': draw(st.sampled_from(['NSE', 'BSE', 'NFO-FUT', 'NFO-OPT'])),
        'expiry': draw(st.one_of(st.none(), st.dates())),
        'strike': draw(st.one_of(st.none(), st.decimals(min_value=0, max_value=100000, places=2))),
        'tick_size': draw(st.decimals(min_value=0.01, max_value=1.0, places=4)),
        'lot_size': draw(st.integers(min_value=1, max_value=10000))
    }

@st.composite
def list_of_instruments(draw, min_size=1, max_size=50):
    """Generate a list of valid instruments."""
    return draw(st.lists(valid_instrument(), min_size=min_size, max_size=max_size))
```

### Testing Requirements Summary

- **Unit tests**: Verify individual component functionality
- **Property-based tests**: Verify universal properties hold across many inputs (minimum 100 iterations per test)
- **Integration tests**: Verify end-to-end workflows
- **Test coverage target**: Minimum 80% code coverage
- **Property test tagging**: Each property test must include a comment with format: `# Feature: stock-ingestion, Property {number}: {property_text}`
- **Test framework**: pytest for unit/integration tests, Hypothesis for property-based tests
- **Database testing**: Use test database or transactions with rollback for isolation
