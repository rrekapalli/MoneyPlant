# Ingestion Engine - Design Document

## Overview

The Ingestion Engine is a high-performance, reactive Java-based system built on Spring Boot 3.x that replaces the Python Airflow-based NSE data fetching infrastructure. The design emphasizes low-latency (<10ms), high-throughput (10,000+ ticks/sec), and fault-tolerant data ingestion with seamless integration into the existing MoneyPlant engines modulith architecture.

### Design Principles

1. **Reactive First**: Non-blocking I/O using Project Reactor for maximum throughput
2. **Modularity**: Clean separation between data providers, processors, and sinks
3. **Fault Tolerance**: Circuit breakers, retry mechanisms, and graceful degradation
4. **Observability**: Comprehensive metrics, logging, and distributed tracing
5. **Scalability**: Horizontal scaling via Kafka consumer groups and stateless design
6. **Performance**: Sub-10ms latency with virtual threads and optimized data structures

### Key Design Decisions

- **Spring Boot Modulith**: Leverage existing engines architecture for consistency
- **Project Reactor**: Reactive streams for WebSocket and Kafka integration
- **Java 21 Virtual Threads**: Lightweight concurrency for parallel data fetching
- **TimescaleDB**: Time-series optimized storage with automatic compression
- **Apache Kafka**: Event streaming backbone for downstream consumers
- **Avro Serialization**: Efficient binary encoding with schema evolution
- **Redis Caching**: Hot data caching for API layer
- **Apache Hudi**: Data lake integration for long-term analytics

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Ingestion Engine                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Data Provider Layer                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │   NSE    │  │  Yahoo   │  │   CSV    │              │   │
│  │  │ WebSocket│  │ Finance  │  │ Importer │              │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘              │   │
│  └───────┼─────────────┼─────────────┼────────────────────┘   │
│          │             │             │                          │
│  ┌───────▼─────────────▼─────────────▼────────────────────┐   │
│  │           Data Normalization & Validation              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ Schema   │  │ Circuit  │  │  Data    │            │   │
│  │  │Converter │  │ Breaker  │  │ Quality  │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘            │   │
│  └───────┬──────────────────────────────────────────────┘   │
│          │                                                     │
│  ┌───────▼──────────────────────────────────────────────┐   │
│  │              Event Publishing Layer                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │  Kafka   │  │  Kafka   │  │  Kafka   │           │   │
│  │  │  Ticks   │  │ Candles  │  │ Indices  │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └───────┬──────────────────────────────────────────────┘   │
│          │                                                     │
│  ┌───────▼──────────────────────────────────────────────┐   │
│  │              Storage Layer                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │TimescaleDB│ │PostgreSQL│  │  Apache  │           │   │
│  │  │  (Ticks) │  │(Metadata)│  │   Hudi   │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```


### Component Architecture

```
engines/
└── src/main/java/com/moneyplant/engines/ingestion/
    ├── config/
    │   ├── IngestionConfig.java
    │   ├── KafkaProducerConfig.java
    │   ├── TimescaleDbConfig.java
    │   ├── WebSocketConfig.java
    │   └── DataProviderConfig.java
    ├── provider/
    │   ├── DataProvider.java (interface)
    │   ├── nse/
    │   │   ├── NseDataProvider.java
    │   │   ├── NseApiClient.java
    │   │   ├── NseEquityMasterParser.java
    │   │   └── NseOhlcvParser.java
    │   ├── yahoo/
    │   │   ├── YahooFinanceProvider.java
    │   │   ├── YahooApiClient.java
    │   │   └── YahooRateLimiter.java
    │   └── csv/
    │       ├── CsvImportProvider.java
    │       └── CsvParser.java
    ├── processor/
    │   ├── DataNormalizer.java
    │   ├── DataValidator.java
    │   ├── CandleAggregator.java
    │   ├── DataEnricher.java
    │   └── QualityChecker.java
    ├── publisher/
    │   ├── KafkaPublisher.java
    │   ├── AvroSerializer.java
    │   └── PartitionStrategy.java
    ├── storage/
    │   ├── TimescaleRepository.java
    │   ├── SymbolRepository.java
    │   ├── HudiWriter.java
    │   └── CompressionManager.java
    ├── service/
    │   ├── IngestionService.java
    │   ├── SymbolMasterIngestionService.java
    │   ├── SymbolUniverseService.java
    │   └── BackfillService.java
    ├── api/
    │   ├── IngestionController.java
    │   ├── MarketDataController.java
    │   └── WebSocketHandler.java
    ├── model/
    │   ├── TickData.java
    │   ├── OhlcvData.java
    │   ├── Symbol.java
    │   ├── SymbolUniverse.java
    │   └── DataQualityMetrics.java
    └── IngestionEngineApplication.java
```

## Components and Interfaces

### 1. Data Provider Layer

#### DataProvider Interface

```java
public interface DataProvider {
    Flux<TickData> connect(Set<String> symbols);
    Mono<Void> disconnect();
    Mono<List<OhlcvData>> fetchHistorical(String symbol, LocalDate start, LocalDate end, Timeframe timeframe);
    Mono<Boolean> isHealthy();
    ProviderType getType();
}
```

#### NSE WebSocket Provider

**Responsibilities**:
- Establish and maintain WebSocket connections to NSE data feeds
- Handle reconnection with exponential backoff
- Parse NSE-specific message formats
- Request missed data on reconnection

**Key Classes**:
- `NseWebSocketProvider`: Main provider implementation
- `NseConnectionManager`: Connection lifecycle management
- `NseMessageParser`: Parse NSE tick format to TickData

**Configuration**:
```yaml
ingestion:
  providers:
    nse:
      enabled: true
      websocket-url: wss://nse.example.com/feed
      reconnect-attempts: 5
      reconnect-backoff-ms: 1000
      heartbeat-interval-sec: 30
```


#### Yahoo Finance Provider

**Responsibilities**:
- Fetch historical OHLCV data via REST API
- Implement rate limiting (2000 req/hour)
- Handle API errors and retries
- Support multiple timeframes

**Key Classes**:
- `YahooFinanceProvider`: Main provider implementation
- `YahooApiClient`: REST client with WebClient
- `YahooRateLimiter`: Token bucket rate limiter

**Configuration**:
```yaml
ingestion:
  providers:
    yahoo:
      enabled: true
      api-url: https://query1.finance.yahoo.com
      rate-limit-per-hour: 2000
      timeout-sec: 10
      retry-attempts: 3
```

#### NSE Data Provider

**Responsibilities**:
- Fetch equity master data from NSE API
- Fetch historical OHLCV data from NSE
- Parse NSE-specific JSON/CSV formats
- Update nse_eq_master table with latest metadata

**Key Classes**:
- `NseDataProvider`: Main provider implementation
- `NseApiClient`: REST client for NSE APIs
- `NseEquityMasterParser`: Parse equity master JSON to NseEquityMaster entity
- `NseOhlcvParser`: Parse historical price data

**NSE API Endpoints**:
```
# Equity Master Data
https://www.nseindia.com/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O

