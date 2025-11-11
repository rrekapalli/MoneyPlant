# Ingestion Engine - Requirements Document

## Introduction

The Ingestion Engine is a high-performance Java-based system designed to replace the existing Python-based NSE data fetching infrastructure (from `/home/raja/code/money-plant-python/nseairflow`). This engine will provide real-time and historical market data ingestion capabilities with sub-10ms latency for high-frequency trading (HFT) and intraday trading strategies.

The system will support 1000+ symbols with real-time WebSocket connections, process 10,000+ ticks per second per symbol, and integrate with Apache Kafka for event streaming. Built as a Spring Boot modulith within the existing `./engines` architecture, it will leverage TimescaleDB for time-series optimization and provide normalized, validated market data to downstream systems.

This specification addresses Phase 1 of the Python-to-Java migration, focusing on core infrastructure for market data acquisition, normalization, storage, and distribution.

## Glossary

- **IngestionEngine**: The Java-based system responsible for ingesting, processing, and distributing market data
- **NSE**: National Stock Exchange of India
- **WebSocketConnection**: Persistent bidirectional communication channel for real-time data streaming
- **TickData**: Individual market data update containing price, volume, and timestamp information
- **OHLCV**: Open, High, Low, Close, Volume - standard candlestick data format
- **KafkaTopic**: Named stream in Apache Kafka for publishing market data events
- **TimescaleDB**: PostgreSQL extension optimized for time-series data storage
- **DataNormalization**: Process of converting raw market data into standardized format
- **CircuitBreaker**: Fault tolerance pattern to prevent cascading failures
- **RateLimiter**: Component that controls the frequency of API requests
- **DataProvider**: External data source (NSE, Yahoo Finance, broker APIs)
- **SymbolUniverse**: Set of tradable instruments (stocks, indices, derivatives)
- **DataLake**: Centralized repository for storing raw and processed market data
- **Backpressure**: Flow control mechanism to handle data processing overload

## Requirements

### Requirement 1: Real-time Market Data WebSocket Integration

**User Story:** As a trading system, I want to receive real-time tick-by-tick market data via WebSocket connections, so that I can execute HFT and intraday strategies with minimal latency.

#### Acceptance Criteria

1. WHEN the IngestionEngine starts THEN it SHALL establish WebSocketConnection to NSE data feeds for subscribed symbols
2. WHEN TickData is received THEN the IngestionEngine SHALL process and normalize data within 5ms
3. WHEN processing TickData THEN the IngestionEngine SHALL handle 10,000+ ticks per second per symbol without data loss
4. WHEN WebSocketConnection fails THEN the IngestionEngine SHALL implement automatic reconnection with exponential backoff up to 5 retry attempts
5. WHEN connection is restored THEN the IngestionEngine SHALL request missed data to maintain continuity
6. WHEN multiple symbols are subscribed THEN the IngestionEngine SHALL support 1000+ concurrent symbol subscriptions
7. WHEN market hours end THEN the IngestionEngine SHALL gracefully close connections and persist final state
8. WHEN data validation fails THEN the IngestionEngine SHALL log invalid data and continue processing without blocking

### Requirement 2: Historical Data Ingestion and Backfill

**User Story:** As a quantitative analyst, I want to ingest historical market data from multiple sources including NSE, so that I can backtest strategies and perform historical analysis.

#### Acceptance Criteria

1. WHEN historical OHLCV ingestion is initiated THEN the IngestionEngine SHALL fetch data from Yahoo Finance API with configurable date ranges
2. WHEN NSE historical data is requested THEN the IngestionEngine SHALL fetch from NSE API for Indian equities
3. WHEN RateLimiter is configured THEN the IngestionEngine SHALL respect API rate limits of 2000 requests per hour per source
4. WHEN ingesting data for SymbolUniverse THEN the IngestionEngine SHALL process 2000+ symbols in parallel using virtual threads
5. WHEN data is fetched THEN the IngestionEngine SHALL support multiple timeframes (1min, 5min, 15min, 1hour, 1day)
6. WHEN backfill is requested THEN the IngestionEngine SHALL identify and fill data gaps in TimescaleDB storage
7. WHEN CSV import is triggered THEN the IngestionEngine SHALL parse and validate CSV files with error reporting
8. WHEN duplicate data is detected THEN the IngestionEngine SHALL implement upsert logic to prevent data duplication
9. WHEN ingestion completes THEN the IngestionEngine SHALL generate summary report with success/failure counts

