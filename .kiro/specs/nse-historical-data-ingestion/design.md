# NSE Historical Data Ingestion with Corporate Actions - Design Document

## Overview

This design document describes the architecture and implementation approach for the NSE Historical Data Ingestion service. The service focuses on downloading and storing raw OHLCV data from NSE bhavcopy files.

**Scope:**
- Download NSE bhavcopy CSV files for a date range
- Parse CSV data in-memory (no intermediate file storage)
- Store raw OHLCV data in `nse_eq_ohlcv_historic` table
- Keep data exactly as provided by NSE (no calculations or adjustments)

**Out of Scope (Future Specs):**
- Corporate actions management
- Adjusted close calculations
- Derived metrics (VWAP, 52-week high/low)
- Technical indicators

This focused approach allows for:
- Simple, reliable raw data ingestion
- Clean separation of data acquisition from calculations
- Ability to add calculations later without re-downloading
- Easier debugging and validation

### Design Principles

1. **Raw Data Only**: Store data exactly as provided by NSE without modifications
2. **In-Memory Processing**: Process CSV data in memory without intermediate file storage
3. **Batch Operations**: Use batch inserts for optimal database performance
4. **Reactive Streams**: Leverage Project Reactor for non-blocking I/O
5. **Reuse Existing Infrastructure**: Integrate with existing Ingestion Engine components
6. **Fault Tolerance**: Implement retry mechanisms and graceful error handling
7. **Observability**: Comprehensive logging and progress tracking

### Key Design Decisions

- **Leverage Existing Architecture**: Extend the existing `engines/src/main/java/com/moneyplant/engines/ingestion/` structure
- **Reuse Existing Entities**: Use `NseEquityMaster` and create new entities for OHLCV and corporate actions
- **In-Memory ZIP Processing**: Use Java's ZipInputStream to extract and parse CSV without disk I/O
- **Reactive Pipeline**: Use Flux/Mono for streaming data processing
- **Batch Database Operations**: Use JDBC batch inserts with configurable batch size
- **Corporate Actions Table**: Create new table for managing corporate actions data
- **Async Job Execution**: Use Spring's @Async for non-blocking API responses

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              NSE Historical Data Ingestion Service               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              NSE Bhavcopy Downloader                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │   HTTP   │  │   ZIP    │  │   CSV    │              │  │
│  │  │ Download │  │ Extract  │  │  Parser  │              │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘              │  │
│  └───────┼─────────────┼─────────────┼────────────────────┘  │
│          │             │             │                          │
│  ┌───────▼─────────────▼─────────────▼────────────────────┐  │
│  │           Data Normalization & Validation              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  Schema  │  │  Data    │  │  Type    │            │  │
│  │  │ Mapping  │  │Validator │  │Converter │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └───────┬──────────────────────────────────────────────┘  │
│          │                                                     │
│  ┌───────▼──────────────────────────────────────────────┐  │
│  │              Storage Layer                            │  │
│  │  ┌──────────┐  ┌──────────┐                          │  │
│  │  │TimescaleDB│ │   Job    │                          │  │
│  │  │  (OHLCV) │  │ Tracking │                          │  │
│  │  └──────────┘  └──────────┘                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```


### Component Architecture

```
engines/src/main/java/com/moneyplant/engines/ingestion/
├── historical/
│   ├── service/
│   │   ├── NseBhavCopyIngestionService.java       # Raw data ingestion orchestration
│   │   ├── SparkProcessingService.java            # Spark CSV processing and bulk insert
│   │   └── HistoricalDataJobService.java          # Job tracking and management
│   ├── provider/
│   │   └── NseBhavCopyDownloader.java             # Download bhav copy files
│   ├── repository/
│   │   ├── HistoricalOhlcvRepository.java         # Raw data repository
│   │   └── IngestionJobRepository.java            # Job tracking repository
│   ├── model/
│   │   ├── BhavCopyData.java                      # Raw OHLCV data model
│   │   ├── IngestionJob.java                      # Job entity
│   │   ├── IngestionJobStatus.java                # Job status enum
│   │   └── IngestionResult.java                   # Job result summary
│   ├── controller/
│   │   └── HistoricalIngestionController.java     # REST API endpoints
│   └── config/
│       ├── HistoricalIngestionConfig.java         # Configuration properties
│       └── SparkConfig.java                       # Spark session configuration