# Historical Data
https://www.nseindia.com/api/historical/cm/equity?symbol={SYMBOL}&series=[EQ]&from={DD-MM-YYYY}&to={DD-MM-YYYY}

# Quote Data
https://www.nseindia.com/api/quote-equity?symbol={SYMBOL}
```

**Configuration**:
```yaml
ingestion:
  providers:
    nse:
      enabled: true
      api-url: https://www.nseindia.com/api
      rate-limit-per-hour: 1000
      timeout-sec: 15
      retry-attempts: 3
      headers:
        User-Agent: "Mozilla/5.0"
        Accept: "application/json"
```

#### CSV Import Provider

**Responsibilities**:
- Parse CSV files with OHLCV data
- Validate data format and completeness
- Support batch imports
- Generate import reports

**Supported CSV Format**:
```csv
symbol,timestamp,open,high,low,close,volume
RELIANCE,2024-01-01T09:15:00,2450.50,2455.00,2448.00,2452.75,1250000
```

### 2. Data Processing Layer

#### DataNormalizer

**Responsibilities**:
- Convert provider-specific formats to standard TickData/OhlcvData
- Handle timezone conversions (IST for NSE)
- Normalize symbol names across providers
- Add metadata fields

**Normalization Flow**:
```
Raw Data → Schema Mapping → Timezone Conversion → Symbol Mapping → TickData
```

#### DataValidator

**Responsibilities**:
- Validate price within circuit breaker limits (±20% from previous close)
- Ensure monotonically increasing timestamps per symbol
- Flag negative or unrealistic volumes
- Check for required fields

**Validation Rules**:
```java
public class DataValidator {
    boolean validatePrice(BigDecimal price, BigDecimal previousClose);
    boolean validateTimestamp(Instant current, Instant previous);
    boolean validateVolume(long volume);
    boolean validateCompleteness(TickData data);
}
```

#### CandleAggregator

**Responsibilities**:
- Aggregate tick data into OHLCV candles
- Support multiple timeframes (1min, 5min, 15min, 1hour, 1day)
- Handle market close and session boundaries
- Publish completed candles to Kafka

**Aggregation Strategy**:
- Use sliding window for real-time aggregation
- Flush candles on timeframe boundary
- Handle late-arriving ticks (within 5-second grace period)


#### DataEnricher

**Responsibilities**:
- Calculate derived fields (bid-ask spread, VWAP)
- Add symbol metadata (sector, market cap)
- Compute data quality scores
- Enrich with corporate action adjustments

#### QualityChecker

**Responsibilities**:
- Track data completeness (% of expected ticks received)
- Measure data freshness (latency from exchange timestamp)
- Calculate accuracy scores
- Publish quality alerts to Kafka

**Quality Metrics**:
```java
public class DataQualityMetrics {
    private String symbol;
    private Instant timestamp;
    private double completenessScore;  // 0.0 to 1.0
    private double accuracyScore;      // 0.0 to 1.0
    private long freshnessMs;          // latency in milliseconds
    private int anomalyCount;
}
```

### 3. Event Publishing Layer

#### KafkaPublisher

**Responsibilities**:
- Publish normalized data to Kafka topics
- Handle backpressure with buffering
- Implement circuit breaker for Kafka failures
- Track publishing metrics

**Kafka Topics**:
```yaml
market-data-ticks:
  partitions: 32
  replication-factor: 3
  retention-ms: 86400000  # 1 day
  
market-data-candles:
  partitions: 16
  replication-factor: 3
  retention-ms: 2592000000  # 30 days
  
market-data-indices:
  partitions: 4
  replication-factor: 3
  retention-ms: 2592000000  # 30 days
  
data-quality-alerts:
  partitions: 4
  replication-factor: 3
  retention-ms: 604800000  # 7 days
  
symbol-universe-updates:
  partitions: 1
  replication-factor: 3
  retention-ms: -1  # infinite
```

#### AvroSerializer

**Responsibilities**:
- Serialize TickData/OhlcvData to Avro binary format
- Register schemas with Schema Registry
- Handle schema evolution
- Optimize for size and performance

**Avro Schema Example**:
```json
{
  "type": "record",
  "name": "TickData",
  "namespace": "com.moneyplant.engines.ingestion.model",
  "fields": [
    {"name": "symbol", "type": "string"},
    {"name": "timestamp", "type": "long", "logicalType": "timestamp-millis"},
    {"name": "price", "type": "string"},
    {"name": "volume", "type": "long"},
    {"name": "bid", "type": ["null", "string"], "default": null},
    {"name": "ask", "type": ["null", "string"], "default": null},
    {"name": "metadata", "type": ["null", "string"], "default": null}
  ]
}
```


#### PartitionStrategy

**Responsibilities**:
- Determine Kafka partition for each message
- Ensure ordered processing per symbol
- Balance load across partitions

**Strategy**:
```java
public class PartitionStrategy {
    public int getPartition(String symbol, int numPartitions) {
        return Math.abs(symbol.hashCode()) % numPartitions;
    }
}
```

### 4. Storage Layer

#### TimescaleRepository

**Responsibilities**:
- Write tick and OHLCV data to TimescaleDB hypertables
- Implement batch inserts using COPY protocol
- Configure compression and retention policies
- Query historical data efficiently
- Convert existing `nse_eq_ohlcv_historic` table to TimescaleDB hypertable

**Database Setup Notes**:
- TimescaleDB extension is already installed on the PostgreSQL database
- Existing table `nse_eq_ohlcv_historic` needs to be converted to a hypertable
- Migration will be done with `migrate_data => TRUE` to preserve existing data
- New `nse_eq_ticks` table will be created as a hypertable for intraday data

**Hypertable Schema**:
```sql
-- Note: TimescaleDB extension is already installed on the database

-- Intraday tick data table (current day only)
CREATE TABLE IF NOT EXISTS nse_eq_ticks (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    price NUMERIC(18,4) NOT NULL,
    volume BIGINT NOT NULL,
    bid NUMERIC(18,4),
    ask NUMERIC(18,4),
    metadata JSONB
);