### Requirement 3: Kafka Event Streaming Integration

**User Story:** As a downstream consumer, I want market data published to Kafka topics in real-time, so that I can build event-driven trading strategies and analytics pipelines.

#### Acceptance Criteria

1. WHEN TickData is normalized THEN the IngestionEngine SHALL publish to KafkaTopic `market-data-ticks` within 2ms
2. WHEN OHLCV candles are formed THEN the IngestionEngine SHALL publish to KafkaTopic `market-data-candles` with timeframe metadata
3. WHEN KafkaTopic is unavailable THEN the IngestionEngine SHALL implement CircuitBreaker pattern with 10-second timeout
4. WHEN Backpressure occurs THEN the IngestionEngine SHALL buffer up to 100,000 messages in memory before applying flow control
5. WHEN message serialization is required THEN the IngestionEngine SHALL use Avro schema for efficient binary encoding
6. WHEN partition strategy is applied THEN the IngestionEngine SHALL partition by symbol for ordered processing
7. WHEN message delivery fails THEN the IngestionEngine SHALL retry up to 3 times with exponential backoff
8. WHEN monitoring is enabled THEN the IngestionEngine SHALL expose metrics for message throughput, latency, and error rates

### Requirement 4: Data Normalization and Validation

**User Story:** As a data consumer, I want all market data normalized to a consistent format with validation, so that I can rely on data quality for trading decisions.

#### Acceptance Criteria

1. WHEN raw data is received THEN the IngestionEngine SHALL convert to standardized schema with symbol, timestamp, price, volume, and metadata fields
2. WHEN price data is validated THEN the IngestionEngine SHALL reject prices outside 20% circuit breaker limits from previous close
3. WHEN timestamp validation occurs THEN the IngestionEngine SHALL ensure monotonically increasing timestamps per symbol
4. WHEN volume data is checked THEN the IngestionEngine SHALL flag negative or unrealistic volume values
5. WHEN corporate actions are detected THEN the IngestionEngine SHALL adjust historical prices for splits and dividends
6. WHEN data quality metrics are calculated THEN the IngestionEngine SHALL track completeness, accuracy, and timeliness scores
7. WHEN anomalies are identified THEN the IngestionEngine SHALL publish alerts to `data-quality-alerts` KafkaTopic
8. WHEN data enrichment is required THEN the IngestionEngine SHALL add derived fields like bid-ask spread and VWAP

### Requirement 5: TimescaleDB Time-Series Storage

**User Story:** As a system administrator, I want efficient intraday tick storage in TimescaleDB with automatic end-of-day archival, so that I can maintain fast query performance while preserving historical data in offline storage.

#### Acceptance Criteria

1. WHEN tick data is stored THEN the IngestionEngine SHALL write to TimescaleDB hypertable `nse_eq_ticks` for current trading day only
2. WHEN OHLCV data is stored THEN the IngestionEngine SHALL write to hypertable `market_data_ohlcv` with 1-day chunk intervals
3. WHEN trading day ends THEN the IngestionEngine SHALL archive current day's tick data to Apache Hudi tables in offline storage
4. WHEN new trading day starts THEN the IngestionEngine SHALL truncate `nse_eq_ticks` table before inserting new data
5. WHEN batch inserts occur THEN the IngestionEngine SHALL use COPY protocol for bulk inserts achieving 100,000+ rows per second
6. WHEN queries are executed THEN the IngestionEngine SHALL leverage TimescaleDB continuous aggregates for pre-computed OHLCV rollups
7. WHEN indexing is configured THEN the IngestionEngine SHALL create composite indexes on (symbol, timestamp) for optimal query performance
8. WHEN historical tick data is queried THEN the IngestionEngine SHALL retrieve from Apache Hudi tables via Trino

### Requirement 6: Multi-Source Data Provider Support

**User Story:** As a system integrator, I want to support multiple market data providers with pluggable architecture, so that I can switch providers or use multiple sources simultaneously.

