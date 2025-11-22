# Design Document

## Overview

The Kite Ingestion System is a high-performance Java-based data pipeline built with Spring Boot that fetches market data from Zerodha's Kite Connect API and stores it in PostgreSQL with TimescaleDB extensions. The system is implemented in the `engines` module under the `com.moneyplant.engines.ingestion.kite` package, following Spring Boot best practices and integrating seamlessly with the existing MoneyPlant platform architecture.

The system provides two main capabilities:

1. **Instrument Master Import**: Fetches the complete list of tradable instruments from Kite Connect and stores them in the `kite_instrument_master` table
2. **Historical Data Backfill**: Fetches historical OHLCV (Open, High, Low, Close, Volume) data for specific instruments and date ranges, storing them in a TimescaleDB hypertable for optimized time-series queries

The design emphasizes:

- **Performance**: Batch processing, parallel execution, and optimized database operations
- **Reliability**: Comprehensive error handling, retry logic with Resilience4j, and transactional integrity
- **Scalability**: Async execution, rate limiting, and efficient resource utilization
- **Maintainability**: Clean architecture with service layers, dependency injection, and comprehensive logging
- **Integration**: Seamless integration with existing MoneyPlant platform patterns and infrastructure

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Kite Ingestion System                         │
│                  (engines/com.moneyplant.engines.ingestion.kite) │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              REST API Controllers                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • KiteIngestionController                                │  │
│  │    - POST /api/ingestion/kite/instruments                 │  │
│  │    - POST /api/ingestion/kite/historical                  │  │
│  │    - GET  /api/ingestion/kite/status/{jobId}              │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Service Layer (@Async)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • KiteInstrumentService                                  │  │
│  │    - importInstruments()                                  │  │
│  │  • KiteHistoricalDataService                              │  │
│  │    - fetchHistoricalData()                                │  │
│  │    - batchFetchHistoricalData()                           │  │
│  │  • KiteJobTrackingService                                 │  │
│  │    - trackJob(), getJobStatus()                           │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Kite API Client (with Resilience4j)              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • KiteConnectClient (wraps com.zerodhatech.kiteconnect) │  │
│  │    - getInstruments()                                     │  │
│  │    - getHistoricalData()                                  │  │
│  │  • Retry, Rate Limiting, Circuit Breaker                  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Repository Layer (Spring Data JPA)               │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • KiteInstrumentMasterRepository                        │  │
│  │  • KiteOhlcvHistoricRepository                           │  │
│  │  • Batch Insert Support via JdbcTemplate                 │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────┐
         │   PostgreSQL + TimescaleDB       │
         ├──────────────────────────────────┤
         │  • kite_instrument_master        │
         │  • kite_ohlcv_historic           │
         │    (TimescaleDB Hypertable)      │
         └──────────────────────────────────┘
                        ▲
                        │
         ┌──────────────┴───────────────┐
         │   Kite Connect API           │
         │   (api.kite.trade)           │
         └──────────────────────────────┘
```

### Package Structure

```
engines/src/main/java/com/moneyplant/engines/ingestion/kite/
├── api/
│   └── KiteIngestionController.java          # REST API endpoints
│
├── service/
│   ├── KiteInstrumentService.java            # Instrument import logic
│   ├── KiteHistoricalDataService.java        # Historical data fetching
│   ├── KiteJobTrackingService.java           # Job status tracking
│   └── impl/
│       ├── KiteInstrumentServiceImpl.java
│       ├── KiteHistoricalDataServiceImpl.java
│       └── KiteJobTrackingServiceImpl.java
│
├── client/
│   ├── KiteConnectClient.java                # Wrapper for KiteConnect library
│   └── KiteApiConfig.java                    # API client configuration
│
├── repository/
│   ├── KiteInstrumentMasterRepository.java   # JPA repository for instruments
│   ├── KiteOhlcvHistoricRepository.java      # JPA repository for OHLCV data
│   └── KiteBatchRepository.java              # JDBC batch operations
│
├── model/
│   ├── entity/
│   │   ├── KiteInstrumentMaster.java         # JPA entity for instruments
│   │   └── KiteOhlcvHistoric.java            # JPA entity for OHLCV data
│   ├── dto/
│   │   ├── InstrumentImportRequest.java
│   │   ├── HistoricalDataRequest.java
│   │   ├── BatchHistoricalDataRequest.java
│   │   ├── JobStatusResponse.java
│   │   └── IngestionSummary.java
│   └── enums/
│       ├── CandleInterval.java
│       ├── JobStatus.java
│       └── Exchange.java
│
├── config/
│   ├── KiteIngestionConfig.java              # Configuration properties
│   ├── AsyncConfig.java                      # Async executor configuration
│   └── Resilience4jConfig.java               # Retry/rate limit configuration
│
└── exception/
    ├── KiteAuthenticationException.java
    ├── KiteApiException.java
    ├── KiteRateLimitException.java
    └── KiteIngestionException.java

engines/src/main/resources/db/migration/
└── V{version}__create_kite_tables.sql        # Flyway migration script
```


## Components and Interfaces

### 1. REST API Controller (`KiteIngestionController`)

**Purpose**: Expose REST endpoints for triggering ingestion operations and checking job status.

**Interface**:
```java
@RestController
@RequestMapping("/api/ingestion/kite")
@Slf4j
public class KiteIngestionController {
    
    @PostMapping("/instruments")
    public ResponseEntity<JobStatusResponse> importInstruments(
        @RequestBody(required = false) InstrumentImportRequest request
    );
    
    @PostMapping("/historical")
    public ResponseEntity<JobStatusResponse> fetchHistoricalData(
        @Valid @RequestBody HistoricalDataRequest request
    );
    
    @PostMapping("/historical/batch")
    public ResponseEntity<JobStatusResponse> batchFetchHistoricalData(
        @Valid @RequestBody BatchHistoricalDataRequest request
    );
    
    @GetMapping("/status/{jobId}")
    public ResponseEntity<JobStatusResponse> getJobStatus(
        @PathVariable String jobId
    );
}
```

**Request/Response DTOs**:
```java
@Data
@Builder
public class InstrumentImportRequest {
    private List<String> exchanges;  // Optional: filter by exchanges
}