-- Create hypertable for efficient time-series operations
SELECT create_hypertable('nse_eq_ticks', 'time', 
    chunk_time_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_ticks_symbol_time ON nse_eq_ticks (symbol, time DESC);

-- Note: No compression or retention policies needed as table is truncated daily
-- Historical data is archived to Apache Hudi at end of day

-- Convert existing nse_eq_ohlcv_historic table to TimescaleDB hypertable
-- First check if table exists and is not already a hypertable
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'nse_eq_ohlcv_historic') THEN
        -- Check if it's already a hypertable
        IF NOT EXISTS (
            SELECT 1 FROM timescaledb_information.hypertables 
            WHERE hypertable_name = 'nse_eq_ohlcv_historic'
        ) THEN
            -- Convert to hypertable
            PERFORM create_hypertable('nse_eq_ohlcv_historic', 'time',
                chunk_time_interval => INTERVAL '1 day',
                migrate_data => TRUE);
        END IF;
    ELSE
        -- Create new table if it doesn't exist
        CREATE TABLE nse_eq_ohlcv_historic (
            time TIMESTAMPTZ NOT NULL,
            symbol VARCHAR(20) NOT NULL,
            timeframe VARCHAR(10) NOT NULL,
            open NUMERIC(18,4) NOT NULL,
            high NUMERIC(18,4) NOT NULL,
            low NUMERIC(18,4) NOT NULL,
            close NUMERIC(18,4) NOT NULL,
            volume BIGINT NOT NULL
        );
        
        PERFORM create_hypertable('nse_eq_ohlcv_historic', 'time',
            chunk_time_interval => INTERVAL '1 day');
    END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_timeframe_time 
    ON nse_eq_ohlcv_historic (symbol, timeframe, time DESC);

-- Enable compression for older data (optional, for cost savings)
ALTER TABLE nse_eq_ohlcv_historic SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'symbol,timeframe',
    timescaledb.compress_orderby = 'time DESC'
);

-- Add compression policy for data older than 30 days
SELECT add_compression_policy('nse_eq_ohlcv_historic', INTERVAL '30 days');