#### Acceptance Criteria

1. WHEN data provider is configured THEN the IngestionEngine SHALL support NSE WebSocket, Yahoo Finance REST API, and CSV file sources
2. WHEN provider interface is implemented THEN the IngestionEngine SHALL define common contract for connect, subscribe, fetch, and disconnect operations
3. WHEN provider is selected THEN the IngestionEngine SHALL use Spring Boot configuration properties for provider selection
4. WHEN multiple providers are active THEN the IngestionEngine SHALL merge data streams with conflict resolution based on timestamp priority
5. WHEN provider-specific logic is needed THEN the IngestionEngine SHALL encapsulate provider details in separate adapter classes
6. WHEN new provider is added THEN the IngestionEngine SHALL support plugin architecture without modifying core engine code
7. WHEN provider health check runs THEN the IngestionEngine SHALL monitor connection status and data freshness
8. WHEN provider fails THEN the IngestionEngine SHALL automatically failover to backup provider if configured

### Requirement 7: Symbol Universe Management and Master Data Ingestion

**User Story:** As a portfolio manager, I want the system to ingest and maintain symbol master data from NSE, so that I can manage symbol universes dynamically based on my trading strategies.

#### Acceptance Criteria

1. WHEN symbol master ingestion is triggered THEN the IngestionEngine SHALL fetch equity master data from NSE API and update `nse_eq_master` table
2. WHEN symbol data is fetched THEN the IngestionEngine SHALL parse and store all metadata fields (company_name, sector, industry, isin, trading_status, etc.)
3. WHEN symbol universe is defined THEN the IngestionEngine SHALL query `nse_eq_master` table for predefined lists (NSE 500, Nifty 50, Nifty Bank)
4. WHEN symbols are added THEN the IngestionEngine SHALL dynamically subscribe to new symbols without restart
5. WHEN symbols are removed THEN the IngestionEngine SHALL unsubscribe and stop data ingestion for removed symbols
6. WHEN universe filtering is applied THEN the IngestionEngine SHALL use `pd_sector_ind`, `is_fno_sec`, `sector`, and `trading_status` fields for filtering
7. WHEN universe is updated THEN the IngestionEngine SHALL publish universe change events to KafkaTopic `symbol-universe-updates`
8. WHEN symbol master refresh is scheduled THEN the IngestionEngine SHALL update `nse_eq_master` table daily with latest metadata

### Requirement 8: Performance Monitoring and Metrics

**User Story:** As a DevOps engineer, I want comprehensive monitoring and metrics, so that I can ensure system performance and quickly identify issues.

#### Acceptance Criteria

1. WHEN metrics are collected THEN the IngestionEngine SHALL expose Prometheus-compatible metrics endpoint at `/actuator/prometheus`
2. WHEN latency is measured THEN the IngestionEngine SHALL track end-to-end latency from data receipt to Kafka publish with p50, p95, p99 percentiles
3. WHEN throughput is monitored THEN the IngestionEngine SHALL report ticks per second, messages per second, and bytes per second
4. WHEN errors occur THEN the IngestionEngine SHALL increment error counters by type (connection, validation, storage, kafka)
5. WHEN health checks run THEN the IngestionEngine SHALL implement Spring Boot Actuator health indicators for WebSocket, Kafka, and database
6. WHEN alerts are configured THEN the IngestionEngine SHALL trigger alerts when latency exceeds 50ms or error rate exceeds 1%
7. WHEN dashboards are created THEN the IngestionEngine SHALL provide Grafana dashboard templates for visualization
8. WHEN logs are generated THEN the IngestionEngine SHALL use structured logging with correlation IDs for distributed tracing

### Requirement 9: Reactive Programming and Concurrency

**User Story:** As a performance engineer, I want reactive programming patterns for non-blocking I/O, so that I can achieve maximum throughput with minimal resource usage.

#### Acceptance Criteria

