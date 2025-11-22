# Kite Ingestion System

## Overview

The Kite Ingestion System is a high-performance Java-based data pipeline built with Spring Boot that fetches market data from Zerodha's Kite Connect API and stores it in PostgreSQL with TimescaleDB extensions.

## Implementation Status

### ✅ Completed (Tasks 1-9, 15-16)

1. **Project Structure & Dependencies**
   - KiteConnect Java library (v3.2.0)
   - Resilience4j for retry/rate limiting/circuit breaker
   - jqwik for property-based testing
   - TestContainers for integration testing

2. **Database Schema**
   - Flyway migration V4__create_kite_tables.sql
   - `kite_instrument_master` table with composite primary key
   - `kite_ohlcv_historic` TimescaleDB hypertable
   - Optimized indexes and compression policies

3. **Data Models**
   - JPA entities: `KiteInstrumentMaster`, `KiteOhlcvHistoric`
   - Composite key classes with proper equals/hashCode
   - Enums: `CandleInterval`, `JobStatus`, `Exchange`
   - DTOs: Request/Response objects with validation

4. **Repositories**
   - Spring Data JPA repositories with custom queries
   - `KiteBatchRepository` for high-performance JDBC batch operations

5. **Configuration**
   - `KiteIngestionConfig` with @ConfigurationProperties
   - `application-kite.yml` with all settings
   - `.env.example` template

6. **Exception Handling**
   - Custom exceptions for different error scenarios
   - Global exception handler with appropriate HTTP status codes

7. **Property Tests**
   - Idempotent table creation test
   - Upsert idempotence, composite key uniqueness, count accuracy tests

### 🚧 Remaining Tasks (10-14, 17-20)

The following components need to be implemented:

#### Task 10: KiteConnect Client Wrapper
- Wrapper around com.zerodhatech.kiteconnect library
- Resilience4j annotations for retry/rate limiting
- Methods: `getInstruments()`, `getHistoricalData()`
- 3 property tests

#### Task 11: Job Tracking Service
- In-memory job tracking with ConcurrentHashMap
- Methods: `startJob()`, `completeJob()`, `failJob()`, `getJobStatus()`
- 1 property test

#### Task 12: Instrument Service
- Async instrument import with @Async annotation
- Transform Kite API data to JPA entities
- Batch upsert using KiteBatchRepository
- Calculate summary statistics
- 8 property tests

#### Task 13: Historical Data Service
- Async historical data fetching
- Batch processing for multiple instruments
- Parallel execution with rate limiting
- 3 property tests

#### Task 14: REST API Controller
- POST /api/ingestion/kite/instruments
- POST /api/ingestion/kite/historical
- POST /api/ingestion/kite/historical/batch
- GET /api/ingestion/kite/status/{jobId}
- 1 integration test

#### Tasks 17-20: Testing & Documentation
- Checkpoint tests
- Integration tests
- End-to-end testing
- Documentation

## Quick Start (Once Implementation Complete)

### Prerequisites
- Java 21
- PostgreSQL with TimescaleDB extension
- Kite Connect API credentials

### Configuration

1. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp engines/.env.example engines/.env
```

2. Update `engines/.env` with your Kite API credentials

### Running the Application

```bash
cd engines
mvn spring-boot:run
```

### API Endpoints

#### Import Instruments
```bash
curl -X POST http://localhost:8080/api/ingestion/kite/instruments \
  -H "Content-Type: application/json" \
  -d '{"exchanges": ["NSE", "BSE"]}'
```

#### Fetch Historical Data
```bash
curl -X POST http://localhost:8080/api/ingestion/kite/historical \
  -H "Content-Type: application/json" \
  -d '{
    "instrumentToken": "738561",
    "exchange": "NSE",
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31",
    "interval": "DAY"
  }'
```

#### Check Job Status
```bash
curl http://localhost:8080/api/ingestion/kite/status/{jobId}
```

## Architecture

### Package Structure
```
com.moneyplant.engines.ingestion.kite/
├── api/                    # REST controllers
├── service/                # Business logic
│   └── impl/              # Service implementations
├── client/                # Kite API client wrapper
├── repository/            # Data access layer
├── model/
│   ├── entity/           # JPA entities
│   ├── dto/              # Data transfer objects
│   └── enums/            # Enumerations
├── config/               # Configuration classes
└── exception/            # Custom exceptions
```

### Database Tables

#### kite_instrument_master
Stores master data for all tradable instruments.
- Primary Key: (instrument_token, exchange)
- Indexes: tradingsymbol, exchange, instrument_type, segment

#### kite_ohlcv_historic
TimescaleDB hypertable for historical OHLCV data.
- Primary Key: (instrument_token, exchange, date, candle_interval)
- Partitioned by date (7-day chunks)
- Compression enabled for data older than 30 days

## Performance Features

- **Batch Processing**: 1000 records per batch using JDBC
- **Parallel Execution**: Configurable parallel requests (default: 5)
- **Connection Pooling**: HikariCP with optimized settings
- **TimescaleDB**: Hypertables with compression
- **Rate Limiting**: Resilience4j rate limiter (3 requests/second)
- **Async Execution**: Non-blocking operations with dedicated thread pool

## Next Steps

To complete the implementation, execute the remaining tasks in the spec:
1. Open `.kiro/specs/kite-ingestion/tasks.md`
2. Click "Start task" next to Task 10
3. Continue through Tasks 10-14 and 17-20

## References

- [Kite Connect API Documentation](https://kite.trade/docs/connect/v3/)
- [KiteConnect Java Library](https://github.com/zerodhatech/javakiteconnect)
- [TimescaleDB Documentation](https://docs.timescale.com/)