-- Continuous aggregate for daily candles (optional, for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_candles
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS day,
    symbol,
    first(open, time) AS open,
    max(high) AS high,
    min(low) AS low,
    last(close, time) AS close,
    sum(volume) AS volume
FROM nse_eq_ohlcv_historic
WHERE timeframe = '1min'
GROUP BY day, symbol;

SELECT add_continuous_aggregate_policy('daily_candles',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');
```


#### NseEquityMasterRepository

**Responsibilities**:
- Query symbol metadata from `nse_eq_master` table
- Update symbol master data from NSE API
- Filter symbols by sector, industry, trading status
- Support symbol universe queries (NSE 500, Nifty 50, etc.)
- Upsert operations for daily symbol master refresh

**Existing Schema** (already in database):
```sql
-- Table: public.nse_eq_master
-- This table is already populated by Python ingestion routines
-- Contains comprehensive NSE equity master data

CREATE TABLE public.nse_eq_master (
    symbol VARCHAR(100) PRIMARY KEY,
    company_name VARCHAR(500),
    industry VARCHAR(200),
    sector VARCHAR(200),
    basic_industry VARCHAR(200),
    isin VARCHAR(100),
    series VARCHAR(100),
    
    -- Trading status fields
    is_fno_sec VARCHAR(100),
    is_suspended VARCHAR(100),
    is_delisted VARCHAR(100),
    trading_status VARCHAR(200),
    trading_segment VARCHAR(200),
    
    -- Price and market data
    last_price FLOAT4,
    previous_close FLOAT4,
    open FLOAT4,
    close FLOAT4,
    vwap FLOAT4,
    total_traded_volume FLOAT4,
    
    -- PE ratios
    pd_sector_pe FLOAT4,
    pd_symbol_pe FLOAT4,
    pd_sector_ind VARCHAR(200),
    
    -- Other metadata
    face_value FLOAT4,
    issued_size VARCHAR(200),
    listing_date VARCHAR(100),
    last_update_time VARCHAR(200),
    
    -- ... (70+ additional fields)
);

-- Note: Symbol universe management can be done via queries on this table
-- Example: Nifty 50 = SELECT symbol FROM nse_eq_master WHERE pd_sector_ind = 'NIFTY 50'
-- Example: FNO stocks = SELECT symbol FROM nse_eq_master WHERE is_fno_sec = 'Yes'
```

**Java Entity** (already exists):
```java
// Use existing: com.moneyplant.core.entities.NseEquityMaster
// Located at: backend/src/main/java/com/moneyplant/core/entities/NseEquityMaster.java
```

#### SymbolMasterIngestionService

**Responsibilities**:
- Orchestrate symbol master data ingestion from NSE
- Schedule daily refresh of equity master data
- Parse and transform NSE API response to NseEquityMaster entities
- Batch update nse_eq_master table

**Implementation**:
```java
@Service
@Slf4j
public class SymbolMasterIngestionService {
    
    @Autowired
    private NseDataProvider nseDataProvider;
    
    @Autowired
    private NseEquityMasterRepository repository;
    
    @Scheduled(cron = "0 0 6 * * *")  // 6:00 AM daily
    public void refreshSymbolMaster() {
        log.info("Starting symbol master refresh");
        
        nseDataProvider.fetchEquityMasterData()
            .flatMapMany(Flux::fromIterable)
            .buffer(100)
            .flatMap(repository::batchUpsert)
            .doOnComplete(() -> log.info("Symbol master refresh completed"))
            .subscribe();
    }
    
    public Mono<Integer> ingestSymbolMaster() {
        return nseDataProvider.fetchEquityMasterData()
            .flatMapMany(Flux::fromIterable)
            .collectList()
            .flatMap(symbols -> {
                log.info("Fetched {} symbols from NSE", symbols.size());
                return repository.batchUpsert(symbols);
            });
    }
}
```

#### HudiWriter

**Responsibilities**:
- Archive end-of-day tick data to Apache Hudi tables in data lake
- Implement batch writes for daily data
- Partition by date and symbol
- Register tables in Hive Metastore
- Verify data integrity after archival

**Hudi Configuration**:
```java
@Configuration
public class HudiConfig {
    @Bean
    public HudiWriteConfig hudiWriteConfig() {
        return HudiWriteConfig.newBuilder()
            .withPath("s3://moneyplant-datalake/nse-eq-ticks")
            .withSchema(AVRO_SCHEMA)
            .withTableName("nse_eq_ticks_historical")
            .withTableType(HoodieTableType.COPY_ON_WRITE)
            .withPartitionFields("date")
            .withRecordKeyField("symbol,timestamp")
            .withPreCombineField("timestamp")
            .withCompactionConfig(HoodieCompactionConfig.newBuilder()
                .withInlineCompaction(false)
                .withMaxNumDeltaCommitsBeforeCompaction(10)
                .build())
            .build();
    }
}
```

#### EndOfDayArchivalService

**Responsibilities**:
- Trigger end-of-day archival process
- Export tick data from TimescaleDB to Hudi
- Verify data integrity
- Truncate intraday table after successful archival

**Implementation**:
```java
@Service
@Slf4j
public class EndOfDayArchivalService {
    
    @Autowired
    private TimescaleRepository timescaleRepository;
    
    @Autowired
    private HudiWriter hudiWriter;
    
    @Scheduled(cron = "0 30 15 * * MON-FRI")  // 3:30 PM IST daily
    public void archiveDailyData() {
        LocalDate today = LocalDate.now();
        log.info("Starting end-of-day archival for date: {}", today);
        
        archiveTickData(today)
            .doOnSuccess(result -> log.info("Archival completed: {}", result))
            .doOnError(error -> log.error("Archival failed", error))
            .subscribe();
    }
    
    public Mono<ArchivalResult> archiveTickData(LocalDate date) {
        return timescaleRepository.getTickDataForDate(date)
            .collectList()
            .flatMap(ticks -> {
                long sourceCount = ticks.size();
                log.info("Exporting {} ticks to Hudi for date: {}", sourceCount, date);
                
                return hudiWriter.writeBatch(ticks, date)
                    .flatMap(hudiCount -> verifyArchival(date, sourceCount, hudiCount))
                    .flatMap(verified -> {
                        if (verified) {
                            return truncateIntraday Table()
                                .thenReturn(new ArchivalResult(date, sourceCount, true));
                        } else {
                            return Mono.error(new ArchivalException(
                                "Data integrity check failed for date: " + date));
                        }
                    });
            });
    }
    
    private Mono<Boolean> verifyArchival(LocalDate date, long sourceCount, long destCount) {
        if (sourceCount != destCount) {
            log.error("Count mismatch: source={}, dest={}", sourceCount, destCount);
            return Mono.just(false);
        }
        
        // Additional integrity checks can be added here
        return Mono.just(true);
    }
    
    private Mono<Void> truncateIntradayTable() {
        return timescaleRepository.truncateTickTable()
            .doOnSuccess(v -> log.info("Truncated nse_eq_ticks table"))
            .then();
    }
}
```

### 5. Service Layer

#### IngestionService

**Responsibilities**:
- Orchestrate data flow from providers to storage
- Manage provider lifecycle
- Handle errors and retries
- Coordinate backfill operations

**Core Flow**:
```java
@Service
public class IngestionService {
    
    public Flux<TickData> startRealTimeIngestion(Set<String> symbols) {
        return dataProvider.connect(symbols)
            .transform(dataValidator::validate)
            .transform(dataNormalizer::normalize)
            .transform(dataEnricher::enrich)
            .doOnNext(kafkaPublisher::publish)
            .doOnNext(timescaleRepository::save)
            .doOnError(this::handleError)
            .retry(3);
    }
    
    public Mono<BackfillResult> backfillHistoricalData(
            String symbol, LocalDate start, LocalDate end) {
        return dataProvider.fetchHistorical(symbol, start, end, Timeframe.DAILY)
            .flatMapMany(Flux::fromIterable)
            .transform(dataValidator::validate)
            .transform(dataNormalizer::normalize)
            .buffer(1000)
            .flatMap(timescaleRepository::batchInsert)
            .then(Mono.just(new BackfillResult(symbol, start, end)));
    }
}
```


#### SymbolUniverseService

**Responsibilities**:
- Load and manage symbol universes
- Support dynamic subscription changes
- Publish universe update events
- Apply filters (sector, market cap, liquidity)

**API**:
```java
@Service
public class SymbolUniverseService {
    
    public Mono<SymbolUniverse> getUniverse(String name);
    public Mono<SymbolUniverse> createUniverse(SymbolUniverse universe);
    public Mono<Void> addSymbols(String universeName, Set<String> symbols);
    public Mono<Void> removeSymbols(String universeName, Set<String> symbols);
    public Flux<String> getSymbolsByFilter(UniverseFilter filter);
}
```

#### BackfillService

**Responsibilities**:
- Identify data gaps in TimescaleDB
- Schedule backfill jobs
- Track backfill progress
- Generate completion reports

**Gap Detection**:
```java
public class BackfillService {
    
    public Flux<DataGap> detectGaps(String symbol, LocalDate start, LocalDate end) {
        return timescaleRepository.findMissingDates(symbol, start, end)
            .map(date -> new DataGap(symbol, date));
    }
    
    public Mono<BackfillReport> fillGaps(List<DataGap> gaps) {
        return Flux.fromIterable(gaps)
            .flatMap(gap -> ingestionService.backfillHistoricalData(
                gap.symbol(), gap.date(), gap.date()))
            .collectList()
            .map(BackfillReport::new);
    }
}
```

#### HealthMonitorService

**Responsibilities**:
- Monitor provider health
- Track data freshness
- Detect anomalies
- Trigger alerts

**Health Checks**:
```java
@Component
public class HealthMonitorService {
    
    @Scheduled(fixedRate = 30000)  // Every 30 seconds
    public void checkProviderHealth() {
        dataProviders.forEach(provider -> {
            provider.isHealthy()
                .subscribe(healthy -> {
                    if (!healthy) {
                        alertService.sendAlert(
                            "Provider unhealthy: " + provider.getType());
                    }
                });
        });
    }
    
    @Scheduled(fixedRate = 60000)  // Every minute
    public void checkDataFreshness() {
        timescaleRepository.getLatestTimestamps()
            .filter(ts -> Duration.between(ts, Instant.now()).toMinutes() > 5)
            .subscribe(ts -> alertService.sendAlert("Stale data detected"));
    }
}
```

### 6. API Layer

#### IngestionController

**Responsibilities**:
- Expose REST endpoints for ingestion control
- Start/stop data providers
- Trigger backfill operations
- Query ingestion status

**Endpoints**:
```java
@RestController
@RequestMapping("/api/v1/ingestion")
public class IngestionController {
    
    @PostMapping("/start")
    public Mono<ResponseEntity<String>> startIngestion(
            @RequestBody Set<String> symbols);
    
    @PostMapping("/stop")
    public Mono<ResponseEntity<String>> stopIngestion();
    
    @PostMapping("/backfill")
    public Mono<ResponseEntity<BackfillReport>> triggerBackfill(
            @RequestBody BackfillRequest request);
    
    @GetMapping("/status")
    public Mono<ResponseEntity<IngestionStatus>> getStatus();
}
```


#### MarketDataController

**Responsibilities**:
- Expose REST endpoints for market data queries
- Support pagination and filtering
- Implement caching with Redis
- Rate limiting per user

**Endpoints**:
```java
@RestController
@RequestMapping("/api/v1/market-data")
public class MarketDataController {
    
    @GetMapping("/quote/{symbol}")
    @Cacheable(value = "quotes", key = "#symbol", unless = "#result == null")
    public Mono<ResponseEntity<TickData>> getLatestQuote(
            @PathVariable String symbol);
    
    @GetMapping("/ohlcv/{symbol}")
    public Mono<ResponseEntity<Page<OhlcvData>>> getHistoricalData(
            @PathVariable String symbol,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end,
            @RequestParam Timeframe timeframe,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size);
    
    @GetMapping("/symbols/search")
    public Flux<Symbol> searchSymbols(
            @RequestParam String query,
            @RequestParam(required = false) String sector);
}
```

#### WebSocketHandler

**Responsibilities**:
- Handle client WebSocket connections
- Manage subscriptions to real-time ticks
- Push updates to connected clients
- Handle disconnections gracefully

**Implementation**:
```java
@Component
public class MarketDataWebSocketHandler implements WebSocketHandler {
    
    private final Map<String, Set<WebSocketSession>> subscriptions = 
        new ConcurrentHashMap<>();
    
    @Override
    public Mono<Void> handle(WebSocketSession session) {
        return session.receive()
            .map(WebSocketMessage::getPayloadAsText)
            .flatMap(message -> handleSubscription(session, message))
            .then();
    }
    
    private Mono<Void> handleSubscription(WebSocketSession session, String message) {
        SubscriptionRequest request = parseRequest(message);
        
        if (request.action() == Action.SUBSCRIBE) {
            subscriptions.computeIfAbsent(request.symbol(), k -> new HashSet<>())
                .add(session);
        } else if (request.action() == Action.UNSUBSCRIBE) {
            subscriptions.getOrDefault(request.symbol(), Set.of())
                .remove(session);
        }
        
        return Mono.empty();
    }
    
    public void broadcastTick(TickData tick) {
        Set<WebSocketSession> sessions = subscriptions.get(tick.symbol());
        if (sessions != null) {
            String message = serializeTick(tick);
            sessions.forEach(session -> 
                session.send(Mono.just(session.textMessage(message)))
                    .subscribe());
        }
    }
}
```

## Data Models

### TickData

```java
@Data
@Builder
public class TickData {
    private String symbol;
    private Instant timestamp;
    private BigDecimal price;
    private long volume;
    private BigDecimal bid;
    private BigDecimal ask;
    private Map<String, Object> metadata;
    
    // Derived fields
    private BigDecimal bidAskSpread;
    private BigDecimal vwap;
}
```

### OhlcvData

```java
@Data
@Builder
public class OhlcvData {
    private String symbol;
    private Instant timestamp;
    private Timeframe timeframe;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal close;
    private long volume;
    private int tradeCount;
}
```


### NseEquityMaster (Existing Entity)

```java
// Use existing entity: com.moneyplant.core.entities.NseEquityMaster
// This entity is already defined and maps to nse_eq_master table
// Key fields for ingestion engine:

@Entity
@Table(name = "nse_eq_master", schema = "public")
public class NseEquityMaster {
    @Id
    private String symbol;
    
    private String companyName;
    private String industry;
    private String sector;
    private String basicIndustry;
    private String isin;
    private String series;
    
    // Trading status
    private String isFnoSec;
    private String isSuspended;
    private String isDelisted;
    private String tradingStatus;
    
    // Price data
    private Float lastPrice;
    private Float previousClose;
    private Float vwap;
    
    // PE ratios
    private Float pdSectorPe;
    private Float pdSymbolPe;
    private String pdSectorInd;  // Can be used for universe filtering
    
    // ... (70+ additional fields)
}
```

### SymbolUniverse (Query-based, no separate table needed)

```java
// Symbol universes are derived from nse_eq_master queries
// No separate table needed - use filters on nse_eq_master

public enum SymbolUniverse {
    NSE_500("SELECT symbol FROM nse_eq_master WHERE trading_status = 'Active' LIMIT 500"),
    NIFTY_50("SELECT symbol FROM nse_eq_master WHERE pd_sector_ind = 'NIFTY 50'"),
    NIFTY_BANK("SELECT symbol FROM nse_eq_master WHERE pd_sector_ind = 'NIFTY BANK'"),
    FNO_STOCKS("SELECT symbol FROM nse_eq_master WHERE is_fno_sec = 'Yes'"),
    ALL_ACTIVE("SELECT symbol FROM nse_eq_master WHERE trading_status = 'Active' AND is_delisted != 'Yes'");
    
    private final String query;
    
    SymbolUniverse(String query) {
        this.query = query;
    }
    
    public String getQuery() {
        return query;
    }
}
```

### DataQualityMetrics

```java
@Data
@Builder
public class DataQualityMetrics {
    private String symbol;
    private Instant timestamp;
    private double completenessScore;  // 0.0 to 1.0
    private double accuracyScore;      // 0.0 to 1.0
    private long freshnessMs;          // latency in milliseconds
    private int anomalyCount;
    private List<String> anomalyTypes;
}
```

## Error Handling

### Circuit Breaker Pattern

```java
@Configuration
public class CircuitBreakerConfig {
    
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .waitDurationInOpenState(Duration.ofSeconds(10))
            .slidingWindowSize(10)
            .build();
            
        return CircuitBreakerRegistry.of(config);
    }
}
```

### Retry Strategy

```java
public class RetryConfig {
    
    public static final Retry PROVIDER_RETRY = Retry.of("provider", 
        RetryConfig.custom()
            .maxAttempts(3)
            .waitDuration(Duration.ofSeconds(1))
            .retryExceptions(IOException.class, TimeoutException.class)
            .build());
    
    public static final Retry KAFKA_RETRY = Retry.of("kafka",
        RetryConfig.custom()
            .maxAttempts(5)
            .waitDuration(Duration.ofMillis(100))
            .exponentialBackoffMultiplier(2)
            .build());
}
```

### Error Recovery

```java
@Service
public class ErrorRecoveryService {
    
    public Mono<TickData> handleProviderError(Throwable error, String symbol) {
        log.error("Provider error for symbol {}: {}", symbol, error.getMessage());
        
        // Try fallback provider
        return fallbackProvider.fetchLatestTick(symbol)
            .onErrorResume(e -> {
                // Publish error event
                kafkaPublisher.publishError(new DataError(symbol, error));
                return Mono.empty();
            });
    }
    
    public Mono<Void> handleKafkaError(Throwable error, TickData data) {
        log.error("Kafka publish error: {}", error.getMessage());
        
        // Store in dead letter queue
        return deadLetterRepository.save(data)
            .then(Mono.defer(() -> {
                // Trigger alert
                alertService.sendAlert("Kafka publish failed");
                return Mono.empty();
            }));
    }
}
```


## Testing Strategy

### Unit Testing

```java
@ExtendWith(MockitoExtension.class)
class DataNormalizerTest {
    
    @Mock
    private SymbolMappingService symbolMappingService;
    
    @InjectMocks
    private DataNormalizer dataNormalizer;
    
    @Test
    void shouldNormalizeNseTickData() {
        // Given
        NseTickMessage nseMessage = createNseTickMessage();
        when(symbolMappingService.mapSymbol("NSE", "RELIANCE"))
            .thenReturn("RELIANCE");
        
        // When
        TickData result = dataNormalizer.normalize(nseMessage);
        
        // Then
        assertThat(result.getSymbol()).isEqualTo("RELIANCE");
        assertThat(result.getPrice()).isEqualTo(new BigDecimal("2450.50"));
        assertThat(result.getTimestamp()).isNotNull();
    }
}
```

### Integration Testing

```java
@SpringBootTest
@Testcontainers
class IngestionServiceIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("timescale/timescaledb:latest-pg15");
    
    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));
    
    @Autowired
    private IngestionService ingestionService;
    
    @Autowired
    private TimescaleRepository timescaleRepository;
    
    @Test
    void shouldIngestAndStoreTickData() {
        // Given
        Set<String> symbols = Set.of("RELIANCE", "TCS");
        
        // When
        StepVerifier.create(ingestionService.startRealTimeIngestion(symbols)
                .take(10))
            .expectNextCount(10)
            .verifyComplete();
        
        // Then
        List<TickData> stored = timescaleRepository.findBySymbol("RELIANCE", 
            Instant.now().minus(1, ChronoUnit.HOURS), Instant.now());
        assertThat(stored).isNotEmpty();
    }
}
```

### Performance Testing

```java
@State(Scope.Benchmark)
public class IngestionBenchmark {
    