1. WHEN reactive streams are used THEN the IngestionEngine SHALL implement Project Reactor for WebSocket and Kafka integration
2. WHEN virtual threads are enabled THEN the IngestionEngine SHALL use Java 21 virtual threads for parallel data fetching
3. WHEN backpressure is handled THEN the IngestionEngine SHALL implement reactive backpressure strategies (buffer, drop, latest)
4. WHEN thread pools are configured THEN the IngestionEngine SHALL use separate thread pools for I/O, CPU-bound, and blocking operations
5. WHEN concurrent processing occurs THEN the IngestionEngine SHALL ensure thread-safety using immutable data structures
6. WHEN resource cleanup is needed THEN the IngestionEngine SHALL properly dispose of reactive subscriptions on shutdown
7. WHEN error handling is implemented THEN the IngestionEngine SHALL use reactive error operators (retry, fallback, circuit breaker)
8. WHEN performance is optimized THEN the IngestionEngine SHALL achieve <10ms p99 latency for tick processing

### Requirement 10: Configuration and Deployment

**User Story:** As a system administrator, I want flexible configuration and containerized deployment, so that I can deploy the engine in various environments.

#### Acceptance Criteria

1. WHEN configuration is loaded THEN the IngestionEngine SHALL use Spring Boot externalized configuration with profiles (dev, test, prod)
2. WHEN environment variables are set THEN the IngestionEngine SHALL override configuration from environment variables
3. WHEN Docker image is built THEN the IngestionEngine SHALL create optimized multi-stage Docker image <500MB
4. WHEN Kubernetes deployment is configured THEN the IngestionEngine SHALL provide Helm charts with resource limits and health probes
5. WHEN scaling is required THEN the IngestionEngine SHALL support horizontal scaling with Kafka consumer groups
6. WHEN secrets are managed THEN the IngestionEngine SHALL integrate with Kubernetes secrets or HashiCorp Vault
7. WHEN graceful shutdown is triggered THEN the IngestionEngine SHALL complete in-flight processing within 30 seconds
8. WHEN startup occurs THEN the IngestionEngine SHALL perform readiness checks before accepting traffic

### Requirement 11: Data Lake Integration and End-of-Day Archival

**User Story:** As a data scientist, I want intraday tick data automatically archived to data lake at end of day, so that I can perform large-scale analytics using Spark and Trino while maintaining fast intraday query performance.

#### Acceptance Criteria

1. WHEN trading day ends THEN the IngestionEngine SHALL export all tick data from `nse_eq_ticks` to Apache Hudi tables in S3/MinIO
2. WHEN archival completes THEN the IngestionEngine SHALL verify data integrity and record count match between source and destination
3. WHEN partitioning is applied THEN the IngestionEngine SHALL partition by date and symbol for efficient querying
4. WHEN file format is selected THEN the IngestionEngine SHALL use Parquet format with Snappy compression
5. WHEN schema evolution occurs THEN the IngestionEngine SHALL support backward-compatible schema changes
6. WHEN compaction runs THEN the IngestionEngine SHALL compact small files into larger files on configurable schedule
7. WHEN metadata is managed THEN the IngestionEngine SHALL register tables in Hive Metastore for Trino access
8. WHEN archival is verified THEN the IngestionEngine SHALL truncate `nse_eq_ticks` table to prepare for next trading day
9. WHEN retention is enforced THEN the IngestionEngine SHALL implement time-based retention policies in data lake (10+ years)

### Requirement 12: API and Integration Layer

**User Story:** As an application developer, I want REST and WebSocket APIs to access market data, so that I can integrate with frontend and other services.

#### Acceptance Criteria

1. WHEN REST API is called THEN the IngestionEngine SHALL provide endpoints for latest quotes, historical OHLCV, and symbol search
2. WHEN WebSocket API is used THEN the IngestionEngine SHALL support client subscriptions to real-time tick streams
3. WHEN authentication is required THEN the IngestionEngine SHALL validate JWT tokens for API access
4. WHEN rate limiting is enforced THEN the IngestionEngine SHALL limit API requests to 1000 per minute per user
5. WHEN pagination is needed THEN the IngestionEngine SHALL implement cursor-based pagination for large result sets
6. WHEN caching is enabled THEN the IngestionEngine SHALL cache frequently accessed data in Redis with 5-second TTL
7. WHEN API documentation is generated THEN the IngestionEngine SHALL provide OpenAPI 3.0 specification
8. WHEN versioning is implemented THEN the IngestionEngine SHALL support API versioning with /api/v1 prefix