## Components and Interfaces

### 1. NSE Bhavcopy Downloader

#### NseBhavCopyDownloader

**Responsibilities**:
- Download bhavcopy ZIP files from NSE for a date range
- Handle NSE session initialization with cookies
- Implement retry logic with exponential backoff
- Extract ZIP files in-memory
- Rate limiting between downloads

**Key Methods**:
```java
public interface NseBhavCopyDownloader {
    Flux<BhavCopyData> downloadAndParse(LocalDate startDate, LocalDate endDate);
    Mono<byte[]> downloadBhavCopy(LocalDate date);
    Mono<Void> initializeNseSession();
}
```

**Implementation Details**:
- Use WebClient for HTTP requests with custom headers
- URL format: `https://www.nseindia.com/content/historical/EQUITIES/{year}/{month}/cm{DDMMMYYYY}bhav.csv.zip`
- Required headers: User-Agent, Referer, Accept
- Initialize session by visiting NSE homepage to set cookies
- Retry up to 6 times with exponential backoff (1s, 2s, 4s, 8s, 16s, 32s)
- 300ms delay between consecutive downloads
- Handle 404 as missing data (weekend/holiday)
- Extract ZIP file and save CSV to staging directory (e.g., `/tmp/bhav_staging/{jobId}/`)
- Use filename format: `bhav_{YYYYMMDD}.csv`

#### SparkProcessingService

**Responsibilities**:
- Process all downloaded CSV files using Apache Spark
- Apply schema mapping and data transformations
- Filter symbols based on universe or explicit list
- Perform bulk insert to PostgreSQL using Spark JDBC writer
- Clean up temporary files after processing

**Key Methods**:
```java
public interface SparkProcessingService {
    Mono<IngestionResult> processAndStore(Path stagingDirectory);
}
```

**Spark Processing Flow**:
```java
@Service
@Slf4j
public class SparkProcessingServiceImpl implements SparkProcessingService {
    
    @Autowired
    private SparkSession spark;
    
    @Value("${spring.datasource.url}")
    private String jdbcUrl;
    
    @Value("${spring.datasource.username}")
    private String dbUser;
    
    @Value("${spring.datasource.password}")
    private String dbPassword;
    
    public Mono<IngestionResult> processAndStore(Path stagingDirectory) {
        
        return Mono.fromCallable(() -> {
            log.info("Starting Spark processing for staging directory: {}", stagingDirectory);
            
            // 1. Read all CSV files from staging directory
            Dataset<Row> df = spark.read()
                .option("header", "true")
                .option("inferSchema", "true")
                .csv(stagingDirectory.toString() + "/*.csv");
            
            long totalRecords = df.count();
            log.info("Read {} records from CSV files", totalRecords);
            
            // 2. Apply schema mapping and transformations
            Dataset<Row> transformed = df
                .withColumnRenamed("SYMBOL", "symbol")
                .withColumnRenamed("SERIES", "series")
                .withColumn("time", to_timestamp(col("DATE1"), "dd-MMM-yyyy"))
                .withColumnRenamed("PREV_CLOSE", "prev_close")
                .withColumnRenamed("OPEN_PRICE", "open")
                .withColumnRenamed("HIGH_PRICE", "high")
                .withColumnRenamed("LOW_PRICE", "low")
                .withColumnRenamed("LAST_PRICE", "last")
                .withColumnRenamed("CLOSE_PRICE", "close")
                .withColumnRenamed("AVG_PRICE", "avg_price")
                .withColumnRenamed("TTL_TRD_QNTY", "volume")
                .withColumnRenamed("TURNOVER_LACS", "turnover_lacs")
                .withColumnRenamed("NO_OF_TRADES", "no_of_trades")
                .withColumnRenamed("DELIV_QTY", "deliv_qty")
                .withColumnRenamed("DELIV_PER", "deliv_per")
                .withColumn("timeframe", lit("1day"))
                .select("time", "symbol", "series", "timeframe", "prev_close", 
                       "open", "high", "low", "last", "close", "avg_price",
                       "volume", "turnover_lacs", "no_of_trades", "deliv_qty", "deliv_per");
            
            // 3. Bulk insert to PostgreSQL using Spark JDBC writer
            log.info("Writing {} records to PostgreSQL", totalRecords);
            transformed.write()
                .mode(SaveMode.Append)
                .format("jdbc")
                .option("url", jdbcUrl)
                .option("dbtable", "nse_eq_ohlcv_historic")
                .option("user", dbUser)
                .option("password", dbPassword)
                .option("batchsize", "10000")
                .option("numPartitions", "4")
                .option("driver", "org.postgresql.Driver")
                .save();
            
            log.info("Successfully inserted {} records", totalRecords);
            
            // 4. Return result
            return new IngestionResult(totalRecords, totalRecords, 0);
            
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
```