    private IngestionService ingestionService;
    private List<TickData> testData;
    
    @Setup
    public void setup() {
        // Initialize test data
        testData = generateTickData(10000);
    }
    
    @Benchmark
    @BenchmarkMode(Mode.Throughput)
    @OutputTimeUnit(TimeUnit.SECONDS)
    public void benchmarkTickProcessing() {
        Flux.fromIterable(testData)
            .transform(ingestionService::processTickData)
            .blockLast();
    }
    
    @Benchmark
    @BenchmarkMode(Mode.AverageTime)
    @OutputTimeUnit(TimeUnit.MILLISECONDS)
    public void benchmarkLatency() {
        TickData tick = testData.get(0);
        ingestionService.processTickData(Flux.just(tick))
            .blockLast();
    }
}
```

## Performance Optimization

### Virtual Threads for Parallel Fetching

```java
@Configuration
public class VirtualThreadConfig {
    
    @Bean
    public Executor virtualThreadExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}

@Service
public class ParallelFetchService {
    
    @Autowired
    @Qualifier("virtualThreadExecutor")
    private Executor executor;
    
    public Flux<OhlcvData> fetchHistoricalDataParallel(List<String> symbols) {
        return Flux.fromIterable(symbols)
            .flatMap(symbol -> 
                Mono.fromCallable(() -> 
                    dataProvider.fetchHistorical(symbol, start, end, timeframe))
                    .subscribeOn(Schedulers.fromExecutor(executor))
            );
    }
}
```


### Memory-Mapped Files for Historical Data

```java
@Service
public class MappedFileDataLoader {
    
