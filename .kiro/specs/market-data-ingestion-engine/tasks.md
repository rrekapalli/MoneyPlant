# Implementation Plan - Ingestion Engine

## Overview

This implementation plan focuses on the core functionality of the Ingestion Engine with a minimal viable product approach. The plan excludes advanced features like health monitoring services, complex observability, and focuses on essential data ingestion, storage, and archival capabilities.

## 🏗️ Infrastructure Prerequisites

**IMPORTANT**: Before starting implementation, review the infrastructure assessment:
- **Document**: `.kiro/specs/market-data-ingestion-engine/infrastructure-assessment.md`
- **Summary**: All critical infrastructure (Kafka, Trino, Spark, PostgreSQL) is available via docker-compose
- **Action Required**: Add Maven dependencies and start docker services (see Task 1)
- **Estimated Setup Time**: 1-2 hours

## ⚠️ Critical Requirements for Every Task

**Before marking any task as complete, you MUST:**

1. ✅ **Verify Compilation**: Run `mvn clean compile` (or `./mvnw clean compile`) and ensure zero errors
2. ✅ **Run Tests**: Execute `mvn test` (or `./mvnw test`) to ensure no regressions  
3. ✅ **Commit to Git**: Commit changes to local git with descriptive message
4. ✅ **Leverage Existing Code**: Reuse existing entities, repositories, services, and DTOs from:
   - `backend/src/main/java/com/moneyplant/core/entities/` (e.g., `NseEquityMaster`)
   - `backend/src/main/java/com/moneyplant/stock/entities/`
   - `backend/src/main/java/com/moneyplant/stock/repositories/`
   - `backend/src/main/java/com/moneyplant/stock/services/`
   - `backend/src/main/java/com/moneyplant/stock/dtos/`
   - `engines/src/main/java/com/moneyplant/engines/`

**Git Commit Message Format:**
```
[Ingestion Engine] Task X.Y: <Brief Description>

- Implementation detail 1
- Implementation detail 2
- Leveraged: <existing classes used>
- Verified compilation: ✓
- Tests passing: ✓
```

**Example Commit:**
```
[Ingestion Engine] Task 2.1: Create TickData model

- Added TickData record with validation annotations
- Includes symbol, timestamp, price, volume, bid, ask fields
- Leveraged: BigDecimal for price precision
- Verified compilation: ✓
- Tests passing: ✓
```

## Task List