**CSV Column Mapping**:
```
SYMBOL -> symbol
SERIES -> series
DATE1 -> time (converted to TIMESTAMPTZ)
PREV_CLOSE -> prev_close
OPEN_PRICE -> open
HIGH_PRICE -> high
LOW_PRICE -> low
LAST_PRICE -> last
CLOSE_PRICE -> close
AVG_PRICE -> avg_price
TTL_TRD_QNTY -> volume
TURNOVER_LACS -> turnover_lacs
NO_OF_TRADES -> no_of_trades
DELIV_QTY -> deliv_qty
DELIV_PER -> deliv_per
```

### 2. Storage Layer

#### Database Schema Updates

**Keep nse_eq_ohlcv_historic table minimal (raw bhav copy data only)**:
```sql
-- Remove created_at and updated_at columns if they exist
ALTER TABLE nse_eq_ohlcv_historic 
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_time 
    ON nse_eq_ohlcv_historic(symbol, time DESC);
```

**nse_eq_ohlcv_historic table structure (raw data only)**:
```sql
-- Stores raw OHLCV data exactly as provided by NSE bhav copy
CREATE TABLE IF NOT EXISTS nse_eq_ohlcv_historic (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    series VARCHAR(10) NOT NULL,
    timeframe VARCHAR(10) NOT NULL DEFAULT '1day',
    prev_close NUMERIC(18,4),
    open NUMERIC(18,4) NOT NULL,
    high NUMERIC(18,4) NOT NULL,
    low NUMERIC(18,4) NOT NULL,
    last NUMERIC(18,4),
    close NUMERIC(18,4) NOT NULL,
    avg_price NUMERIC(18,4),
    volume BIGINT NOT NULL,
    turnover_lacs NUMERIC(20,2),
    no_of_trades INTEGER,
    deliv_qty BIGINT,
    deliv_per NUMERIC(5,2),
    PRIMARY KEY (time, symbol, timeframe)
);

-- Remove created_at and updated_at columns if they exist
ALTER TABLE nse_eq_ohlcv_historic 
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_time 
    ON nse_eq_ohlcv_historic(symbol, time DESC);
CREATE INDEX IF NOT EXISTS idx_ohlcv_series 
    ON nse_eq_ohlcv_historic(series);
```



#### HistoricalOhlcvRepository

**Responsibilities**:
- Batch insert raw OHLCV data into nse_eq_ohlcv_historic table
- Implement upsert logic for duplicate handling
- Query historical data with filters

**Key Methods**:
```java
public interface HistoricalOhlcvRepository {
    Mono<Integer> batchInsertRawData(List<BhavCopyData> data);
    Flux<BhavCopyData> findBySymbolAndDateRange(
        String symbol, 
        LocalDate start, 
        LocalDate end
    );
    Flux<BhavCopyData> findBySymbol(String symbol);
    Mono<LocalDate> getMaxDateForSymbol(String symbol);
}
```