    public Flux<OhlcvData> loadFromMappedFile(Path filePath) throws IOException {
        try (FileChannel channel = FileChannel.open(filePath, StandardOpenOption.READ)) {
            MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_ONLY, 0, channel.size());
            
            return Flux.create(sink -> {
                while (buffer.hasRemaining()) {
                    OhlcvData data = deserialize(buffer);
                    sink.next(data);
                }
                sink.complete();
            });
        }
    }
}
```

### Batch Processing for TimescaleDB

```java
@Repository
public class TimescaleRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public Mono<Integer> batchInsert(List<TickData> ticks) {
        return Mono.fromCallable(() -> {
            String sql = "INSERT INTO nse_eq_ticks (time, symbol, price, volume, bid, ask, metadata) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?::jsonb)";
            
            return jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    TickData tick = ticks.get(i);
                    ps.setTimestamp(1, Timestamp.from(tick.getTimestamp()));
                    ps.setString(2, tick.getSymbol());
                    ps.setBigDecimal(3, tick.getPrice());
                    ps.setLong(4, tick.getVolume());
                    ps.setBigDecimal(5, tick.getBid());
                    ps.setBigDecimal(6, tick.getAsk());
                    ps.setString(7, objectMapper.writeValueAsString(tick.getMetadata()));
                }
                
                @Override
                public int getBatchSize() {
                    return ticks.size();
                }
            }).length;
        });
    }
    
    // Use COPY for even faster bulk inserts
    public Mono<Long> copyInsert(List<TickData> ticks) {
        return Mono.fromCallable(() -> {
            PGConnection pgConnection = jdbcTemplate.getDataSource()
                .getConnection()
                .unwrap(PGConnection.class);
            
            CopyManager copyManager = pgConnection.getCopyAPI();
            
            String sql = "COPY nse_eq_ticks (time, symbol, price, volume, bid, ask, metadata) " +
                        "FROM STDIN WITH (FORMAT CSV)";
            
            try (StringReader reader = new StringReader(toCsv(ticks))) {
                return copyManager.copyIn(sql, reader);
            }
        });
    }
}
```

### Reactive Backpressure Handling

```java
@Service
public class BackpressureHandler {
    
    public Flux<TickData> handleBackpressure(Flux<TickData> source) {
        return source
            .onBackpressureBuffer(100000,  // Buffer size
                dropped -> log.warn("Dropped tick: {}", dropped),
                BufferOverflowStrategy.DROP_OLDEST)
            .publishOn(Schedulers.boundedElastic(), 1000);  // Prefetch
    }
}
```

## Monitoring and Observability

### Prometheus Metrics

```java
@Configuration
public class MetricsConfig {
    
    @Bean
    public MeterRegistry meterRegistry() {
        return new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
    }
    
    @Bean
    public Counter ticksProcessedCounter(MeterRegistry registry) {
        return Counter.builder("ingestion.ticks.processed")
            .description("Total number of ticks processed")
            .tag("engine", "ingestion")
            .register(registry);
    }
    
    @Bean
    public Timer processingLatencyTimer(MeterRegistry registry) {
        return Timer.builder("ingestion.processing.latency")
            .description("Tick processing latency")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
    }
    
    @Bean
    public Gauge activeConnectionsGauge(MeterRegistry registry, 
                                        ConnectionManager connectionManager) {
        return Gauge.builder("ingestion.connections.active", 
                connectionManager, ConnectionManager::getActiveConnections)
            .description("Number of active WebSocket connections")
            .register(registry);
    }
}
```


### Structured Logging

```java
@Slf4j
@Service
public class IngestionService {
    
    public Flux<TickData> processTickData(Flux<TickData> source) {
        return source
            .doOnNext(tick -> {
                MDC.put("symbol", tick.getSymbol());
                MDC.put("correlationId", UUID.randomUUID().toString());
                log.info("Processing tick: symbol={}, price={}, timestamp={}", 
                    tick.getSymbol(), tick.getPrice(), tick.getTimestamp());
            })
            .doOnError(error -> {
                log.error("Error processing tick", error);
            })
            .doFinally(signal -> {
                MDC.clear();
            });
    }
}
```

### Distributed Tracing

```java
@Configuration
public class TracingConfig {
    
    @Bean
    public Tracer tracer() {
        return OpenTelemetry.getGlobalTracer("ingestion-engine");
    }
}

@Service
public class TracedIngestionService {
    
    @Autowired
    private Tracer tracer;
    