@Data
@Builder
public class HistoricalDataRequest {
    @NotNull
    private String instrumentToken;
    
    @NotNull
    private String exchange;
    
    @NotNull
    @PastOrPresent
    private LocalDate fromDate;
    
    @NotNull
    @PastOrPresent
    private LocalDate toDate;
    
    @NotNull
    private CandleInterval interval;
}

@Data
@Builder
public class BatchHistoricalDataRequest {
    @NotEmpty
    private List<String> instrumentTokens;
    
    @NotNull
    private String exchange;
    
    @NotNull
    @PastOrPresent
    private LocalDate fromDate;
    
    @NotNull
    @PastOrPresent
    private LocalDate toDate;
    
    @NotNull
    private CandleInterval interval;
}

@Data
@Builder
public class JobStatusResponse {
    private String jobId;
    private JobStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private IngestionSummary summary;
    private String errorMessage;
}

@Data
@Builder
public class IngestionSummary {
    private int totalRecords;
    private int successCount;
    private int failureCount;
    private Map<String, Integer> recordsByCategory;
    private Duration executionTime;
}
```


### 2. Instrument Service (`KiteInstrumentService`)

**Purpose**: Handle instrument master data import from Kite Connect API.

**Interface**:
```java
public interface KiteInstrumentService {
    
    /**
     * Import all instruments from Kite Connect API asynchronously.
     * 
     * @param exchanges Optional list of exchanges to filter
     * @return Job ID for tracking
     */
    @Async
    CompletableFuture<String> importInstruments(List<String> exchanges);
    
    /**
     * Get instrument by token and exchange.
     */
    Optional<KiteInstrumentMaster> getInstrument(String instrumentToken, String exchange);
    
    /**
     * Search instruments by trading symbol.
     */
    List<KiteInstrumentMaster> searchByTradingSymbol(String tradingSymbol);
}
```

**Implementation Highlights**:
```java
@Service
@Slf4j
@Transactional
public class KiteInstrumentServiceImpl implements KiteInstrumentService {
    
    private final KiteConnectClient kiteClient;
    private final KiteInstrumentMasterRepository repository;
    private final KiteBatchRepository batchRepository;
    private final KiteJobTrackingService jobTrackingService;
    
    @Override
    @Async("kiteIngestionExecutor")
    public CompletableFuture<String> importInstruments(List<String> exchanges) {
        String jobId = UUID.randomUUID().toString();
        
        try {
            jobTrackingService.startJob(jobId, "INSTRUMENT_IMPORT");
            
            // Fetch instruments from Kite API
            List<Instrument> instruments = kiteClient.getInstruments();
            
            // Filter by exchanges if specified
            if (exchanges != null && !exchanges.isEmpty()) {
                instruments = instruments.stream()
                    .filter(i -> exchanges.contains(i.getExchange()))
                    .collect(Collectors.toList());
            }
            
            // Transform to entities
            List<KiteInstrumentMaster> entities = instruments.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
            
            // Batch insert/update
            int[] results = batchRepository.batchUpsertInstruments(entities);
            
            // Calculate summary
            IngestionSummary summary = calculateSummary(entities, results);
            
            jobTrackingService.completeJob(jobId, summary);
            
            return CompletableFuture.completedFuture(jobId);
            
        } catch (Exception e) {
            log.error("Instrument import failed for job {}", jobId, e);
            jobTrackingService.failJob(jobId, e.getMessage());
            throw new KiteIngestionException("Instrument import failed", e);
        }
    }
    
    private KiteInstrumentMaster toEntity(Instrument instrument) {
        return KiteInstrumentMaster.builder()
            .instrumentToken(instrument.getInstrument_token())
            .exchangeToken(instrument.getExchange_token())
            .tradingsymbol(instrument.getTradingsymbol())
            .name(instrument.getName())
            .lastPrice(instrument.getLast_price())
            .expiry(instrument.getExpiry())
            .strike(instrument.getStrike())
            .tickSize(instrument.getTick_size())
            .lotSize(instrument.getLot_size())
            .instrumentType(instrument.getInstrument_type())
            .segment(instrument.getSegment())
            .exchange(instrument.getExchange())
            .build();
    }
}
```


### 3. Historical Data Service (`KiteHistoricalDataService`)

**Purpose**: Fetch and store historical OHLCV data from Kite Connect API.

**Interface**:
```java
public interface KiteHistoricalDataService {
    
    /**
     * Fetch historical data for a single instrument asynchronously.
     */
    @Async
    CompletableFuture<String> fetchHistoricalData(HistoricalDataRequest request);
    
    /**
     * Fetch historical data for multiple instruments in batch.
     */
    @Async
    CompletableFuture<String> batchFetchHistoricalData(BatchHistoricalDataRequest request);
    
    /**
     * Query historical data from database.
     */
    List<KiteOhlcvHistoric> queryHistoricalData(
        String instrumentToken,
        String exchange,
        LocalDate fromDate,
        LocalDate toDate,
        CandleInterval interval
    );
}
```

**Implementation Highlights**:
```java
@Service
@Slf4j
@Transactional
public class KiteHistoricalDataServiceImpl implements KiteHistoricalDataService {
    
    private final KiteConnectClient kiteClient;
    private final KiteOhlcvHistoricRepository repository;
    private final KiteBatchRepository batchRepository;
    private final KiteJobTrackingService jobTrackingService;
    
    @Value("${kite.ingestion.batch-size:1000}")
    private int batchSize;
    
    @Value("${kite.ingestion.parallel-requests:5}")
    private int parallelRequests;
    