**Query Implementation**:
```java
public Mono<LocalDate> getMaxDateForSymbol(String symbol) {
    String sql = """
        SELECT MAX(time)::date as max_date 
        FROM nse_eq_ohlcv_historic 
        WHERE symbol = ? AND timeframe = '1day'
        """;
    
    return Mono.fromCallable(() -> {
        return jdbcTemplate.queryForObject(sql, LocalDate.class, symbol);
    }).subscribeOn(Schedulers.boundedElastic());
}
```

**Batch Insert Implementation (Raw Data)**:
```java
// Use JDBC batch operations with ON CONFLICT
String sql = """
    INSERT INTO nse_eq_ohlcv_historic 
    (time, symbol, series, timeframe, prev_close, open, high, low, last, close, 
     avg_price, volume, turnover_lacs, no_of_trades, deliv_qty, deliv_per)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (time, symbol, timeframe) 
    DO UPDATE SET
        series = EXCLUDED.series,
        prev_close = EXCLUDED.prev_close,
        open = EXCLUDED.open,
        high = EXCLUDED.high,
        low = EXCLUDED.low,
        last = EXCLUDED.last,
        close = EXCLUDED.close,
        avg_price = EXCLUDED.avg_price,
        volume = EXCLUDED.volume,
        turnover_lacs = EXCLUDED.turnover_lacs,
        no_of_trades = EXCLUDED.no_of_trades,
        deliv_qty = EXCLUDED.deliv_qty,
        deliv_per = EXCLUDED.deliv_per
    """;

// Process in batches of 1000 records
```

### 3. Job Management

#### IngestionJob Entity

**Database Schema**:
```sql
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL UNIQUE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    symbols TEXT,
    include_corporate_actions BOOLEAN DEFAULT true,
    total_dates INTEGER,
    processed_dates INTEGER DEFAULT 0,
    total_records INTEGER DEFAULT 0,
    inserted_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'TIMEOUT'))
);

CREATE INDEX idx_ingestion_jobs_job_id ON ingestion_jobs(job_id);
CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs(status);
```

**Java Entity**:
```java
@Entity
@Table(name = "ingestion_jobs")
@Data
@Builder
public class IngestionJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "job_id", nullable = false, unique = true, length = 36)
    private String jobId;
    
    @Column(name = "job_type", nullable = false, length = 50)
    private String jobType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IngestionJobStatus status;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(columnDefinition = "TEXT")
    private String symbols;
    

    
    @Column(name = "total_dates")
    private Integer totalDates;
    
    @Column(name = "processed_dates")
    private Integer processedDates;
    
    @Column(name = "total_records")
    private Integer totalRecords;
    
    @Column(name = "inserted_records")
    private Integer insertedRecords;
    
    @Column(name = "failed_records")
    private Integer failedRecords;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "started_at", nullable = false)
    private Instant startedAt;
    
    @Column(name = "completed_at")
    private Instant completedAt;
}

public enum IngestionJobStatus {
    PENDING, RUNNING, COMPLETED, FAILED, TIMEOUT
}
```

### 4. Service Layer

#### DateRangeResolver

**Responsibilities**:
- Determine appropriate date range for ingestion based on existing data
- Query `nse_eq_ohlcv_historic` for existing data range
- Support incremental ingestion

**Key Methods**:
```java
public interface DateRangeResolver {
    Mono<DateRange> resolveDateRange(
        LocalDate startDate, 
        LocalDate endDate
    );
}

@Data
public class DateRange {
    private LocalDate start;
    private LocalDate end;
}
```