    public Mono<Void> processWithTracing(TickData tick) {
        Span span = tracer.spanBuilder("process-tick")
            .setAttribute("symbol", tick.getSymbol())
            .startSpan();
        
        try (Scope scope = span.makeCurrent()) {
            return processTickData(Mono.just(tick))
                .doOnSuccess(v -> span.setStatus(StatusCode.OK))
                .doOnError(e -> {
                    span.setStatus(StatusCode.ERROR, e.getMessage());
                    span.recordException(e);
                })
                .doFinally(signal -> span.end())
                .then();
        }
    }
}
```

### Health Indicators

```java
@Component
public class IngestionHealthIndicator implements HealthIndicator {
    
    @Autowired
    private List<DataProvider> dataProviders;
    
    @Autowired
    private KafkaTemplate<String, TickData> kafkaTemplate;
    
    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        
        // Check provider health
        boolean allProvidersHealthy = dataProviders.stream()
            .allMatch(provider -> provider.isHealthy().block());
        
        if (!allProvidersHealthy) {
            return builder.down()
                .withDetail("providers", "One or more providers unhealthy")
                .build();
        }
        
        // Check Kafka connectivity
        try {
            kafkaTemplate.send("health-check", new TickData()).get(5, TimeUnit.SECONDS);
        } catch (Exception e) {
            return builder.down()
                .withDetail("kafka", "Kafka unavailable")
                .withException(e)
                .build();
        }
        
        return builder.up()
            .withDetail("providers", dataProviders.size())
            .withDetail("kafka", "connected")
            .build();
    }
}
```

## Deployment

### Docker Configuration

```dockerfile
# Multi-stage build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/ingestion-engine.jar app.jar

# JVM optimization flags
ENV JAVA_OPTS="-XX:+UseZGC \
               -XX:+UseStringDeduplication \
               -XX:MaxRAMPercentage=75.0 \
               -XX:InitialRAMPercentage=50.0 \
               -Xlog:gc*:file=/var/log/gc.log:time,uptime:filecount=5,filesize=10M"

EXPOSE 8080 8081

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```


### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingestion-engine
  namespace: moneyplant
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ingestion-engine
  template:
    metadata:
      labels:
        app: ingestion-engine
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8081"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      containers:
      - name: ingestion-engine
        image: moneyplant/ingestion-engine:latest
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 8081
          name: management
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka-cluster:9092"
        - name: TIMESCALEDB_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: timescaledb-url
        - name: TIMESCALEDB_USERNAME
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: username
        - name: TIMESCALEDB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: password
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8081
          initialDelaySeconds: 60
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: ingestion-engine
  namespace: moneyplant
spec:
  selector:
    app: ingestion-engine
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: management
    port: 8081
    targetPort: 8081
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ingestion-engine-hpa
  namespace: moneyplant
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ingestion-engine
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Helm Chart Values

```yaml
# values.yaml
replicaCount: 3

image:
  repository: moneyplant/ingestion-engine
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  managementPort: 8081

ingestion:
  providers:
    nse:
      enabled: true
      websocketUrl: wss://nse.example.com/feed
      reconnectAttempts: 5
    yahoo:
      enabled: true
      apiUrl: https://query1.finance.yahoo.com
      rateLimitPerHour: 2000

kafka:
  bootstrapServers: kafka-cluster:9092
  topics:
    ticks:
      name: market-data-ticks
      partitions: 32
      replicationFactor: 3
    candles:
      name: market-data-candles
      partitions: 16
      replicationFactor: 3

timescaledb:
  host: timescaledb-service
  port: 5432
  database: moneyplant
  compression:
    enabled: true
    afterDays: 7
  retention:
    tickDataDays: 90

redis:
  host: redis-service
  port: 6379
  ttlSeconds: 5

resources:
  requests:
    memory: 2Gi
    cpu: 1000m
  limits:
    memory: 4Gi
    cpu: 2000m

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

monitoring:
  prometheus:
    enabled: true
    port: 8081
    path: /actuator/prometheus
  grafana:
    dashboardEnabled: true
