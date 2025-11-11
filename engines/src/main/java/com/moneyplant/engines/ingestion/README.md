# Ingestion Engine Module

## Overview

The Ingestion Engine is a high-performance, reactive Java-based system for ingesting market data from multiple sources (NSE, Yahoo Finance) and distributing it to downstream consumers via Apache Kafka.

## Architecture

```
Data Providers → Normalization → Validation → Kafka Publishing → Storage (TimescaleDB + Hudi)
```

## Module Structure

```
ingestion/
├── config/          # Configuration classes
├── provider/        # Data provider implementations (NSE, Yahoo Finance)
├── processor/       # Data normalization and validation
├── publisher/       # Kafka publishing logic
├── storage/         # TimescaleDB and Hudi storage
├── service/         # Business logic and orchestration
├── api/             # REST API controllers
└── model/           # Data models (TickData, OhlcvData, etc.)
```

## Key Features

- **Reactive Programming**: Built with Project Reactor for non-blocking I/O
- **Fault Tolerance**: Circuit breakers and retry mechanisms via Resilience4j
- **Rate Limiting**: Respects API rate limits for external providers
- **High Performance**: Sub-10ms latency, 10,000+ ticks/sec throughput
- **Scalability**: Horizontal scaling via Kafka consumer groups
- **Data Lake Integration**: End-of-day archival to Apache Hudi

## Configuration

Configuration is managed through Spring Boot profiles:

- **dev**: Development profile with debug logging and lower rate limits
- **prod**: Production profile with optimized settings

Key configuration properties are in `application.yml`, `application-dev.yml`, and `application-prod.yml`.

## Dependencies

- Spring Boot 3.x
- Spring WebFlux (Reactive)
- Apache Kafka
- Apache Hudi
- Apache Avro
- Resilience4j
- TimescaleDB (PostgreSQL extension)

## Getting Started

1. Ensure infrastructure is running:
   ```bash
   docker-compose -f docker-compose.kafka.yml up -d
   cd engines && docker-compose up -d
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

## Database Setup

Run the migration scripts to create required tables:

```sql
-- Create nse_eq_ticks table
\i engines/src/main/resources/db/migration/V1__create_nse_eq_ticks_table.sql

-- Convert nse_eq_ohlcv_historic to hypertable (requires TimescaleDB)
\i engines/src/main/resources/db/migration/V2__convert_ohlcv_to_hypertable.sql
```

## Testing

Run tests with:
```bash
mvn test
```

Integration tests use Testcontainers for Kafka and PostgreSQL.

## Monitoring

- Health endpoint: `http://localhost:8081/engines/actuator/health`
- Metrics endpoint: `http://localhost:8081/engines/actuator/metrics`
- Prometheus endpoint: `http://localhost:8081/engines/actuator/prometheus`

## Implementation Status

This module is currently under development. See `tasks.md` for implementation progress.
