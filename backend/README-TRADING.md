# MoneyPlant Trading Backend

A comprehensive Spring Boot modulelith application for algorithmic trading with real-time data processing, pattern detection, strategy execution, and backtesting capabilities.

## Tech Stack

- **Java 21+**
- **Spring Boot 3.x**
- **Maven**
- **Apache Kafka** - Real-time messaging and stream processing
- **Apache Spark** - Big data processing and analytics
- **Apache Hudi** - Incremental data processing and storage
- **Apache Iceberg** - Table format for large datasets
- **Trino** - Distributed SQL query engine
- **Lombok** - Code generation and boilerplate reduction
- **Jackson JSON** - JSON processing
- **SLF4J + Logback** - Logging framework

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
src/main/java/com/moneyplant/trading/
├── config/          # Configuration classes for all components
├── common/          # Shared DTOs, enums, utilities, exceptions
├── ingestion/       # Data ingestion and streaming
├── screener/         # Pattern detection and signal generation
├── strategy/        # Trading strategy execution
├── storage/         # Data storage and persistence
├── query/           # Analytics and querying
└── backtest/        # Historical backtesting and simulation
```

## Module Details

### 1. Config Module (`config/`)
- **KafkaConfig** - Kafka producer/consumer configuration
- **SparkConfig** - Spark session and context configuration
- **TrinoConfig** - Trino connection and data source configuration
- **HudiConfig** - Hudi table and write options configuration
- **IcebergConfig** - Iceberg warehouse and table configuration

### 2. Common Module (`common/`)
- **DTOs** - Cross-module data transfer objects
- **Enums** - Common enums (SignalType, StrategyType, PatternType)
- **Utilities** - Date utilities and helper classes
- **Exceptions** - Custom exception hierarchy

### 3. Ingestion Module (`ingestion/`)
- **API** - REST endpoints for ingestion control
- **Service** - Core ingestion logic and Kafka/Spark integration
- **Model** - Ingestion request/response models

### 4. Screener Module (`screener/`)
- **API** - REST endpoints for pattern screening
- **Service** - Pattern detection algorithms and signal generation
- **Model** - Screener-specific data models
- **CandlestickPatternDetector** - Sample pattern detection implementation

### 5. Strategy Module (`strategy/`)
- **API** - REST endpoints for strategy execution
- **Service** - Strategy evaluation and execution logic
- **Model** - Strategy-specific data models
- **RSIStrategy** - Sample RSI strategy implementation

### 6. Storage Module (`storage/`)
- **API** - REST endpoints for storage operations
- **Service** - Data storage and retrieval logic
- **Repository** - Data access layer interfaces
- **Model** - Storage-specific data models

### 7. Query Module (`query/`)
- **API** - REST endpoints for analytics and reporting
- **Service** - Trino query execution and result processing
- **Model** - Query-specific data models

### 8. Backtest Module (`backtest/`)
- **API** - REST endpoints for backtesting operations
- **Service** - Historical replay and performance simulation
- **Model** - Backtest-specific data models

## Configuration

### Application Properties (`application.yml`)
- Kafka configuration with producer/consumer settings
- Spark configuration for local development
- Trino connection parameters
- Hudi and Iceberg storage settings
- Logging configuration

### Logging (`logback-spring.xml`)
- Console logging for development
- File logging for production
- Custom log levels for different components

### Avro Schemas (`schemas/`)
- `market-data.avsc` - Market data structure
- `trading-signal.avsc` - Trading signal structure

## API Endpoints

### Ingestion
- `POST /api/ingestion/start` - Start data ingestion
- `POST /api/ingestion/stop` - Stop data ingestion
- `GET /api/ingestion/status` - Get ingestion status
- `POST /api/ingestion/market-data` - Ingest market data

### Screener
- `POST /api/screener/run` - Run pattern screener
- `GET /api/screener/patterns` - Get available patterns
- `POST /api/screener/detect` - Detect specific pattern
- `GET /api/screener/signals` - Get trading signals

### Strategy
- `POST /api/strategy/execute` - Execute trading strategy
- `GET /api/strategy/list` - Get available strategies
- `POST /api/strategy/backtest` - Backtest strategy
- `GET /api/strategy/performance` - Get strategy performance

### Storage
- `POST /api/storage/write` - Write data to storage
- `GET /api/storage/read` - Read data from storage
- `POST /api/storage/hudi/write` - Write to Hudi storage
- `POST /api/storage/iceberg/write` - Write to Iceberg storage

### Query
- `POST /api/query/run` - Execute custom query
- `GET /api/query/analytics` - Get analytics data
- `GET /api/query/backtesting` - Get backtesting data
- `GET /api/query/reporting` - Generate reports

### Backtest
- `POST /api/backtest/run` - Run backtest
- `GET /api/backtest/results` - Get backtest results
- `GET /api/backtest/metrics` - Get backtest metrics
- `POST /api/backtest/historical-replay` - Start historical replay

## Getting Started

### Prerequisites
- Java 21+
- Maven 3.8+
- Apache Kafka (local or remote)
- Apache Spark (local mode for development)
- Trino server (local or remote)
- PostgreSQL (for metadata storage)

### Building the Application
```bash
cd backend
mvn clean compile
```

### Running the Application
```bash
mvn spring-boot:run
```

### Configuration
Update `application.yml` with your specific configuration:
- Kafka bootstrap servers
- Trino connection details
- Hudi and Iceberg storage paths
- Database connection parameters

## Development Notes

### Current Status
- ✅ Complete module structure and package organization
- ✅ All Spring Boot components wired and configured
- ✅ REST API endpoints defined with placeholder implementations
- ✅ Configuration classes for all major components
- ✅ Sample implementations (RSI strategy, candlestick pattern detector)
- ✅ Avro schemas for data serialization
- ✅ Comprehensive logging configuration

### Next Steps
1. Implement business logic in service classes
2. Add comprehensive error handling and validation
3. Implement data persistence and caching
4. Add unit and integration tests
5. Configure production deployment settings
6. Add monitoring and metrics collection
7. Implement security and authentication

### TODO Items
All service methods contain `// TODO: implement` comments indicating where business logic should be implemented. The current implementation provides:
- Proper Spring Boot component wiring
- Interface-based design for loose coupling
- Comprehensive logging and error handling structure
- REST API endpoint definitions
- Configuration placeholders for all components

## Contributing

1. Follow the existing package structure
2. Implement interfaces before concrete classes
3. Add comprehensive logging to all operations
4. Include TODO comments for future implementations
5. Follow Spring Boot best practices
6. Add unit tests for all new functionality

## License

This project is part of the MoneyPlant application suite.