**Resolution Logic**:
```java
@Service
@Slf4j
public class DateRangeResolverImpl implements DateRangeResolver {
    
    private static final LocalDate DEFAULT_START_DATE = LocalDate.of(1998, 1, 1);
    
    @Autowired
    private HistoricalOhlcvRepository ohlcvRepository;
    
    public Mono<DateRange> resolveDateRange(
            LocalDate startDate, 
            LocalDate endDate) {
        
        LocalDate effectiveEndDate = endDate != null ? endDate : LocalDate.now();
        
        // If both dates provided explicitly, use them
        if (startDate != null) {
            log.info("Using explicit date range: {} to {}", startDate, effectiveEndDate);
            return Mono.just(new DateRange(startDate, effectiveEndDate));
        }
        
        // Otherwise, check for existing data
        return ohlcvRepository.getMaxDate()
            .flatMap(maxDate -> {
                // Incremental ingestion: start from day after max date
                LocalDate incrementalStart = maxDate.plusDays(1);
                
                if (incrementalStart.isAfter(effectiveEndDate)) {
                    log.info("Data already up to date (max date: {})", maxDate);
                    return Mono.just(new DateRange(effectiveEndDate, effectiveEndDate)); // Empty range
                }
                
                log.info("Incremental ingestion from {} to {}", incrementalStart, effectiveEndDate);
                return Mono.just(new DateRange(incrementalStart, effectiveEndDate));
            })
            .switchIfEmpty(Mono.defer(() -> {
                // No existing data, use default start date
                log.info("Full ingestion from {} to {}", DEFAULT_START_DATE, effectiveEndDate);
                return Mono.just(new DateRange(DEFAULT_START_DATE, effectiveEndDate));
            }));
    }
}
```

#### NseBhavCopyIngestionService

**Responsibilities**:
- Orchestrate the complete ingestion pipeline
- Resolve date range using DateRangeResolver
- Download bhavcopy files to staging directory
- Trigger Spark processing for bulk insert
- Track job progress and update status
- Clean up staging directory after processing
- Handle errors and implement retry logic

**Core Flow**:
```java
@Service
@Slf4j
public class NseBhavCopyIngestionService {
    
    @Autowired
    private DateRangeResolver dateRangeResolver;
    
    @Autowired
    private NseBhavCopyDownloader downloader;
    
    @Autowired
    private SparkProcessingService sparkProcessor;
    
    @Autowired
    private HistoricalDataJobService jobService;
    
    @Value("${ingestion.nse.historical.staging-directory}")
    private String stagingBaseDir;
    
    public Mono<String> startIngestion(
            LocalDate startDate, 
            LocalDate endDate) {
        
        String jobId = UUID.randomUUID().toString();
        
        // 1. Resolve date range
        return dateRangeResolver.resolveDateRange(startDate, endDate)
            .flatMap(dateRange -> {
                // 2. Create job record
                return jobService.createJob(jobId, dateRange)
                    .flatMap(job -> {
                        // 3. Execute asynchronously
                        executeIngestionAsync(job, dateRange);
                        return Mono.just(jobId);
                    });
            });
    }
    
    @Async
    private void executeIngestionAsync(
            IngestionJob job, 
            DateRange dateRange) {
        
        Path stagingDir = Paths.get(stagingBaseDir, job.getJobId());
        
        jobService.updateStatus(job.getJobId(), IngestionJobStatus.RUNNING)
            .then(performIngestion(job, dateRange, stagingDir))
            .doOnSuccess(result -> {
                cleanupStagingDirectory(stagingDir);
                jobService.completeJob(job.getJobId(), result);
            })
            .doOnError(error -> {
                cleanupStagingDirectory(stagingDir);
                jobService.failJob(job.getJobId(), error.getMessage());
            })
            .subscribe();
    }
    
    private Mono<IngestionResult> performIngestion(
            IngestionJob job, 
            DateRange dateRange,
            Path stagingDir) {
        
        // 1. Download bhavcopy files to staging directory
        // Each file contains ALL symbols for that date
        log.info("Downloading bhavcopy files from {} to {}", 
            dateRange.getStart(), dateRange.getEnd());
        
        return downloader.downloadToStaging(
                dateRange.getStart(), dateRange.getEnd(), stagingDir)
            .then(Mono.defer(() -> {
                // 2. Process all CSV files using Spark and bulk insert
                log.info("Starting Spark processing for staging directory: {}", stagingDir);
                return sparkProcessor.processAndStore(stagingDir);
            }));
    }
    
    private void cleanupStagingDirectory(Path stagingDir) {
        try {
            if (Files.exists(stagingDir)) {
                Files.walk(stagingDir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            log.warn("Failed to delete: {}", path, e);
                        }
                    });
                log.info("Cleaned up staging directory: {}", stagingDir);
            }
        } catch (IOException e) {
            log.error("Failed to cleanup staging directory: {}", stagingDir, e);
        }
    }
        
        // 3. Batch insert raw data to nse_eq_ohlcv_historic table
        return rawData
            .buffer(1000)  // Batch size
            .flatMap(batch -> ohlcvRepository.batchInsertRawData(batch)
                .doOnNext(count -> jobService.updateProgress(
                    job.getJobId(), batch.size(), count)))
            .reduce(new IngestionResult(), IngestionResult::merge);
    }
}
```