    @Override
    @Async("kiteIngestionExecutor")
    public CompletableFuture<String> fetchHistoricalData(HistoricalDataRequest request) {
        String jobId = UUID.randomUUID().toString();
        
        try {
            jobTrackingService.startJob(jobId, "HISTORICAL_DATA_FETCH");
            
            // Fetch from Kite API
            HistoricalData historicalData = kiteClient.getHistoricalData(
                request.getInstrumentToken(),
                request.getFromDate(),
                request.getToDate(),
                request.getInterval().getKiteValue(),
                false  // continuous = false
            );
            
            // Transform to entities
            List<KiteOhlcvHistoric> entities = historicalData.dataArrayList.stream()
                .map(candle -> toEntity(candle, request))
                .collect(Collectors.toList());
            
            // Batch insert
            int recordsInserted = batchRepository.batchInsertOhlcv(entities);
            
            IngestionSummary summary = IngestionSummary.builder()
                .totalRecords(recordsInserted)
                .successCount(recordsInserted)
                .build();
            
            jobTrackingService.completeJob(jobId, summary);
            
            return CompletableFuture.completedFuture(jobId);
            
        } catch (Exception e) {
            log.error("Historical data fetch failed for job {}", jobId, e);
            jobTrackingService.failJob(jobId, e.getMessage());
            throw new KiteIngestionException("Historical data fetch failed", e);
        }
    }
    
    @Override
    @Async("kiteIngestionExecutor")
    public CompletableFuture<String> batchFetchHistoricalData(BatchHistoricalDataRequest request) {
        String jobId = UUID.randomUUID().toString();
        
        try {
            jobTrackingService.startJob(jobId, "BATCH_HISTORICAL_DATA_FETCH");
            
            // Process instruments in parallel with rate limiting
            List<CompletableFuture<Integer>> futures = request.getInstrumentTokens().stream()
                .map(token -> CompletableFuture.supplyAsync(() -> 
                    fetchAndStoreForInstrument(token, request), 
                    getThrottledExecutor()
                ))
                .collect(Collectors.toList());
            
            // Wait for all to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            
            // Aggregate results
            int totalRecords = futures.stream()
                .map(CompletableFuture::join)
                .mapToInt(Integer::intValue)
                .sum();
            
            IngestionSummary summary = IngestionSummary.builder()
                .totalRecords(totalRecords)
                .successCount(totalRecords)
                .build();
            
            jobTrackingService.completeJob(jobId, summary);
            
            return CompletableFuture.completedFuture(jobId);
            
        } catch (Exception e) {
            log.error("Batch historical data fetch failed for job {}", jobId, e);
            jobTrackingService.failJob(jobId, e.getMessage());
            throw new KiteIngestionException("Batch historical data fetch failed", e);
        }
    }
    
    private int fetchAndStoreForInstrument(String instrumentToken, BatchHistoricalDataRequest request) {
        // Implementation with rate limiting and error handling
        // Returns count of records inserted
    }
}
```


### 4. Kite Connect Client (`KiteConnectClient`)

**Purpose**: Wrapper around the official KiteConnect Java library with retry logic and error handling.

**Interface**:
```java
@Component
@Slf4j
public class KiteConnectClient {
    
    private final KiteConnect kiteConnect;
    private final RetryTemplate retryTemplate;
    
    @Autowired
    public KiteConnectClient(KiteApiConfig config, RetryTemplate retryTemplate) {
        this.kiteConnect = new KiteConnect(config.getApiKey());
        this.kiteConnect.setAccessToken(config.getAccessToken());
        this.retryTemplate = retryTemplate;
    }
    
    /**
     * Get all instruments from Kite API with retry logic.
     */
    @CircuitBreaker(name = "kiteApi", fallbackMethod = "getInstrumentsFallback")
    @RateLimiter(name = "kiteApi")
    @Retry(name = "kiteApi")
    public List<Instrument> getInstruments() throws KiteException {
        log.info("Fetching instruments from Kite API");
        
        try {
            return retryTemplate.execute(context -> {
                List<Instrument> instruments = kiteConnect.getInstruments();
                log.info("Fetched {} instruments from Kite API", instruments.size());
                return instruments;
            });
        } catch (Exception e) {
            log.error("Failed to fetch instruments from Kite API", e);
            throw new KiteApiException("Failed to fetch instruments", e);
        }
    }
    
