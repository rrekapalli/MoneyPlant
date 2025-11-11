# Infrastructure Setup Guide

## Overview

This document provides instructions for setting up and verifying the infrastructure required for the Ingestion Engine.

## Prerequisites

- Docker and Docker Compose installed
- Java 21 installed
- Maven installed
- PostgreSQL database accessible at `postgres.tailce422e.ts.net:5432`

## Infrastructure Components

### 1. Apache Kafka

**Start Kafka:**
```bash
# Option 1: Standalone Kafka
docker-compose -f docker-compose.kafka.yml up -d

# Option 2: Engines Kafka (includes Spark, Trino, Redis)
cd engines
docker-compose up -d
```

**Verify Kafka:**
- Kafka UI: http://localhost:8082 (standalone) or http://localhost:8080 (engines)
- Kafka broker: localhost:9092 (standalone) or localhost:9093 (engines)

**Check Kafka status:**
```bash
docker ps | grep kafka
```

### 2. Apache Spark

**Included in engines docker-compose:**
```bash
cd engines
docker-compose up -d
```

**Verify Spark:**
- Spark Master UI: http://localhost:8082
- Spark Master: spark://localhost:7077

### 3. Apache Trino

**Included in engines docker-compose:**
```bash
cd engines
docker-compose up -d
```

**Verify Trino:**
- Trino UI: http://localhost:8083
- Trino JDBC: jdbc:trino://trino.tailce422e.ts.net:8080

### 4. PostgreSQL / TimescaleDB

**Database is already running at:**
- Host: postgres.tailce422e.ts.net:5432
- Database: MoneyPlant
- Username: postgres

**Create database schema:**
```bash
# Connect to database
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant

# Run migration scripts
\i engines/src/main/resources/db/migration/V1__create_nse_eq_ticks_table.sql
```

**TimescaleDB Setup (Optional but Recommended):**

TimescaleDB provides significant performance improvements for time-series data. If available:

```sql
-- Check if TimescaleDB is available
SELECT * FROM pg_available_extensions WHERE name = 'timescaledb';

-- If available, run the TimescaleDB migration
\i engines/src/main/resources/db/migration/V2__convert_ohlcv_to_hypertable.sql
```

**If TimescaleDB is NOT available:**

The system will work fine with standard PostgreSQL. Run the alternative migration:

```sql
-- Add time column without TimescaleDB
\i engines/src/main/resources/db/migration/V2_alternative__add_time_column_without_timescaledb.sql
```

**Note about existing nse_eq_ohlcv_historic table:**
- The existing table uses a `date` column (DATE type)
- The migration adds a `time` column (TIMESTAMPTZ type) for better time-series support
- Data is automatically migrated from `date` to `time` column
- Both columns are kept for backward compatibility

### 5. Redis (Optional)

**Included in engines docker-compose:**
```bash
cd engines
docker-compose up -d
```

**Verify Redis:**
- Port: 6380
- Test connection: `redis-cli -p 6380 ping`

## Build and Run

### 1. Build the Project

```bash
# Clean and compile
mvn clean compile -f engines/pom.xml

# Run tests
mvn test -f engines/pom.xml

# Package
mvn package -f engines/pom.xml
```

### 2. Run the Application

**Development mode:**
```bash
cd engines
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Production mode:**
```bash
cd engines
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

**Using JAR:**
```bash
cd engines
java -jar target/moneyplant-engines-1.0-SNAPSHOT.jar --spring.profiles.active=dev
```

## Verification Checklist

- [ ] Kafka is running and accessible
- [ ] Kafka UI is accessible at http://localhost:8082 or http://localhost:8080
- [ ] Spark Master UI is accessible at http://localhost:8082
- [ ] Trino UI is accessible at http://localhost:8083
- [ ] PostgreSQL database is accessible
- [ ] Database schema is created (nse_eq_ticks table exists)
- [ ] Application compiles successfully (`mvn clean compile`)
- [ ] Tests pass successfully (`mvn test`)
- [ ] Application starts without errors

## Troubleshooting

### Kafka Connection Issues

If you see "Connection to node -1 could not be established":
1. Check if Kafka is running: `docker ps | grep kafka`
2. Check Kafka logs: `docker logs moneyplant-kafka`
3. Verify Kafka port: `netstat -an | grep 9093`

### Database Connection Issues

If you see "Connection refused" for PostgreSQL:
1. Check if database is accessible: `psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant`
2. Verify credentials in `application.yml`
3. Check network connectivity to tailscale host

### Compilation Issues

If you see dependency resolution errors:
1. Clear Maven cache: `rm -rf ~/.m2/repository`
2. Update dependencies: `mvn clean install -U`
3. Check internet connectivity

## Next Steps

After infrastructure is verified:
1. Proceed to Task 2: Implement core data models
2. See `tasks.md` for implementation plan
3. Refer to `README.md` in ingestion module for architecture details

## Notes

- Docker is not available in the current environment, so infrastructure verification must be done manually
- Apache Hudi dependency is commented out in pom.xml and will be added in Task 7 when needed
- TimescaleDB extension is optional for MVP - standard PostgreSQL will work
- All critical infrastructure (Kafka, Trino, Spark, PostgreSQL) is available via docker-compose