#### HistoricalDataJobService

**Responsibilities**:
- Manage ingestion job lifecycle
- Track job progress and statistics
- Provide job status queries

**Key Methods**:
```java
public interface HistoricalDataJobService {
    Mono<IngestionJob> createJob(
        String jobId, 
        LocalDate startDate, 
        LocalDate endDate,
        Set<String> symbols
    );
    
    Mono<Void> updateStatus(String jobId, IngestionJobStatus status);
    Mono<Void> updateProgress(String jobId, int processed, int inserted);
    Mono<Void> completeJob(String jobId, IngestionResult result);
    Mono<Void> failJob(String jobId, String errorMessage);
    Mono<IngestionJob> getJob(String jobId);
}
```

### 5. REST API Layer

#### HistoricalIngestionController

**Endpoints**:

1. **Start Ingestion**:
```java
@PostMapping("/api/v1/ingestion/historical/nse")
public Mono<ResponseEntity<IngestionJobResponse>> startIngestion(
        @RequestBody IngestionRequest request) {
    
    return ingestionService.startIngestion(
            request.getStartDate(),
            request.getEndDate(),
            request.getSymbols(),
            request.isIncludeCorporateActions())
        .map(jobId -> ResponseEntity.ok(
            new IngestionJobResponse(jobId, "Job started successfully")));
}
```

2. **Get Job Status**:
```java
@GetMapping("/api/v1/ingestion/historical/nse/{jobId}")
public Mono<ResponseEntity<IngestionJobStatus>> getJobStatus(
        @PathVariable String jobId) {
    
    return jobService.getJob(jobId)
        .map(job -> ResponseEntity.ok(toJobStatusResponse(job)))
        .defaultIfEmpty(ResponseEntity.notFound().build());
}
```

**Request/Response DTOs**:
```java
@Data
public class IngestionRequest {
    private LocalDate startDate;  // Optional - if not provided, uses incremental ingestion
    
    private LocalDate endDate;    // Optional - if not provided, uses current date
}

@Data
public class IngestionJobResponse {
    private String jobId;
    private String message;
    private IngestionJobStatus status;
    private Integer progressPercentage;
    private LocalDate currentDate;
    private Integer totalRecords;
    private Integer insertedRecords;
    private Integer failedRecords;
    private String errorMessage;
}
```

## Data Models

### BhavCopyData

```java
@Data
@Builder
public class BhavCopyData {
    private String symbol;
    private String series;
    private LocalDate date;              // Parsed from DATE1
    private Instant time;                // Converted to TIMESTAMPTZ
    private BigDecimal prevClose;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal last;
    private BigDecimal close;
    private BigDecimal avgPrice;
    private Long volume;                 // TTL_TRD_QNTY
    private BigDecimal turnoverLacs;     // TURNOVER_LACS
    private Integer noOfTrades;
    private Long delivQty;
    private BigDecimal delivPer;
}
```

### IngestionResult