    /**
     * Get historical data for an instrument with retry logic.
     */
    @CircuitBreaker(name = "kiteApi", fallbackMethod = "getHistoricalDataFallback")
    @RateLimiter(name = "kiteApi")
    @Retry(name = "kiteApi")
    public HistoricalData getHistoricalData(
        String instrumentToken,
        LocalDate fromDate,
        LocalDate toDate,
        String interval,
        boolean continuous
    ) throws KiteException {
        log.info("Fetching historical data for instrument {} from {} to {}", 
            instrumentToken, fromDate, toDate);
        
        try {
            return retryTemplate.execute(context -> {
                Date from = Date.from(fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
                Date to = Date.from(toDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
                
                HistoricalData data = kiteConnect.getHistoricalData(
                    from, to, instrumentToken, interval, continuous, false
                );
                
                log.info("Fetched {} candles for instrument {}", 
                    data.dataArrayList.size(), instrumentToken);
                return data;
            });
        } catch (Exception e) {
            log.error("Failed to fetch historical data for instrument {}", instrumentToken, e);
            throw new KiteApiException("Failed to fetch historical data", e);
        }
    }
    
    private List<Instrument> getInstrumentsFallback(Exception e) {
        log.error("Circuit breaker activated for getInstruments", e);
        return Collections.emptyList();
    }
    
    private HistoricalData getHistoricalDataFallback(
        String instrumentToken, LocalDate fromDate, LocalDate toDate, 
        String interval, boolean continuous, Exception e
    ) {
        log.error("Circuit breaker activated for getHistoricalData", e);
        return new HistoricalData();
    }
}
```


### 5. Batch Repository (`KiteBatchRepository`)

**Purpose**: High-performance batch insert/update operations using JDBC.

**Interface**:
```java
@Repository
@Slf4j
public class KiteBatchRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    @Value("${kite.ingestion.batch-size:1000}")
    private int batchSize;
    
    /**
     * Batch upsert instruments using JDBC batch operations.
     * Uses INSERT ... ON CONFLICT ... DO UPDATE for PostgreSQL.
     */
    public int[] batchUpsertInstruments(List<KiteInstrumentMaster> instruments) {
        String sql = """
            INSERT INTO kite_instrument_master (
                instrument_token, exchange_token, tradingsymbol, name, last_price,
                expiry, strike, tick_size, lot_size, instrument_type, segment, exchange,
                last_updated, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (instrument_token, exchange)
            DO UPDATE SET
                exchange_token = EXCLUDED.exchange_token,
                tradingsymbol = EXCLUDED.tradingsymbol,
                name = EXCLUDED.name,
                last_price = EXCLUDED.last_price,
                expiry = EXCLUDED.expiry,
                strike = EXCLUDED.strike,
                tick_size = EXCLUDED.tick_size,
                lot_size = EXCLUDED.lot_size,
                instrument_type = EXCLUDED.instrument_type,
                segment = EXCLUDED.segment,
                last_updated = CURRENT_TIMESTAMP
            """;
        
        return jdbcTemplate.batchUpdate(sql, instruments, batchSize,
            (PreparedStatement ps, KiteInstrumentMaster instrument) -> {
                ps.setString(1, instrument.getInstrumentToken());
                ps.setString(2, instrument.getExchangeToken());
                ps.setString(3, instrument.getTradingsymbol());
                ps.setString(4, instrument.getName());
                ps.setDouble(5, instrument.getLastPrice());
                ps.setDate(6, instrument.getExpiry() != null ? 
                    Date.valueOf(instrument.getExpiry()) : null);
                ps.setDouble(7, instrument.getStrike());
                ps.setDouble(8, instrument.getTickSize());
                ps.setInt(9, instrument.getLotSize());
                ps.setString(10, instrument.getInstrumentType());
                ps.setString(11, instrument.getSegment());
                ps.setString(12, instrument.getExchange());
            });
    }
    
    /**
     * Batch insert OHLCV data using JDBC batch operations.
     * Uses INSERT ... ON CONFLICT DO NOTHING to avoid duplicates.
     */
    public int batchInsertOhlcv(List<KiteOhlcvHistoric> ohlcvData) {
        String sql = """
            INSERT INTO kite_ohlcv_historic (
                instrument_token, exchange, date, open, high, low, close, volume,
                candle_interval, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (instrument_token, exchange, date, candle_interval) DO NOTHING
            """;
        
        int[] results = jdbcTemplate.batchUpdate(sql, ohlcvData, batchSize,
            (PreparedStatement ps, KiteOhlcvHistoric ohlcv) -> {
                ps.setString(1, ohlcv.getInstrumentToken());
                ps.setString(2, ohlcv.getExchange());
                ps.setTimestamp(3, Timestamp.valueOf(ohlcv.getDate()));
                ps.setDouble(4, ohlcv.getOpen());
                ps.setDouble(5, ohlcv.getHigh());
                ps.setDouble(6, ohlcv.getLow());
                ps.setDouble(7, ohlcv.getClose());
                ps.setLong(8, ohlcv.getVolume());
                ps.setString(9, ohlcv.getCandleInterval().name());
            });
        
        return Arrays.stream(results).sum();
    }
}
```


## Data Models

### JPA Entities

**KiteInstrumentMaster Entity**:
```java
@Entity
@Table(name = "kite_instrument_master",
    indexes = {
        @Index(name = "idx_kite_instrument_master_tradingsymbol", columnList = "tradingsymbol"),
        @Index(name = "idx_kite_instrument_master_exchange", columnList = "exchange"),
        @Index(name = "idx_kite_instrument_master_instrument_type", columnList = "instrument_type"),
        @Index(name = "idx_kite_instrument_master_segment", columnList = "segment")
    }
)
@IdClass(KiteInstrumentMasterId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KiteInstrumentMaster {
    
    @Id
    @Column(name = "instrument_token", length = 50, nullable = false)
    private String instrumentToken;
    
    @Id
    @Column(name = "exchange", length = 10, nullable = false)
    private String exchange;
    
    @Column(name = "exchange_token", length = 50)
    private String exchangeToken;
    
    @Column(name = "tradingsymbol", length = 100, nullable = false)
    private String tradingsymbol;
    
    @Column(name = "name", length = 255)
    private String name;
    
    @Column(name = "last_price")
    private Double lastPrice;
    
    @Column(name = "expiry")
    private LocalDate expiry;
    
    @Column(name = "strike")
    private Double strike;
    
    @Column(name = "tick_size")
    private Double tickSize;
    
    @Column(name = "lot_size")
    private Integer lotSize;
    
    @Column(name = "instrument_type", length = 10)
    private String instrumentType;
    
    @Column(name = "segment", length = 20)
    private String segment;
    
    @Column(name = "last_updated", nullable = false, updatable = false,
        insertable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime lastUpdated;
    
    @Column(name = "created_at", nullable = false, updatable = false,
        insertable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KiteInstrumentMasterId implements Serializable {
    private String instrumentToken;
    private String exchange;
}
```

**KiteOhlcvHistoric Entity**:
```java
@Entity
@Table(name = "kite_ohlcv_historic",
    indexes = {
        @Index(name = "idx_ohlcv_instrument_token_date", 
            columnList = "instrument_token, date DESC"),
        @Index(name = "idx_ohlcv_exchange_date", 
            columnList = "exchange, date DESC"),
        @Index(name = "idx_ohlcv_candle_interval_date", 
            columnList = "candle_interval, date DESC"),
        @Index(name = "idx_ohlcv_instrument_exchange_interval", 
            columnList = "instrument_token, exchange, candle_interval, date DESC")
    }
)
@IdClass(KiteOhlcvHistoricId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KiteOhlcvHistoric {
    
    @Id
    @Column(name = "instrument_token", length = 50, nullable = false)
    private String instrumentToken;
    
    @Id
    @Column(name = "exchange", length = 10, nullable = false)
    private String exchange;
    
    @Id
    @Column(name = "date", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private LocalDateTime date;
    
    @Id
    @Column(name = "candle_interval", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private CandleInterval candleInterval;
    
    @Column(name = "open", nullable = false)
    private Double open;
    
    @Column(name = "high", nullable = false)
    private Double high;
    
    @Column(name = "low", nullable = false)
    private Double low;
    
    @Column(name = "close", nullable = false)
    private Double close;
    
    @Column(name = "volume", nullable = false)
    private Long volume;
    
    @Column(name = "created_at", nullable = false, updatable = false,
        insertable = false, columnDefinition = "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KiteOhlcvHistoricId implements Serializable {
    private String instrumentToken;
    private String exchange;
    private LocalDateTime date;
    private CandleInterval candleInterval;
}
```

### Enums

```java
public enum CandleInterval {
    MINUTE("minute"),
    THREE_MINUTE("3minute"),
    FIVE_MINUTE("5minute"),
    TEN_MINUTE("10minute"),
    FIFTEEN_MINUTE("15minute"),
    THIRTY_MINUTE("30minute"),
    SIXTY_MINUTE("60minute"),
    DAY("day");
    
    private final String kiteValue;
    
    CandleInterval(String kiteValue) {
        this.kiteValue = kiteValue;
    }
    
    public String getKiteValue() {
        return kiteValue;
    }
}

public enum JobStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    FAILED,
    CANCELLED
}

public enum Exchange {
    NSE, BSE, NFO, BFO, CDS, MCX
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication precedes data fetching

*For any* API operation (instrument fetch or historical data fetch), the KiteConnect client must be initialized with valid credentials before any data retrieval attempts are made.

**Validates: Requirements 1.1**

### Property 2: All required fields are parsed

*For any* valid Kite API response containing instruments, the parsed result must include all required fields (tradingsymbol, exchange, instrument_token, exchange_token, instrument_type, name, segment, expiry, strike, tick_size, lot_size) for each instrument.

**Validates: Requirements 1.3**

### Property 3: Required field validation

*For any* instrument in the parsed data, validation must verify that all required fields (instrument_token, exchange, tradingsymbol) are present and non-null.

**Validates: Requirements 1.4**

### Property 4: Schema transformation correctness

*For any* valid instrument that passes validation, the transformation function must produce a JPA entity that matches the kite_instrument_master table schema with all fields correctly mapped.

**Validates: Requirements 1.5, 3.1**

### Property 5: Idempotent table creation

*For any* number of application startups, the database tables must exist after Flyway migrations run, and running migrations multiple times must not cause errors or data loss.

**Validates: Requirements 2.1**

### Property 6: Upsert idempotence

*For any* instrument, performing an upsert operation multiple times with the same data must result in exactly one record in the database with the latest data.

**Validates: Requirements 3.2**

### Property 7: Composite key uniqueness

*For any* two instruments with the same (instrument_token, exchange) composite key, only one record must exist in the database after upsert operations complete.

**Validates: Requirements 3.3**

### Property 8: Upsert count accuracy

*For any* batch upsert operation, the sum of inserted and updated counts must equal the total number of instruments processed.

**Validates: Requirements 3.4**

### Property 9: Transaction rollback on error

*For any* database error that occurs during a @Transactional method, the system must rollback all changes, leaving the database in its pre-transaction state.

**Validates: Requirements 3.5**

### Property 10: Operation logging completeness

*For any* service operation execution, the logs must contain both a start timestamp and a completion status (success or failure) with execution duration.

**Validates: Requirements 5.1**

### Property 11: Retry with exponential backoff

*For any* transient API failure (network timeout, HTTP 5xx), the system must retry the operation with exponentially increasing delays using Resilience4j up to the configured maximum retry attempts.

**Validates: Requirements 5.2**

### Property 12: Error logging detail

*For any* exception that occurs, the log entry must include the error message, context information (operation being performed, parameters), and a stack trace.

**Validates: Requirements 5.3**

### Property 13: Complete instrument storage

*For any* set of instruments fetched from the Kite API, the count of instruments stored in the database must equal the count of instruments fetched (no filtering or loss unless explicitly requested).

**Validates: Requirements 8.1**

### Property 14: Metadata preservation

*For any* instrument stored in the database, all metadata fields (exchange, segment, instrument_type, expiry, strike, lot_size) must match the values from the Kite API response.

**Validates: Requirements 8.2**

### Property 15: Summary statistics by category

*For any* completed ingestion, the logs must include summary statistics broken down by exchange and instrument_type showing counts for each category.

**Validates: Requirements 8.3**

### Property 16: Date range validation

*For any* historical data request, the system must reject requests where from_date is after to_date or either date is in the future.

**Validates: Requirements 10.2**

### Property 17: Historical data parsing completeness

*For any* valid Kite API historical data response, all OHLCV fields (timestamp, open, high, low, close, volume) must be parsed and stored for each candle.

**Validates: Requirements 10.4, 10.5**

### Property 18: Rate limit backoff

*For any* HTTP 429 response from Kite API, the system must pause requests and wait for the time specified in the Retry-After header before retrying.

**Validates: Requirements 12.1, 12.2**

### Property 19: Batch processing completeness

*For any* batch historical data request with N instruments, the system must attempt to fetch data for all N instruments, and the final summary must account for all instruments (success + failure = N).

**Validates: Requirements 13.4, 13.5**

### Property 20: Async job tracking

*For any* async operation started, a unique job ID must be generated and returned immediately, and the job status must be queryable via the status endpoint throughout the operation lifecycle.

**Validates: Requirements 14.3, 14.4, 14.5**


## Error Handling

### Error Categories

1. **Authentication Errors** (`KiteAuthenticationException`)
   - Invalid API credentials
   - Expired access token
   - Missing configuration
   
   **Handling**: Throw custom exception with clear message, log error, fail fast without retries, return HTTP 401 from API endpoints.

2. **API Errors** (`KiteApiException`)
   - Rate limiting (HTTP 429)
   - Server errors (HTTP 5xx)
   - Timeout errors
   - Network connectivity issues
   
   **Handling**: Use Resilience4j retry with exponential backoff (max 3 attempts), log each retry attempt, respect Retry-After header for 429, return HTTP 502/503 from API endpoints.

3. **Validation Errors** (`ValidationException`)
   - Missing required fields
   - Invalid data types
   - Date range validation failures
   - Constraint violations
   
   **Handling**: Log validation errors with details, return HTTP 400 with error details, skip invalid records in batch operations, report summary at end.

4. **Database Errors** (`DataAccessException`)
   - Connection failures
   - Transaction deadlocks
   - Constraint violations
   - Query timeouts
   
   **Handling**: Rollback transaction via @Transactional, log error with context, retry connection errors (max 3 attempts), return HTTP 500 from API endpoints.

5. **Rate Limit Errors** (`KiteRateLimitException`)
   - API rate limit exceeded
   - Too many concurrent requests
   
   **Handling**: Pause requests, wait for Retry-After duration, use rate limiter to prevent future violations, log warnings.

### Error Handling Patterns

**Pattern 1: Resilience4j Configuration**
```java
@Configuration
public class Resilience4jConfig {
    
    @Bean
    public RetryConfig kiteApiRetryConfig() {
        return RetryConfig.custom()
            .maxAttempts(3)
            .waitDuration(Duration.ofSeconds(1))
            .intervalFunction(IntervalFunction.ofExponentialBackoff(
                Duration.ofSeconds(1), 2.0))
            .retryExceptions(IOException.class, TimeoutException.class, KiteException.class)
            .ignoreExceptions(KiteAuthenticationException.class)
            .build();
    }
    
    @Bean
    public RateLimiterConfig kiteApiRateLimiterConfig() {
        return RateLimiterConfig.custom()
            .limitForPeriod(3)  // 3 requests
            .limitRefreshPeriod(Duration.ofSeconds(1))  // per second
            .timeoutDuration(Duration.ofSeconds(10))
            .build();
    }
    
    @Bean
    public CircuitBreakerConfig kiteApiCircuitBreakerConfig() {
        return CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .waitDurationInOpenState(Duration.ofMinutes(1))
            .slidingWindowSize(10)
            .build();
    }
}
```

**Pattern 2: Global Exception Handler**
```java
@RestControllerAdvice
@Slf4j
public class KiteIngestionExceptionHandler {
    
    @ExceptionHandler(KiteAuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
        KiteAuthenticationException ex
    ) {
        log.error("Authentication failed", ex);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse.builder()
                .error("AUTHENTICATION_FAILED")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(KiteRateLimitException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitException(
        KiteRateLimitException ex
    ) {
        log.warn("Rate limit exceeded", ex);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()))
            .body(ErrorResponse.builder()
                .error("RATE_LIMIT_EXCEEDED")
                .message(ex.getMessage())
                .retryAfter(ex.getRetryAfterSeconds())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                FieldError::getDefaultMessage
            ));
        
        return ResponseEntity.badRequest()
            .body(ErrorResponse.builder()
                .error("VALIDATION_FAILED")
                .message("Invalid request parameters")
                .validationErrors(errors)
                .timestamp(LocalDateTime.now())
                .build());
    }
}
```

**Pattern 3: Transaction Management**
```java
@Service
@Transactional
public class KiteInstrumentServiceImpl implements KiteInstrumentService {
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompletableFuture<String> importInstruments(List<String> exchanges) {
        // All database operations within this method are part of a single transaction
        // Any exception will trigger automatic rollback
        try {
            // Fetch and process instruments
            // ...
        } catch (Exception e) {
            // Transaction will be rolled back automatically
            log.error("Import failed, transaction rolled back", e);
            throw new KiteIngestionException("Import failed", e);
        }
    }
}
```


## Testing Strategy

### Unit Testing

Unit tests will verify specific functionality of individual components using JUnit 5 and Mockito:

1. **Service Layer Tests**
   - Test instrument transformation logic
   - Test validation rules
   - Test error handling paths
   - Mock repository and API client dependencies

2. **Repository Tests**
   - Test batch insert/update operations
   - Test query methods
   - Use @DataJpaTest with H2 in-memory database

3. **API Client Tests**
   - Test retry logic with mocked failures
   - Test rate limiting behavior
   - Test circuit breaker activation
   - Mock KiteConnect library responses

4. **Controller Tests**
   - Test request validation
   - Test response formatting
   - Test error responses
   - Use @WebMvcTest with mocked services

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **jqwik** library for Java:

**Configuration**:
- Each property test will run a minimum of 100 iterations
- Tests will use jqwik to generate random valid inputs
- Each test will be tagged with a comment referencing the design document property

**Property Tests**:

1. **Property 2: All required fields are parsed**
   ```java
   // Feature: kite-ingestion, Property 2: All required fields are parsed
   @Property
   void allFieldsParsedFromKiteResponse(@ForAll("validInstruments") Instrument instrument) {
       KiteInstrumentMaster entity = instrumentService.toEntity(instrument);
       
       assertThat(entity.getInstrumentToken()).isNotNull();
       assertThat(entity.getExchange()).isNotNull();
       assertThat(entity.getTradingsymbol()).isNotNull();
       assertThat(entity.getExchangeToken()).isNotNull();
       assertThat(entity.getInstrumentType()).isNotNull();
       // ... verify all fields
   }
   
   @Provide
   Arbitrary<Instrument> validInstruments() {
       return Combinators.combine(
           Arbitraries.strings().alpha().ofLength(10),
           Arbitraries.of("NSE", "BSE", "NFO"),
           Arbitraries.strings().numeric().ofLength(8)
       ).as((symbol, exchange, token) -> {
           Instrument inst = new Instrument();
           inst.setTradingsymbol(symbol);
           inst.setExchange(exchange);
           inst.setInstrument_token(token);
           // ... set all fields
           return inst;
       });
   }
   ```

2. **Property 4: Schema transformation correctness**
   ```java
   // Feature: kite-ingestion, Property 4: Schema transformation correctness
   @Property
   void transformationPreservesData(@ForAll("validInstruments") Instrument instrument) {
       KiteInstrumentMaster entity = instrumentService.toEntity(instrument);
       
       assertThat(entity.getInstrumentToken()).isEqualTo(instrument.getInstrument_token());
       assertThat(entity.getExchange()).isEqualTo(instrument.getExchange());
       assertThat(entity.getTradingsymbol()).isEqualTo(instrument.getTradingsymbol());
       assertThat(entity.getStrike()).isEqualTo(instrument.getStrike());
       // ... verify all fields match
   }
   ```

3. **Property 6: Upsert idempotence**
   ```java
   // Feature: kite-ingestion, Property 6: Upsert idempotence
   @Property
   void upsertIsIdempotent(
       @ForAll("validInstruments") Instrument instrument,
       @ForAll @IntRange(min = 2, max = 5) int repeatCount
   ) {
       KiteInstrumentMaster entity = instrumentService.toEntity(instrument);
       
       // Upsert the same instrument multiple times
       for (int i = 0; i < repeatCount; i++) {
           batchRepository.batchUpsertInstruments(List.of(entity));
       }
       
       // Verify only one record exists
       Optional<KiteInstrumentMaster> result = repository.findById(
           new KiteInstrumentMasterId(entity.getInstrumentToken(), entity.getExchange())
       );
       
       assertThat(result).isPresent();
       assertThat(result.get()).isEqualTo(entity);
   }
   ```

4. **Property 9: Transaction rollback on error**
   ```java
   // Feature: kite-ingestion, Property 9: Transaction rollback on error
   @Property
   void transactionRollsBackOnError(
       @ForAll("validInstruments") List<Instrument> instruments
   ) {
       long initialCount = repository.count();
       
       // Create one invalid instrument to trigger error
       Instrument invalidInstrument = new Instrument();
       invalidInstrument.setInstrument_token(null);  // Violates NOT NULL constraint
       
       List<Instrument> instrumentsWithError = new ArrayList<>(instruments);
       instrumentsWithError.add(invalidInstrument);
       
       // Attempt to import with error
       assertThatThrownBy(() -> 
           instrumentService.importInstruments(instrumentsWithError)
       ).isInstanceOf(DataAccessException.class);
       
       // Verify no changes were committed
       long finalCount = repository.count();
       assertThat(finalCount).isEqualTo(initialCount);
   }
   ```

5. **Property 13: Complete instrument storage**
   ```java
   // Feature: kite-ingestion, Property 13: Complete instrument storage
   @Property
   void allInstrumentsAreStored(
       @ForAll("validInstruments") @Size(min = 10, max = 100) List<Instrument> instruments
   ) {
       int fetchedCount = instruments.size();
       
       // Import instruments
       instrumentService.importInstruments(instruments);
       
       // Count stored instruments
       List<String> tokens = instruments.stream()
           .map(Instrument::getInstrument_token)
           .collect(Collectors.toList());
       
       long storedCount = repository.countByInstrumentTokenIn(tokens);
       
       assertThat(storedCount).isEqualTo(fetchedCount);
   }
   ```

6. **Property 14: Metadata preservation**
   ```java
   // Feature: kite-ingestion, Property 14: Metadata preservation
   @Property
   void metadataIsPreserved(@ForAll("validInstruments") Instrument instrument) {
       // Import instrument
       instrumentService.importInstruments(List.of(instrument));
       
       // Retrieve from database
       Optional<KiteInstrumentMaster> stored = repository.findById(
           new KiteInstrumentMasterId(
               instrument.getInstrument_token(),
               instrument.getExchange()
           )
       );
       
       assertThat(stored).isPresent();
       assertThat(stored.get().getExchange()).isEqualTo(instrument.getExchange());
       assertThat(stored.get().getSegment()).isEqualTo(instrument.getSegment());
       assertThat(stored.get().getInstrumentType()).isEqualTo(instrument.getInstrument_type());
       assertThat(stored.get().getLotSize()).isEqualTo(instrument.getLot_size());
       // ... verify all metadata fields
   }
   ```

7. **Property 16: Date range validation**
   ```java
   // Feature: kite-ingestion, Property 16: Date range validation
   @Property
   void invalidDateRangesAreRejected(
       @ForAll @FutureOrPresent LocalDate futureDate,
       @ForAll @PastOrPresent LocalDate pastDate
   ) {
       // Test future dates
       HistoricalDataRequest futureRequest = HistoricalDataRequest.builder()
           .instrumentToken("12345")
           .exchange("NSE")
           .fromDate(futureDate)
           .toDate(futureDate.plusDays(1))
           .interval(CandleInterval.DAY)
           .build();
       
       assertThatThrownBy(() -> 
           historicalDataService.fetchHistoricalData(futureRequest)
       ).isInstanceOf(ValidationException.class);
       
       // Test from_date after to_date
       HistoricalDataRequest invalidRangeRequest = HistoricalDataRequest.builder()
           .instrumentToken("12345")
           .exchange("NSE")
           .fromDate(pastDate)
           .toDate(pastDate.minusDays(1))
           .interval(CandleInterval.DAY)
           .build();
       
       assertThatThrownBy(() -> 
           historicalDataService.fetchHistoricalData(invalidRangeRequest)
       ).isInstanceOf(ValidationException.class);
   }
   ```

### Integration Testing

Integration tests will verify end-to-end workflows using Spring Boot Test:

1. **Complete Instrument Import Flow**
   - Test full import from mocked Kite API to database
   - Verify all instruments are stored correctly
   - Verify logging output contains expected information
   - Use @SpringBootTest with TestContainers for PostgreSQL

2. **Historical Data Fetch Flow**
   - Test fetching historical data for single instrument
   - Test batch fetching for multiple instruments
   - Verify data is stored in TimescaleDB hypertable
   - Verify rate limiting is respected

3. **Error Handling Integration**
   - Test authentication failure handling
   - Test API error handling with retries
   - Test database error handling with rollback
   - Test rate limit handling with backoff

4. **Async Execution and Job Tracking**
   - Test async job execution
   - Test job status tracking
   - Test concurrent job execution
   - Verify thread pool configuration


## Configuration

### Application Configuration (`application.yml`)

```yaml
kite:
  api:
    key: ${KITE_API_KEY}
    secret: ${KITE_API_SECRET}
    access-token: ${KITE_ACCESS_TOKEN}
    base-url: https://api.kite.trade
  
  ingestion:
    batch-size: 1000
    parallel-requests: 5
    rate-limit:
      requests-per-second: 3
      burst-capacity: 10
    retry:
      max-attempts: 3
      initial-delay-ms: 1000
      multiplier: 2.0
    circuit-breaker:
      failure-rate-threshold: 50
      wait-duration-seconds: 60
      sliding-window-size: 10

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/moneyplant
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        jdbc:
          batch_size: 1000
        order_inserts: true
        order_updates: true
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
  
  task:
    execution:
      pool:
        core-size: 5
        max-size: 10
        queue-capacity: 100
      thread-name-prefix: kite-ingestion-

logging:
  level:
    com.moneyplant.engines.ingestion.kite: DEBUG
    com.zerodhatech.kiteconnect: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/kite-ingestion.log
    max-size: 10MB
    max-history: 30

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### Configuration Properties Class

```java
@Configuration
@ConfigurationProperties(prefix = "kite")
@Validated
@Data
public class KiteIngestionConfig {
    
    @NotNull
    private ApiConfig api;
    
    @NotNull
    private IngestionConfig ingestion;
    
    @Data
    public static class ApiConfig {
        @NotBlank
        private String key;
        
        @NotBlank
        private String secret;
        
        @NotBlank
        private String accessToken;
        
        @NotBlank
        private String baseUrl = "https://api.kite.trade";
    }
    
    @Data
    public static class IngestionConfig {
        @Min(100)
        @Max(10000)
        private int batchSize = 1000;
        
        @Min(1)
        @Max(20)
        private int parallelRequests = 5;
        
        @NotNull
        private RateLimitConfig rateLimit;
        
        @NotNull
        private RetryConfig retry;
        
        @NotNull
        private CircuitBreakerConfig circuitBreaker;
    }
    
    @Data
    public static class RateLimitConfig {
        @Min(1)
        private int requestsPerSecond = 3;
        
        @Min(1)
        private int burstCapacity = 10;
    }
    
    @Data
    public static class RetryConfig {
        @Min(1)
        @Max(10)
        private int maxAttempts = 3;
        
        @Min(100)
        private long initialDelayMs = 1000;
        
        @Min(1)
        private double multiplier = 2.0;
    }
    
    @Data
    public static class CircuitBreakerConfig {
        @Min(1)
        @Max(100)
        private int failureRateThreshold = 50;
        
        @Min(1)
        private long waitDurationSeconds = 60;
        
        @Min(1)
        private int slidingWindowSize = 10;
    }
}
```

### Async Configuration

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean(name = "kiteIngestionExecutor")
    public ThreadPoolTaskExecutor kiteIngestionExecutor(KiteIngestionConfig config) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("kite-ingestion-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}
```

## Database Schema (Flyway Migration)

### Migration Script: `V1__create_kite_tables.sql`

```sql
-- Create kite_instrument_master table
CREATE TABLE IF NOT EXISTS kite_instrument_master (
    instrument_token VARCHAR(50) NOT NULL,
    exchange_token VARCHAR(50),
    tradingsymbol VARCHAR(100) NOT NULL,
    name VARCHAR(255),
    last_price FLOAT8,
    expiry DATE,
    strike FLOAT8,
    tick_size FLOAT8,
    lot_size INTEGER,
    instrument_type VARCHAR(10),
    segment VARCHAR(20),
    exchange VARCHAR(10) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (instrument_token, exchange)
);

-- Indexes for kite_instrument_master
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_tradingsymbol 
    ON kite_instrument_master(tradingsymbol);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_exchange 
    ON kite_instrument_master(exchange);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_instrument_type 
    ON kite_instrument_master(instrument_type);
    
CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_segment 
    ON kite_instrument_master(segment);

-- Create kite_ohlcv_historic table
CREATE TABLE IF NOT EXISTS kite_ohlcv_historic (
    instrument_token VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    open FLOAT8 NOT NULL,
    high FLOAT8 NOT NULL,
    low FLOAT8 NOT NULL,
    close FLOAT8 NOT NULL,
    volume BIGINT NOT NULL,
    candle_interval VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (instrument_token, exchange, date, candle_interval)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable(
    'kite_ohlcv_historic',
    'date',
    if_not_exists => TRUE,
    migrate_data => TRUE,
    chunk_time_interval => INTERVAL '7 days'
);

-- Indexes for kite_ohlcv_historic
CREATE INDEX IF NOT EXISTS idx_ohlcv_instrument_token_date 
    ON kite_ohlcv_historic(instrument_token, date DESC);

CREATE INDEX IF NOT EXISTS idx_ohlcv_exchange_date 
    ON kite_ohlcv_historic(exchange, date DESC);

CREATE INDEX IF NOT EXISTS idx_ohlcv_candle_interval_date 
    ON kite_ohlcv_historic(candle_interval, date DESC);

CREATE INDEX IF NOT EXISTS idx_ohlcv_instrument_exchange_interval 
    ON kite_ohlcv_historic(instrument_token, exchange, candle_interval, date DESC);

-- Enable compression for older data (optional, for performance)
ALTER TABLE kite_ohlcv_historic SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'instrument_token, exchange, candle_interval'
);

-- Add compression policy (compress data older than 30 days)
SELECT add_compression_policy('kite_ohlcv_historic', INTERVAL '30 days');
```

## Dependencies (pom.xml additions)

```xml
<dependencies>
    <!-- KiteConnect Java Library -->
    <dependency>
        <groupId>com.zerodhatech.kiteconnect</groupId>
        <artifactId>kiteconnect</artifactId>
        <version>3.2.0</version>
    </dependency>
    
    <!-- Resilience4j for retry, rate limiting, circuit breaker -->
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-spring-boot2</artifactId>
        <version>2.1.0</version>
    </dependency>
    
    <!-- jqwik for property-based testing -->
    <dependency>
        <groupId>net.jqwik</groupId>
        <artifactId>jqwik</artifactId>
        <version>1.7.4</version>
        <scope>test</scope>
    </dependency>
    
    <!-- TestContainers for integration testing -->
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Performance Optimizations

1. **Batch Processing**: Use JDBC batch operations with batch size of 1000 for bulk inserts
2. **Parallel Execution**: Use CompletableFuture for concurrent API calls with configurable parallelism
3. **Connection Pooling**: HikariCP with optimized pool size (20 max, 5 min idle)
4. **JPA Optimizations**: Enable batch inserts, order inserts/updates for better performance
5. **TimescaleDB**: Use hypertables with 7-day chunks, compression for older data
6. **Indexes**: Composite indexes optimized for common query patterns
7. **Rate Limiting**: Prevent API throttling with Resilience4j rate limiter
8. **Async Execution**: Non-blocking operations with dedicated thread pool