- [ ] 1. Set up project structure, infrastructure, and core configuration
  - **FIRST**: Review `infrastructure-assessment.md` for available components
  - **Start Infrastructure**: Run `docker-compose -f docker-compose.kafka.yml up -d` and `cd engines && docker-compose up -d`
  - **Add Maven Dependencies** to `engines/pom.xml`:
    - Spring WebFlux (spring-boot-starter-webflux) for reactive programming
    - Apache Hudi (hudi-spark3.5-bundle_2.12:0.14.1) for data lake
    - Apache Avro (avro:1.11.3) for serialization
    - Resilience4j for circuit breaker patterns
    - Testcontainers for integration testing
  - Create ingestion module under `./engines/src/main/java/com/moneyplant/engines/ingestion`
  - Configure Spring Boot application properties for dev and prod profiles
  - Create database schema for `nse_eq_ticks` table (see infrastructure-assessment.md)
  - **Verify Infrastructure**: Check Kafka UI (http://localhost:8082), Trino (http://localhost:8083), Spark (http://localhost:8082)
  - **Verify Compilation**: Run `mvn clean compile` - must succeed with zero errors
  - **Commit**: `[Ingestion Engine] Task 1: Set up project structure, infrastructure, and dependencies`
  - _Requirements: All requirements depend on proper project setup_

- [ ] 2. Implement core data models
  - [ ] 2.1 Create TickData model with symbol, timestamp, price, volume, bid, ask fields
    - Implement as immutable record or @Data class with validation
    - _Requirements: 1.2, 4.1_
  
  - [ ] 2.2 Create OhlcvData model for candlestick data
    - Include timeframe enum (1min, 5min, 15min, 1hour, 1day)
    - _Requirements: 2.1, 2.4_
  
  - [ ] 2.3 Use existing NseEquityMaster entity for symbol metadata
    - Reference existing entity: `com.moneyplant.core.entities.NseEquityMaster`
    - Create SymbolUniverse enum with predefined queries (NSE 500, Nifty 50, FNO stocks)
    - Create DTOs for NSE API response parsing
    - _Requirements: 7.3, 7.6_

- [ ] 3. Implement TimescaleDB repository layer
  - [ ] 3.1 Create database schema initialization script
    - Create `nse_eq_ticks` hypertable for intraday data with proper indexes
    - Convert existing `nse_eq_ohlcv_historic` table to TimescaleDB hypertable (if not already)
    - Enable compression policy for `nse_eq_ohlcv_historic` (data older than 30 days)
    - Note: `nse_eq_master` table already exists and is populated by Python ingestion
    - Create continuous aggregate view for daily candles (optional)
    - _Requirements: 5.1, 5.2, 5.7_
  
  - [ ] 3.2 Create TimescaleRepository for tick data operations
    - Implement save() method for single tick insert
    - Implement batchInsert() method using JDBC batch operations
    - Implement getTickDataForDate() for end-of-day export
    - Implement truncateTickTable() for daily cleanup
    - _Requirements: 5.1, 5.4, 5.5_
  
  - [ ] 3.3 Create OhlcvRepository for historical OHLCV operations
    - Implement save() and batchInsert() for OHLCV data
    - Implement query methods with date range and timeframe filters
    - Support pagination for large result sets
    - _Requirements: 5.2, 5.8_
  
  - [ ] 3.4 Create NseEquityMasterRepository for symbol operations
    - Use existing `NseEquityMaster` entity from `com.moneyplant.core.entities`
    - Implement query methods for filtering by sector, industry, trading_status
    - Implement universe queries (Nifty 50 via pd_sector_ind, FNO via is_fno_sec)
    - Implement batchUpsert() method for symbol master updates
    - _Requirements: 7.3, 7.6_

- [ ] 4. Implement data providers
  - [ ] 4.1 Create NSE data provider for symbol master and historical data
    - Implement NseDataProvider with fetchEquityMasterData() method
    - Implement fetchHistorical() for NSE historical OHLCV data
    - Parse NSE JSON response to NseEquityMaster entities
    - Handle NSE-specific headers and cookies
    - _Requirements: 2.2, 7.1_
  
  - [ ] 4.2 Create YahooFinanceProvider for historical data
    - Implement fetchHistorical() method using WebClient
    - Parse Yahoo Finance CSV response to OhlcvData
    - _Requirements: 2.1, 6.1_
  
  - [ ] 4.3 Implement rate limiting for both providers
    - Use Resilience4j RateLimiter (NSE: 1000/hour, Yahoo: 2000/hour)
    - Add retry logic with exponential backoff
    - _Requirements: 2.3, 6.1_
  
  - [ ] 4.4 Implement parallel symbol fetching with virtual threads
    - Use Java 21 virtual threads for concurrent requests
    - Process 2000+ symbols in parallel
    - _Requirements: 2.4_

- [ ] 5. Implement data normalization and validation
  - [ ] 5.1 Create DataNormalizer service
    - Convert provider-specific formats to TickData/OhlcvData
    - Handle timezone conversions (IST for NSE)
    - _Requirements: 4.1_
  
  - [ ] 5.2 Create DataValidator service
    - Validate price within circuit breaker limits (±20%)
    - Validate timestamp monotonicity per symbol
    - Validate volume is positive
    - _Requirements: 4.2, 4.3, 4.4_

- [ ] 6. Implement Kafka integration
  - [ ] 6.1 Configure Kafka producer with Avro serialization
    - Set up KafkaTemplate with proper configuration
    - Configure Avro schema registry integration
    - _Requirements: 3.5_
  
  - [ ] 6.2 Create KafkaPublisher service
    - Implement publishTick() method for market-data-ticks topic
    - Implement publishCandle() method for market-data-candles topic
    - Use symbol-based partitioning strategy
    - _Requirements: 3.1, 3.2, 3.6_
  
  - [ ] 6.3 Implement basic error handling for Kafka failures
    - Add retry logic (3 attempts with exponential backoff)
    - Log failed messages
    - _Requirements: 3.7_


- [ ] 7. Implement Apache Hudi integration for data lake
  - [ ] 7.1 Create HudiWriter service
    - Configure Hudi write client with S3/MinIO path
    - Implement writeBatch() method for daily tick data export
    - Partition by date for efficient querying
    - _Requirements: 11.1, 11.3_
  
  - [ ] 7.2 Register Hudi tables in Hive Metastore
    - Configure Hive Metastore connection
    - Auto-register tables after write
    - _Requirements: 11.7_

- [ ] 8. Implement end-of-day archival service
  - [ ] 8.1 Create EndOfDayArchivalService
    - Implement scheduled job (cron: 5:30 PM IST daily)
    - Export tick data from TimescaleDB to Hudi
    - Verify data integrity (count matching)
    - Truncate nse_eq_ticks table after successful archival
    - _Requirements: 5.3, 5.4, 11.1, 11.2, 11.8_
  
  - [ ] 8.2 Add archival status tracking
    - Log archival start, completion, and errors
    - Store archival metadata (date, record count, status)
    - _Requirements: 11.2_

- [ ] 9. Implement core ingestion service
  - [ ] 9.1 Create IngestionService orchestrating data flow
    - Implement startHistoricalIngestion() for backfill
    - Coordinate provider → validator → normalizer → publisher → storage flow
    - Use reactive streams (Flux/Mono) for data pipeline
    - _Requirements: 2.1, 2.3, 2.4_
  
  - [ ] 9.2 Implement backfill service for historical data
    - Detect data gaps in TimescaleDB
    - Fetch missing data from Yahoo Finance
    - Batch insert into TimescaleDB
    - _Requirements: 2.5, 2.6_

- [ ] 10. Implement symbol master ingestion and universe management
  - [ ] 10.1 Create SymbolMasterIngestionService
    - Implement scheduled job (cron: 6:00 AM daily) for symbol master refresh
    - Fetch equity master data from NSE API
    - Parse and transform to NseEquityMaster entities
    - Batch upsert to nse_eq_master table
    - _Requirements: 7.1, 7.2, 7.8_
  
  - [ ] 10.2 Create SymbolUniverseService using nse_eq_master queries
    - Query predefined universes from nse_eq_master (NSE 500, Nifty 50, Nifty Bank)
    - Use pd_sector_ind, is_fno_sec, trading_status fields for filtering
    - Support custom filters (sector, industry, market cap ranges)
    - _Requirements: 7.3, 7.6_
  
  - [ ] 10.3 Implement dynamic symbol subscription
    - Add/remove symbols without restart
    - Publish universe change events to Kafka
    - _Requirements: 7.4, 7.5, 7.7_

- [ ] 11. Implement REST API endpoints
  - [ ] 11.1 Create MarketDataController
    - GET /api/v1/market-data/quote/{symbol} - latest quote
    - GET /api/v1/market-data/ohlcv/{symbol} - historical OHLCV with pagination
    - GET /api/v1/market-data/symbols/search - symbol search
    - _Requirements: 12.1_
  
  - [ ] 11.2 Create IngestionController
    - POST /api/v1/ingestion/backfill - trigger backfill
    - GET /api/v1/ingestion/status - ingestion status
    - _Requirements: 2.8_
  
  - [ ] 11.3 Add JWT authentication for API endpoints
    - Integrate with existing auth system
    - Validate JWT tokens on protected endpoints
    - _Requirements: 12.3_

- [ ] 12. Implement basic configuration and deployment
  - [ ] 12.1 Create application.yml with profiles (dev, prod)
    - Configure Kafka bootstrap servers
    - Configure TimescaleDB connection
    - Configure Hudi S3/MinIO paths
    - Configure provider settings (Yahoo Finance)
    - _Requirements: 10.1, 10.2_
  
  - [ ] 12.2 Create Dockerfile for containerization
    - Multi-stage build with Java 21
    - Optimize image size (<500MB)
    - _Requirements: 10.3_
  
  - [ ]* 12.3 Create basic Kubernetes deployment manifest
    - Deployment with resource limits
    - Service for API exposure
    - ConfigMap for configuration
    - Secret for sensitive data (DB passwords, API keys)
    - _Requirements: 10.4, 10.6_

- [ ] 13. Integration testing and validation
  - [ ] 13.1 Create integration tests with Testcontainers
    - Test TimescaleDB operations
    - Test Kafka publishing
    - Test end-to-end data flow
    - _Requirements: All requirements_
  
  - [ ] 13.2 Validate against Python implementation
    - Compare backtest results for same date range
    - Verify data completeness and accuracy
    - _Requirements: 2.8_

- [ ] 14. Documentation and deployment guide
  - [ ] 14.1 Create README with setup instructions
    - Prerequisites (Java 21, Docker, Kubernetes)
    - Local development setup
    - Configuration guide
    - _Requirements: All requirements_
  
  - [ ] 14.2 Create deployment runbook
    - Step-by-step deployment process
    - Troubleshooting common issues
    - Rollback procedures
    - _Requirements: 10.7, 10.8_

## Implementation Notes

### Leveraging Existing Code and Infrastructure

**IMPORTANT: Always check for existing code before creating new classes!**

**Existing Entities (Reuse These)**:
- `com.moneyplant.core.entities.NseEquityMaster` - Symbol master data entity
- Check `backend/src/main/java/com/moneyplant/core/entities/` for other core entities
- Check `backend/src/main/java/com/moneyplant/stock/entities/` for stock entities
- Check `engines/src/main/java/com/moneyplant/engines/model/` for engine models

**Existing Repositories (Reuse These)**:
- Check `backend/src/main/java/com/moneyplant/stock/repositories/` for stock repos
- Check `backend/src/main/java/com/moneyplant/core/repositories/` for core repos
- Check `engines/src/main/java/com/moneyplant/engines/storage/` for engine repos

**Existing Services (Reuse These)**:
- Check `backend/src/main/java/com/moneyplant/stock/services/` for stock services
- Check `engines/src/main/java/com/moneyplant/engines/service/` for engine services

**Existing DTOs (Reuse These)**:
- Check `backend/src/main/java/com/moneyplant/stock/dtos/` for stock DTOs
- Check `backend/src/main/java/com/moneyplant/core/dtos/` for core DTOs

**Existing Configuration (Reuse These)**:
- Check `engines/src/main/java/com/moneyplant/engines/config/` for existing configs
- Check `backend/src/main/resources/application.yml` for existing properties

**Symbol Master Data (`nse_eq_master` table)**:
- The `nse_eq_master` table already exists with comprehensive NSE equity metadata
- Java entity `com.moneyplant.core.entities.NseEquityMaster` already maps to this table
- **The ingestion engine will implement Java-based routines to fetch and update this table from NSE API**
- Daily scheduled job (6:00 AM) will refresh symbol master data
- Symbol universes (NSE 500, Nifty 50, etc.) are derived via queries on this table using fields like:
  - `pd_sector_ind` (e.g., 'NIFTY 50', 'NIFTY BANK')
  - `is_fno_sec` (F&O eligible stocks)
  - `trading_status` (Active/Suspended)
  - `sector`, `industry`, `basic_industry` (for sector-based filtering)

**Historical OHLCV Data (`nse_eq_ohlcv_historic` table)**:
- This table may already exist and contain historical price data
- The ingestion engine will convert it to TimescaleDB hypertable for better performance
- Existing data will be preserved during conversion
- New data will be ingested from NSE API and Yahoo Finance

### Task Completion Checklist

**For EVERY task and sub-task, before marking as complete:**

1. ✅ **Check for existing code**: Search codebase for similar functionality
2. ✅ **Reuse existing classes**: Leverage entities, repos, services, DTOs where possible
3. ✅ **Compile successfully**: `mvn clean compile` or `./mvnw clean compile` must pass
4. ✅ **Run tests**: `mvn test` or `./mvnw test` must pass (no regressions)
5. ✅ **Commit to git**: Use format `[Ingestion Engine] Task X.Y: Description`
6. ✅ **Document what was leveraged**: Note existing classes reused in commit message

**Quick Verification Commands:**
```bash
# Compile
./mvnw clean compile

# Run tests
./mvnw test

# Commit
git add .
git commit -m "[Ingestion Engine] Task X.Y: Your description

- Detail 1
- Detail 2
- Leveraged: ExistingClass1, ExistingClass2
- Verified compilation: ✓
- Tests passing: ✓"
```

### Excluded Features (for future iterations)
- NSE WebSocket real-time data provider (focus on historical data first)
- Advanced health monitoring and alerting
- Grafana dashboards and Prometheus metrics
- Complex circuit breaker patterns
- WebSocket API for client subscriptions
- Redis caching layer
- Advanced data quality metrics
- Distributed tracing with OpenTelemetry
- Horizontal pod autoscaling
- Blue-green deployment

### Technology Stack
- Java 21 (virtual threads)
- Spring Boot 3.x
- Project Reactor (reactive streams)
- Apache Kafka (event streaming)
- TimescaleDB (time-series storage)
- Apache Hudi (data lake)
- PostgreSQL (metadata storage)
- Docker & Kubernetes (deployment)

### Development Approach
1. Start with historical data ingestion (Yahoo Finance)
2. Implement storage layer (TimescaleDB + Hudi)
3. Add Kafka publishing
4. Implement end-of-day archival
5. Add REST API
6. Deploy and validate

### Success Criteria
- Successfully ingest historical data for 2000+ symbols
- Store intraday tick data in TimescaleDB
- Archive to Hudi at end of day
- Publish to Kafka topics
- Query via REST API
- Deploy to Kubernetes