```


## Configuration Management

### Application Configuration

```yaml
# application.yml
spring:
  application:
    name: ingestion-engine
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: io.confluent.kafka.serializers.KafkaAvroSerializer
      acks: all
      retries: 3
      compression-type: snappy
      batch-size: 16384
      linger-ms: 10
      buffer-memory: 33554432
    properties:
      schema.registry.url: ${SCHEMA_REGISTRY_URL:http://localhost:8081}
  
  datasource:
    url: ${TIMESCALEDB_URL:jdbc:postgresql://localhost:5432/moneyplant}
    username: ${TIMESCALEDB_USERNAME:postgres}
    password: ${TIMESCALEDB_PASSWORD:postgres}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 2

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true
  tracing:
    sampling:
      probability: 0.1

ingestion:
  providers:
    nse:
      enabled: ${NSE_ENABLED:true}
      websocket-url: ${NSE_WEBSOCKET_URL:wss://nse.example.com/feed}
      reconnect-attempts: 5
      reconnect-backoff-ms: 1000
      heartbeat-interval-sec: 30
    yahoo:
      enabled: ${YAHOO_ENABLED:true}
      api-url: ${YAHOO_API_URL:https://query1.finance.yahoo.com}
      rate-limit-per-hour: 2000
      timeout-sec: 10
      retry-attempts: 3
    csv:
      enabled: ${CSV_ENABLED:true}
      import-directory: ${CSV_IMPORT_DIR:/data/imports}
  
  processing:
    tick-buffer-size: 100000
    candle-timeframes: 1min,5min,15min,1hour,1day
    validation:
      circuit-breaker-percent: 20
      max-volume-multiplier: 100
  
  storage:
    timescaledb:
      batch-size: 1000
      intraday-only: true  # Only store current day's data
    hudi:
      enabled: ${HUDI_ENABLED:true}
      base-path: ${HUDI_BASE_PATH:s3://moneyplant-datalake/nse-eq-ticks}
      table-name: nse_eq_ticks_historical
      partition-fields: date
    archival:
      enabled: true
      schedule-cron: "0 30 15 * * MON-FRI"  # 3:30 PM IST daily
      verify-integrity: true
      auto-truncate: true

logging:
  level:
    root: INFO
    com.moneyplant.engines.ingestion: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

### Profile-Specific Configuration

```yaml
# application-dev.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
  datasource:
    url: jdbc:postgresql://localhost:5432/moneyplant_dev

ingestion:
  providers:
    nse:
      enabled: false  # Use mock data in dev
    yahoo:
      rate-limit-per-hour: 100  # Lower limit for dev

logging:
  level:
    com.moneyplant.engines.ingestion: TRACE

---
# application-prod.yml
spring:
  kafka:
    bootstrap-servers: kafka-cluster-1:9092,kafka-cluster-2:9092,kafka-cluster-3:9092
    producer:
      acks: all
      retries: 5
  datasource:
    hikari:
      maximum-pool-size: 50

ingestion:
  providers:
    nse:
      enabled: true
    yahoo:
      enabled: true
  storage:
    hudi:
      enabled: true

logging:
  level:
    com.moneyplant.engines.ingestion: INFO
```

## Security Considerations

### API Authentication

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/actuator/health", "/actuator/info").permitAll()
                .pathMatchers("/api/v1/**").authenticated()
                .anyExchange().denyAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .build();
    }
}
```

### Rate Limiting

```java
@Component
public class RateLimitingFilter implements WebFilter {
    
    private final RateLimiter rateLimiter = RateLimiter.create(1000.0);  // 1000 req/sec
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (!rateLimiter.tryAcquire()) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }
}
```


### Data Encryption

```java
@Configuration
public class EncryptionConfig {
    
    @Bean
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword(System.getenv("ENCRYPTION_PASSWORD"));
        config.setAlgorithm("PBEWithHMACSHA512AndAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);
        return encryptor;
    }
}
```

## Migration from Python

### Data Migration Strategy

1. **Export Python Data**
```python
# export_data.py
import pandas as pd
from sqlalchemy import create_engine

engine = create_engine('postgresql://localhost/moneyplant_python')

# Export tick data
query = """
    SELECT symbol, timestamp, price, volume, bid, ask, metadata
    FROM nse_eq_ticks
    WHERE timestamp >= '2023-01-01'
"""
df = pd.read_sql(query, engine)
df.to_parquet('tick_data_export.parquet', compression='snappy')

# Export OHLCV data
query = """
    SELECT symbol, timestamp, timeframe, open, high, low, close, volume
    FROM market_data_ohlcv
    WHERE timestamp >= '2023-01-01'
"""
df = pd.read_sql(query, engine)
df.to_parquet('ohlcv_data_export.parquet', compression='snappy')
```

2. **Import to Java System**
```java
@Service
public class DataMigrationService {
    
    public Mono<MigrationResult> importFromParquet(Path parquetFile) {
        return Mono.fromCallable(() -> {
            ParquetReader<GenericRecord> reader = AvroParquetReader
                .<GenericRecord>builder(new org.apache.hadoop.fs.Path(parquetFile.toString()))
                .build();
            
            List<TickData> batch = new ArrayList<>();
            GenericRecord record;
            int count = 0;
            
            while ((record = reader.read()) != null) {
                TickData tick = convertToTickData(record);
                batch.add(tick);
                
                if (batch.size() >= 1000) {
                    timescaleRepository.batchInsert(batch).block();
                    count += batch.size();
                    batch.clear();
                }
            }
            
            if (!batch.isEmpty()) {
                timescaleRepository.batchInsert(batch).block();
                count += batch.size();
            }
            
            return new MigrationResult(count, parquetFile.getFileName().toString());
        });
    }
}
```

### Validation Strategy

```java
@Service
public class MigrationValidationService {
    
    public Mono<ValidationReport> validateMigration(LocalDate date) {
        return Mono.zip(
            getPythonRecordCount(date),
            getJavaRecordCount(date),
            compareSampleData(date)
        ).map(tuple -> {
            long pythonCount = tuple.getT1();
            long javaCount = tuple.getT2();
            boolean samplesMatch = tuple.getT3();
            
            return ValidationReport.builder()
                .date(date)
                .pythonRecordCount(pythonCount)
                .javaRecordCount(javaCount)
                .recordCountMatch(pythonCount == javaCount)
                .sampleDataMatch(samplesMatch)
                .migrationComplete(pythonCount == javaCount && samplesMatch)
                .build();
        });
    }
}
```

## Performance Benchmarks

### Target Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Tick Processing Latency (p99) | <10ms | End-to-end from receipt to Kafka publish |
| Throughput per Symbol | 10,000+ ticks/sec | Sustained rate over 1 minute |
| Historical Data Fetch | 2000 symbols in <60s | Parallel fetch with virtual threads |
| TimescaleDB Write | 100,000+ rows/sec | Batch insert with COPY protocol |
| Memory Usage | <4GB for 1000 symbols | Heap + off-heap under load |
| CPU Usage | <70% at peak load | Average across all cores |
| WebSocket Reconnection | <5 seconds | Time to restore connection |
| Data Completeness | >99.9% | Ticks received vs expected |

### Benchmark Results (Expected)

```
Benchmark                                Mode  Cnt    Score    Error  Units
IngestionBenchmark.tickProcessing       thrpt   10  125000    ±5000  ops/s
IngestionBenchmark.latency               avgt   10      8.5    ±0.5  ms
IngestionBenchmark.batchInsert          thrpt   10  150000   ±10000  rows/s
IngestionBenchmark.kafkaPublish          avgt   10      1.8    ±0.2  ms
IngestionBenchmark.dataValidation        avgt   10      0.5    ±0.1  ms
IngestionBenchmark.normalization         avgt   10      0.3    ±0.05 ms
```

## Troubleshooting Guide

### Common Issues

1. **High Latency**
   - Check network latency to data providers
   - Verify Kafka broker performance
   - Review GC logs for long pauses
   - Check TimescaleDB query performance

2. **Data Loss**
   - Verify Kafka retention settings
   - Check circuit breaker status
   - Review error logs for exceptions
   - Validate backpressure handling

3. **Memory Issues**
   - Reduce tick buffer size
   - Increase heap size
   - Enable GC logging
   - Check for memory leaks

4. **Connection Failures**
   - Verify WebSocket URL and credentials
   - Check network connectivity
   - Review reconnection logs
   - Validate circuit breaker configuration

## Future Enhancements

1. **Machine Learning Integration**
   - Anomaly detection for data quality
   - Predictive data gap filling
   - Intelligent rate limiting

2. **Advanced Analytics**
   - Real-time technical indicators
   - Market microstructure analysis
   - Order book reconstruction

3. **Multi-Exchange Support**
   - BSE (Bombay Stock Exchange)
   - International exchanges (NYSE, NASDAQ)
   - Cryptocurrency exchanges

4. **Enhanced Data Lake**
   - Apache Iceberg integration
   - Delta Lake support
   - Automated data cataloging

5. **Edge Computing**
   - Deploy ingestion nodes closer to exchanges
   - Reduce network latency
   - Improve data freshness

## Conclusion

The Ingestion Engine design provides a robust, scalable, and high-performance foundation for market data ingestion in the MoneyPlant platform. By leveraging modern Java technologies (Spring Boot 3.x, Project Reactor, Java 21 virtual threads) and proven infrastructure components (Kafka, TimescaleDB, Redis), the system achieves sub-10ms latency while processing 10,000+ ticks per second per symbol.

The modular architecture ensures maintainability and extensibility, while comprehensive monitoring and observability enable operational excellence. The migration strategy from Python provides a clear path forward with validation checkpoints to ensure data integrity throughout the transition.