```java
@Data
@Builder
public class IngestionResult {
    private int totalDatesProcessed;
    private int totalRecordsProcessed;
    private int totalRecordsInserted;
    private int totalRecordsFailed;
    private Duration duration;
    
    public IngestionResult merge(IngestionResult other) {
        return IngestionResult.builder()
            .totalDatesProcessed(this.totalDatesProcessed + other.totalDatesProcessed)
            .totalRecordsProcessed(this.totalRecordsProcessed + other.totalRecordsProcessed)
            .totalRecordsInserted(this.totalRecordsInserted + other.totalRecordsInserted)
            .totalRecordsFailed(this.totalRecordsFailed + other.totalRecordsFailed)
            .duration(this.duration.plus(other.duration))
            .build();
    }
}
```

## Configuration

### application.yml

```yaml
ingestion:
  nse:
    historical:
      base-url: https://www.nseindia.com
      download-delay-ms: 300
      max-retries: 6
      retry-backoff-multiplier: 2.0
      job-timeout-hours: 6
      concurrent-dates: 5
      staging-directory: /tmp/bhav_staging
      
spark:
  app-name: NSE-Bhav-Ingestion
  master: local[*]  # Use all available cores
  executor-memory: 4g
  driver-memory: 2g
  sql:
    shuffle-partitions: 8
  jdbc:
    batch-size: 10000
    num-partitions: 4
      
spring:
  task:
    execution:
      pool:
        core-size: 10
        max-size: 20
        queue-capacity: 100
```

### SparkConfig

```java
@Configuration
public class SparkConfig {
    
    @Value("${spark.app-name}")
    private String appName;
    
    @Value("${spark.master}")
    private String master;
    
    @Value("${spark.executor-memory}")
    private String executorMemory;
    
    @Value("${spark.driver-memory}")
    private String driverMemory;
    
    @Bean
    public SparkSession sparkSession() {
        return SparkSession.builder()
            .appName(appName)
            .master(master)
            .config("spark.executor.memory", executorMemory)
            .config("spark.driver.memory", driverMemory)
            .config("spark.sql.shuffle.partitions", "8")
            .config("spark.sql.adaptive.enabled", "true")
            .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
            .getOrCreate();
    }
    
    @PreDestroy
    public void cleanup() {
        if (sparkSession() != null) {
            sparkSession().stop();
        }
    }
}
```

## Error Handling

### Retry Strategy

```java
@Configuration
public class RetryConfig {
    
    @Bean
    public Retry downloadRetry() {
        return Retry.fixedDelay(6, Duration.ofSeconds(1))
            .filter(throwable -> throwable instanceof WebClientException)
            .doBeforeRetry(signal -> 
                log.warn("Retrying download, attempt: {}", signal.totalRetries()));
    }
}
```

### Error Scenarios

1. **Network Errors**: Retry up to 6 times with exponential backoff
2. **404 Not Found**: Skip date (weekend/holiday), log info message
3. **CSV Parse Errors**: Skip invalid row, log warning, continue processing
4. **Database Errors**: Retry batch insert up to 3 times, fail job if still failing
5. **Timeout**: Cancel job after configured timeout (default 6 hours)

## Performance Considerations

1. **Batch Processing**: Insert 1000 records per batch for optimal performance
2. **Reactive Streams**: Use Flux for streaming data processing to handle large datasets
3. **Parallel Processing**: Process up to 5 dates concurrently (configurable)
4. **Database Indexes**: Ensure indexes on (symbol, time) for fast queries
5. **Connection Pooling**: Configure HikariCP with appropriate pool size
6. **Memory Management**: Stream processing to avoid loading entire dataset in memory

## Testing Strategy

1. **Unit Tests**: Test individual components (parser, adjuster, calculator)
2. **Integration Tests**: Test database operations with Testcontainers
3. **End-to-End Tests**: Test complete ingestion flow with sample data
4. **Performance Tests**: Verify batch insert performance and memory usage
5. **Error Handling Tests**: Verify retry logic and error recovery

