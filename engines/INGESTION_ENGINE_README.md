# Market Data Ingestion Engine

## Overview

The Market Data Ingestion Engine is a high-performance, reactive Java-based system built on Spring Boot 3.x that provides real-time and historical market data ingestion capabilities for the MoneyPlant trading platform. It replaces the Python Airflow-based NSE data fetching infrastructure with a modern, scalable solution optimized for high-frequency trading (HFT) and intraday trading strategies.

### Key Features

- **High Performance**: Sub-10ms latency for tick processing with 10,000+ ticks/sec throughput
- **Multi-Source Support**: NSE API, Yahoo Finance, and CSV imports
- **Reactive Architecture**: Non-blocking I/O using Project Reactor for maximum throughput
- **Time-Series Optimized**: TimescaleDB for efficient intraday storage with automatic compression
- **Data Lake Integration**: Apache Hudi for long-term analytics with Spark and Trino
- **Event Streaming**: Apache Kafka for real-time data distribution
- **Symbol Management**: Dynamic symbol universe management with NSE equity master data
- **Fault Tolerant**: Circuit breakers, retry mechanisms, and graceful degradation
- **Production Ready**: Comprehensive monitoring, health checks, and deployment automation

### Architecture Highlights

- **Java 21**: Virtual threads for lightweight concurrency
- **Spring Boot 3.x**: Modern reactive web framework
- **Project Reactor**: Reactive streams for WebSocket and Kafka integration
- **TimescaleDB**: Time-series optimized PostgreSQL for intraday data
- **Apache Kafka**: Event streaming backbone with Avro serialization
- **Apache Hudi**: Data lake table format for historical analytics
- **Resilience4j**: Circuit breakers and rate limiting

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [API Documentation](#api-documentation)
7. [Data Flow](#data-flow)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Development](#development)
11. [Deployment](#deployment)
12. [Performance Tuning](#performance-tuning)


## Prerequisites

### Required Software

- **Java 21 or higher** - Latest LTS version with virtual threads support
  ```bash
  java -version
  # Should show: openjdk version "21" or higher
  ```

- **Maven 3.8 or higher** - Build tool
  ```bash
  mvn -version
  # Should show: Apache Maven 3.8.x or higher
  ```

- **Docker 20.10 or higher** - Container runtime
  ```bash
  docker --version
  # Should show: Docker version 20.10.x or higher
  ```

- **Docker Compose 2.0 or higher** - Multi-container orchestration
  ```bash
  docker compose version
  # Should show: Docker Compose version v2.x.x or higher
  ```

### Infrastructure Services

The following services must be running:

1. **PostgreSQL 13+ with TimescaleDB** - Time-series database
2. **Apache Kafka 3.0+** - Event streaming platform
3. **Apache Spark 3.5+** - Big data processing (for Hudi)
4. **Trino 443+** - Distributed SQL query engine (for data lake queries)
5. **MinIO or S3** - Object storage for data lake
6. **Redis 6+** (Optional) - Caching layer

### System Requirements

- **CPU**: 4+ cores recommended (8+ for production)
- **RAM**: 8GB minimum (16GB+ recommended for production)
- **Disk**: 50GB minimum (SSD recommended for TimescaleDB)
- **Network**: Stable internet connection for NSE/Yahoo Finance APIs


## Quick Start

### 1. Clone and Build

```bash
# Navigate to engines directory
cd engines

# Build the project
./mvnw clean install

# Verify build
./mvnw clean compile
```

### 2. Start Infrastructure Services

```bash
# Start Kafka and dependencies
docker compose -f ../docker-compose.kafka.yml up -d

# Start engines infrastructure (Redis, MinIO, etc.)
docker compose up -d

# Verify services are running
docker ps
```

### 3. Initialize Database

```bash
# Connect to PostgreSQL
psql -h localhost -p 5432 -U postgres -d MoneyPlant

# Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

# Exit psql
\q

# Run Flyway migrations (automatic on first startup)
# Or manually:
./mvnw flyway:migrate
```

### 4. Configure Application

Create `.env` file in `engines` directory:

```bash
# Database
TIMESCALEDB_URL=jdbc:postgresql://localhost:5432/MoneyPlant
TIMESCALEDB_USERNAME=postgres
TIMESCALEDB_PASSWORD=postgres

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Hudi/MinIO
HUDI_S3_ENDPOINT=http://localhost:9000
HUDI_S3_ACCESS_KEY=minioadmin
HUDI_S3_SECRET_KEY=minioadmin
```

### 5. Run the Application

```bash
# Run with Maven
./mvnw spring-boot:run

# Or run the JAR
java -jar target/engines-0.0.1-SNAPSHOT.jar

# Application will start on port 8081
```

### 6. Verify Installation

```bash
# Check health
curl http://localhost:8081/engines/actuator/health

# Check ingestion status
curl http://localhost:8081/engines/api/v1/ingestion/status

# View metrics
curl http://localhost:8081/engines/actuator/metrics
```


## Installation

### Step-by-Step Installation

#### 1. Install Java 21

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install openjdk-21-jdk
java -version
```

**macOS**:
```bash
brew install openjdk@21
java -version
```

**Windows**:
Download from [Adoptium](https://adoptium.net/) and install.

#### 2. Install Maven

**Linux**:
```bash
sudo apt install maven
mvn -version
```

**macOS**:
```bash
brew install maven
mvn -version
```

**Windows**:
Download from [Apache Maven](https://maven.apache.org/download.cgi) and add to PATH.

#### 3. Install Docker

Follow instructions at [Docker Installation](https://docs.docker.com/get-docker/)

#### 4. Clone Repository

```bash
git clone https://github.com/your-org/moneyplant.git
cd moneyplant/engines
```

#### 5. Build Project

```bash
# Clean and build
./mvnw clean install

# Skip tests for faster build
./mvnw clean install -DskipTests

# Build Docker image
docker build -t moneyplant/ingestion-engine:latest .
```

#### 6. Setup Infrastructure

```bash
# Start Kafka
docker compose -f ../docker-compose.kafka.yml up -d

# Start engines services
docker compose up -d

# Verify all services are running
docker ps
```

#### 7. Initialize Database

```bash
# Create database if not exists
psql -h localhost -U postgres -c "CREATE DATABASE MoneyPlant;"

# Enable TimescaleDB
psql -h localhost -U postgres -d MoneyPlant -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# Migrations will run automatically on first startup
```


## Configuration

### Application Configuration

The application uses `application.yml` for configuration. Key sections:

#### Database Configuration

```yaml
spring:
  datasource:
    url: ${TIMESCALEDB_URL:jdbc:postgresql://localhost:5432/MoneyPlant}
    username: ${TIMESCALEDB_USERNAME:postgres}
    password: ${TIMESCALEDB_PASSWORD:postgres}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
```

#### Kafka Configuration

```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: io.confluent.kafka.serializers.KafkaAvroSerializer
      properties:
        schema.registry.url: ${KAFKA_SCHEMA_REGISTRY_URL:http://localhost:8081}
```

#### Ingestion Provider Configuration

```yaml
ingestion:
  providers:
    nse:
      enabled: true
      api-url: https://www.nseindia.com/api
      rate-limit-per-hour: 1000
      timeout-sec: 15
    yahoo:
      enabled: true
      api-url: https://query1.finance.yahoo.com
      rate-limit-per-hour: 2000
      timeout-sec: 10
```

#### Hudi Data Lake Configuration

```yaml
hudi:
  enabled: true
  base-path: ${HUDI_BASE_PATH:s3a://moneyplant-datalake}
  table-name: nse_eq_ticks_historical
  s3:
    endpoint: ${HUDI_S3_ENDPOINT:http://localhost:9000}
    access-key: ${HUDI_S3_ACCESS_KEY:minioadmin}
    secret-key: ${HUDI_S3_SECRET_KEY:minioadmin}
```

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=dev

# Database
TIMESCALEDB_URL=jdbc:postgresql://localhost:5432/MoneyPlant
TIMESCALEDB_USERNAME=postgres
TIMESCALEDB_PASSWORD=your_password

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_SCHEMA_REGISTRY_URL=http://localhost:8081

# Hudi/S3
HUDI_S3_ENDPOINT=http://localhost:9000
HUDI_S3_ACCESS_KEY=minioadmin
HUDI_S3_SECRET_KEY=minioadmin
HUDI_BASE_PATH=s3a://moneyplant-datalake

# Ingestion
INGESTION_NSE_ENABLED=true
INGESTION_YAHOO_ENABLED=true

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MONEYPLANT=DEBUG
```

### Profile-Specific Configuration

**Activating Profiles**:

Profiles should be activated via environment variables or command line arguments, NOT in profile-specific YAML files:

```bash
# Via environment variable
export SPRING_PROFILES_ACTIVE=dev

# Via command line
java -jar target/engines-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev

# Via Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Development Profile (`application-dev.yml`)

```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    com.moneyplant: DEBUG
    org.springframework: INFO
```

#### Production Profile (`application-prod.yml`)

```yaml
spring:
  jpa:
    show-sql: false

logging:
  level:
    com.moneyplant: INFO
    org.springframework: WARN

management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
```


## Running the Application

### Local Development

#### Using Maven

```bash
# Run with default profile
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run with debug enabled
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

#### Using JAR

```bash
# Build JAR
./mvnw clean package

# Run JAR
java -jar target/engines-0.0.1-SNAPSHOT.jar

# Run with profile
java -jar target/engines-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# Run with custom JVM options
java -Xmx4g -Xms2g -jar target/engines-0.0.1-SNAPSHOT.jar
```

#### Using Docker

```bash
# Build image
docker build -t moneyplant/ingestion-engine:latest .

# Run container
docker run -d \
  --name ingestion-engine \
  -p 8081:8081 \
  --env-file .env \
  moneyplant/ingestion-engine:latest

# View logs
docker logs -f ingestion-engine
```

#### Using Docker Compose

```bash
# Start all services
docker compose -f docker-compose.ingestion.yml up -d

# View logs
docker compose -f docker-compose.ingestion.yml logs -f

# Stop services
docker compose -f docker-compose.ingestion.yml down
```

### Production Deployment

See [Deployment Guide](#deployment) for production deployment instructions.

### Scheduled Jobs

The application runs several scheduled jobs:

1. **Symbol Master Refresh**: Daily at 6:00 AM IST
   - Fetches latest equity master data from NSE
   - Updates `nse_eq_master` table

2. **End-of-Day Archival**: Daily at 3:30 PM IST (after market close)
   - Archives tick data from TimescaleDB to Hudi
   - Truncates intraday table

3. **Health Monitoring**: Every 30 seconds
   - Checks provider health
   - Monitors data freshness

### Manual Operations

#### Trigger Backfill

```bash
# Backfill historical data for a symbol
curl -X POST http://localhost:8081/engines/api/v1/ingestion/backfill \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "timeframe": "DAILY"
  }'
```

#### Refresh Symbol Master

```bash
# Trigger manual symbol master refresh
curl -X POST http://localhost:8081/engines/api/v1/ingestion/symbol-master/refresh
```

#### Query Ingestion Status

```bash
# Get current ingestion status
curl http://localhost:8081/engines/api/v1/ingestion/status
```


## API Documentation

### REST API Endpoints

#### Market Data API

**Get Latest Quote**
```bash
GET /engines/api/v1/market-data/quote/{symbol}

# Example
curl http://localhost:8081/engines/api/v1/market-data/quote/RELIANCE

# Response
{
  "symbol": "RELIANCE",
  "timestamp": "2024-01-15T15:29:59Z",
  "price": "2450.50",
  "volume": 1250000,
  "bid": "2450.25",
  "ask": "2450.75"
}
```

**Get Historical OHLCV**
```bash
GET /engines/api/v1/market-data/ohlcv/{symbol}?start=2024-01-01&end=2024-01-31&timeframe=DAILY&page=0&size=100

# Example
curl "http://localhost:8081/engines/api/v1/market-data/ohlcv/RELIANCE?start=2024-01-01&end=2024-01-31&timeframe=DAILY"

# Response
{
  "content": [
    {
      "symbol": "RELIANCE",
      "timestamp": "2024-01-01T09:15:00Z",
      "timeframe": "DAILY",
      "open": "2450.00",
      "high": "2465.00",
      "low": "2445.00",
      "close": "2460.00",
      "volume": 5000000
    }
  ],
  "page": 0,
  "size": 100,
  "totalElements": 21,
  "totalPages": 1
}
```

**Search Symbols**
```bash
GET /engines/api/v1/market-data/symbols/search?query=REL&sector=Energy

# Example
curl "http://localhost:8081/engines/api/v1/market-data/symbols/search?query=REL"

# Response
[
  {
    "symbol": "RELIANCE",
    "companyName": "Reliance Industries Limited",
    "sector": "Energy",
    "industry": "Refineries",
    "isin": "INE002A01018"
  }
]
```

#### Ingestion Control API

**Start Ingestion**
```bash
POST /engines/api/v1/ingestion/start
Content-Type: application/json

{
  "symbols": ["RELIANCE", "TCS", "INFY"]
}

# Example
curl -X POST http://localhost:8081/engines/api/v1/ingestion/start \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["RELIANCE", "TCS"]}'
```

**Stop Ingestion**
```bash
POST /engines/api/v1/ingestion/stop

# Example
curl -X POST http://localhost:8081/engines/api/v1/ingestion/stop
```

**Trigger Backfill**
```bash
POST /engines/api/v1/ingestion/backfill
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "timeframe": "DAILY"
}
```

**Get Ingestion Status**
```bash
GET /engines/api/v1/ingestion/status

# Response
{
  "status": "RUNNING",
  "activeSymbols": 2000,
  "ticksProcessed": 1500000,
  "lastUpdate": "2024-01-15T15:30:00Z",
  "providers": {
    "NSE": "HEALTHY",
    "YAHOO": "HEALTHY"
  }
}
```

### Health and Monitoring Endpoints

**Health Check**
```bash
GET /engines/actuator/health

# Response
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "kafka": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

**Metrics**
```bash
GET /engines/actuator/metrics

# Specific metric
GET /engines/actuator/metrics/jvm.memory.used
```

**Prometheus Metrics**
```bash
GET /engines/actuator/prometheus
```


## Data Flow

### Real-Time Data Flow

```
NSE/Yahoo API → Data Provider → Validator → Normalizer → Enricher
                                                              ↓
                                                         Kafka Topics
                                                              ↓
                                                    ┌─────────┴─────────┐
                                                    ↓                   ↓
                                            TimescaleDB            Consumers
                                            (Intraday)          (Trading Systems)
```

### Historical Data Flow

```
Yahoo Finance API → Backfill Service → Validator → Normalizer
                                                        ↓
                                                  TimescaleDB
                                              (nse_eq_ohlcv_historic)
```

### End-of-Day Archival Flow

```
TimescaleDB (nse_eq_ticks) → Export → Apache Hudi → Trino/Spark
                                          ↓
                                    Data Lake (S3/MinIO)
                                          ↓
                                    Truncate nse_eq_ticks
```

### Symbol Master Flow

```
NSE API → Symbol Master Service → Parser → nse_eq_master table
                                              ↓
                                    Symbol Universe Queries
                                              ↓
                                    Dynamic Subscriptions
```

## Monitoring

### Application Metrics

The application exposes comprehensive metrics via Spring Boot Actuator:

**JVM Metrics**:
- Memory usage (heap, non-heap)
- Garbage collection statistics
- Thread counts and states
- CPU usage

**Application Metrics**:
- Tick processing rate (ticks/sec)
- Kafka publishing rate (messages/sec)
- Database write rate (rows/sec)
- API request rates and latencies
- Error rates by type

**Custom Metrics**:
- `ingestion.ticks.processed` - Total ticks processed
- `ingestion.ticks.rate` - Ticks per second
- `ingestion.kafka.published` - Messages published to Kafka
- `ingestion.db.writes` - Database write operations
- `ingestion.provider.health` - Provider health status
- `ingestion.data.freshness` - Data freshness in milliseconds

### Prometheus Integration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'ingestion-engine'
    metrics_path: '/engines/actuator/prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:8081']
```

### Grafana Dashboards

Import the provided dashboard from `grafana/ingestion-engine-dashboard.json`:

**Key Panels**:
- Tick processing rate over time
- Kafka publishing throughput
- Database write performance
- Provider health status
- Memory and CPU usage
- Error rates and types
- Data freshness metrics

### Logging

The application uses structured logging with correlation IDs:

```json
{
  "timestamp": "2024-01-15T15:30:00.123Z",
  "level": "INFO",
  "logger": "com.moneyplant.engines.ingestion.service.IngestionService",
  "message": "Processed tick for symbol RELIANCE",
  "correlationId": "abc123",
  "symbol": "RELIANCE",
  "latencyMs": 5
}
```

**Log Levels**:
- `ERROR`: Critical errors requiring immediate attention
- `WARN`: Warning conditions that should be reviewed
- `INFO`: General informational messages
- `DEBUG`: Detailed debugging information
- `TRACE`: Very detailed trace information

**Log Files**:
- `logs/engines.log` - Main application log
- `logs/engines-error.log` - Error log only
- `logs/ingestion.log` - Ingestion-specific log


## Troubleshooting

### Common Issues

#### 1. Application Won't Start

**Symptom**: Application fails to start with connection errors

**Possible Causes**:
- Database not accessible
- Kafka not running
- Port 8081 already in use

**Solutions**:
```bash
# Check database connectivity
psql -h localhost -U postgres -d MoneyPlant -c "SELECT 1;"

# Check Kafka
docker ps | grep kafka

# Check port availability
lsof -i :8081

# View startup logs
tail -f logs/engines.log
```

#### 2. High Memory Usage

**Symptom**: Application consuming excessive memory

**Solutions**:
```bash
# Adjust JVM heap size
java -Xmx4g -Xms2g -jar target/engines-0.0.1-SNAPSHOT.jar

# Enable G1GC
java -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar target/engines-0.0.1-SNAPSHOT.jar

# Monitor memory
curl http://localhost:8081/engines/actuator/metrics/jvm.memory.used
```

#### 3. Slow Data Ingestion

**Symptom**: Tick processing rate below expected

**Possible Causes**:
- Database connection pool exhausted
- Kafka producer backpressure
- Network latency to data providers

**Solutions**:
```bash
# Check database pool
curl http://localhost:8081/engines/actuator/metrics/hikaricp.connections.active

# Check Kafka lag
kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group ingestion-engine

# Increase parallelism in application.yml
ingestion:
  parallelism: 16  # Increase from default
```

#### 4. Data Quality Issues

**Symptom**: Invalid or missing data

**Solutions**:
```bash
# Check data quality metrics
curl http://localhost:8081/engines/actuator/metrics/ingestion.data.quality

# View validation errors in logs
grep "Validation failed" logs/ingestion.log

# Check provider health
curl http://localhost:8081/engines/api/v1/ingestion/status
```

#### 5. Kafka Connection Issues

**Symptom**: Unable to publish to Kafka

**Solutions**:
```bash
# Verify Kafka is running
docker ps | grep kafka

# Test Kafka connectivity
kafka-topics --bootstrap-server localhost:9092 --list

# Check Kafka producer metrics
curl http://localhost:8081/engines/actuator/metrics/kafka.producer.record-send-rate

# Restart Kafka
docker compose -f docker-compose.kafka.yml restart
```

#### 6. TimescaleDB Performance Issues

**Symptom**: Slow database queries

**Solutions**:
```sql
-- Check hypertable status
SELECT * FROM timescaledb_information.hypertables;

-- Check chunk statistics
SELECT * FROM timescaledb_information.chunks WHERE hypertable_name = 'nse_eq_ticks';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM nse_eq_ticks WHERE symbol = 'RELIANCE' AND time > NOW() - INTERVAL '1 hour';

-- Reindex if needed
REINDEX TABLE nse_eq_ticks;
```

### Debug Mode

Enable debug logging for troubleshooting:

```yaml
logging:
  level:
    com.moneyplant.engines.ingestion: DEBUG
    org.springframework.kafka: DEBUG
    org.springframework.jdbc: DEBUG
```

### Health Checks

```bash
# Overall health
curl http://localhost:8081/engines/actuator/health

# Database health
curl http://localhost:8081/engines/actuator/health/db

# Kafka health
curl http://localhost:8081/engines/actuator/health/kafka

# Disk space
curl http://localhost:8081/engines/actuator/health/diskSpace
```

### Getting Help

1. **Check Logs**: Review application logs for error messages
2. **Check Metrics**: Monitor application metrics for anomalies
3. **Check Documentation**: Review this README and other docs
4. **GitHub Issues**: Search for similar issues or create a new one
5. **Contact Support**: Email support@moneyplant.com


## Development

### Project Structure

```
engines/src/main/java/com/moneyplant/engines/ingestion/
├── api/                    # REST API controllers
├── config/                 # Configuration classes
│   ├── IngestionConfig.java
│   ├── KafkaConfig.java
│   └── TimescaleConfig.java
├── controller/             # API controllers
│   ├── IngestionController.java
│   └── MarketDataController.java
├── model/                  # Data models
│   ├── TickData.java
│   ├── OhlcvData.java
│   └── SymbolUniverse.java
├── processor/              # Data processing
│   ├── DataNormalizer.java
│   ├── DataValidator.java
│   └── DataEnricher.java
├── provider/               # Data providers
│   ├── nse/
│   │   ├── NseDataProvider.java
│   │   └── NseApiClient.java
│   └── yahoo/
│       ├── YahooFinanceProvider.java
│       └── YahooApiClient.java
├── publisher/              # Kafka publishers
│   ├── KafkaPublisher.java
│   └── AvroSerializer.java
├── repository/             # Data repositories
│   ├── TimescaleRepository.java
│   ├── OhlcvRepository.java
│   └── NseEquityMasterRepository.java
├── service/                # Business services
│   ├── IngestionService.java
│   ├── SymbolMasterIngestionService.java
│   ├── SymbolUniverseService.java
│   ├── BackfillService.java
│   └── EndOfDayArchivalService.java
└── storage/                # Storage layer
    └── HudiWriter.java
```

### Building from Source

```bash
# Clean build
./mvnw clean install

# Skip tests
./mvnw clean install -DskipTests

# Build with specific profile
./mvnw clean install -P prod

# Build Docker image
./mvnw clean package
docker build -t moneyplant/ingestion-engine:latest .
```

### Running Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=IngestionServiceTest

# Run integration tests
./mvnw verify

# Run with coverage
./mvnw clean test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Code Style

The project follows standard Java conventions:

- **Formatting**: Google Java Style Guide
- **Naming**: CamelCase for classes, camelCase for methods
- **Documentation**: Javadoc for public APIs
- **Testing**: JUnit 5 with Mockito

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-data-provider
   ```

2. **Implement Feature**
   - Add service interface
   - Implement service class
   - Add configuration properties
   - Write unit tests
   - Write integration tests

3. **Update Documentation**
   - Update README
   - Add Javadoc comments
   - Update API documentation

4. **Submit Pull Request**
   - Ensure all tests pass
   - Update CHANGELOG
   - Request code review

### Debugging

#### IntelliJ IDEA

1. Create Run Configuration
2. Set Main Class: `com.moneyplant.engines.EnginesApplication`
3. Set VM Options: `-Dspring.profiles.active=dev`
4. Set Debug Port: 5005
5. Run in Debug Mode

#### VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "java",
  "name": "Debug Ingestion Engine",
  "request": "launch",
  "mainClass": "com.moneyplant.engines.EnginesApplication",
  "projectName": "engines",
  "args": "--spring.profiles.active=dev",
  "vmArgs": "-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
}
```

### Performance Profiling

```bash
# Enable JMX
java -Dcom.sun.management.jmxremote \
  -Dcom.sun.management.jmxremote.port=9010 \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.ssl=false \
  -jar target/engines-0.0.1-SNAPSHOT.jar

# Connect with JConsole
jconsole localhost:9010

# Enable Flight Recorder
java -XX:StartFlightRecording=duration=60s,filename=recording.jfr \
  -jar target/engines-0.0.1-SNAPSHOT.jar
```


## Deployment

### Docker Deployment

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for detailed Docker deployment instructions.

**Quick Docker Deployment**:

```bash
# Build image
docker build -t moneyplant/ingestion-engine:latest .

# Run with Docker Compose
docker compose -f docker-compose.ingestion.yml up -d

# Check status
docker compose -f docker-compose.ingestion.yml ps

# View logs
docker compose -f docker-compose.ingestion.yml logs -f ingestion-engine
```

### Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster (1.25+)
- kubectl configured
- Helm 3.x (optional)

#### Deploy with kubectl

```bash
# Create namespace
kubectl create namespace moneyplant

# Create secrets
kubectl create secret generic db-credentials \
  --from-literal=username=postgres \
  --from-literal=password=your_password \
  -n moneyplant

# Apply manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods -n moneyplant
kubectl logs -f deployment/ingestion-engine -n moneyplant
```

#### Deploy with Helm

```bash
# Add Helm repository
helm repo add moneyplant https://charts.moneyplant.com
helm repo update

# Install chart
helm install ingestion-engine moneyplant/ingestion-engine \
  --namespace moneyplant \
  --create-namespace \
  --set image.tag=latest \
  --set database.password=your_password

# Upgrade
helm upgrade ingestion-engine moneyplant/ingestion-engine \
  --namespace moneyplant \
  --set image.tag=v1.1.0

# Uninstall
helm uninstall ingestion-engine -n moneyplant
```

### Production Checklist

Before deploying to production:

- [ ] Update `application-prod.yml` with production settings
- [ ] Configure production database credentials
- [ ] Set up Kafka cluster with replication
- [ ] Configure S3/MinIO for data lake
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure alerting rules
- [ ] Set up log aggregation (ELK/Loki)
- [ ] Configure backup and disaster recovery
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set resource limits (CPU, memory)
- [ ] Configure auto-scaling policies
- [ ] Set up health checks and readiness probes
- [ ] Configure rolling update strategy
- [ ] Test rollback procedures
- [ ] Document runbook procedures

### Scaling

#### Horizontal Scaling

```bash
# Scale deployment
kubectl scale deployment ingestion-engine --replicas=3 -n moneyplant

# Auto-scaling
kubectl autoscale deployment ingestion-engine \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n moneyplant
```

#### Vertical Scaling

Update resource limits in deployment:

```yaml
resources:
  requests:
    memory: "4Gi"
    cpu: "2000m"
  limits:
    memory: "8Gi"
    cpu: "4000m"
```

### Backup and Recovery

#### Database Backup

```bash
# Backup TimescaleDB
pg_dump -h localhost -U postgres -d MoneyPlant -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -h localhost -U postgres -d MoneyPlant backup_20240115.dump
```

#### Data Lake Backup

```bash
# Backup Hudi tables
aws s3 sync s3://moneyplant-datalake s3://moneyplant-datalake-backup

# Restore
aws s3 sync s3://moneyplant-datalake-backup s3://moneyplant-datalake
```

### Monitoring in Production

- **Uptime Monitoring**: Use external monitoring service
- **Performance Monitoring**: Prometheus + Grafana
- **Log Aggregation**: ELK Stack or Loki
- **Alerting**: PagerDuty or Opsgenie
- **APM**: New Relic or Datadog (optional)


## Performance Tuning

### JVM Tuning

```bash
# Recommended JVM options for production
java -server \
  -Xms4g -Xmx8g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UseStringDeduplication \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxMetaspaceSize=512m \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/var/log/moneyplant/heapdump.hprof \
  -Djava.security.egd=file:/dev/./urandom \
  -jar target/engines-0.0.1-SNAPSHOT.jar
```

### Database Tuning

#### TimescaleDB Configuration

```sql
-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '4GB';

-- Increase work memory
ALTER SYSTEM SET work_mem = '256MB';

-- Increase maintenance work memory
ALTER SYSTEM SET maintenance_work_mem = '1GB';

-- Increase effective cache size
ALTER SYSTEM SET effective_cache_size = '12GB';

-- Reload configuration
SELECT pg_reload_conf();
```

#### Connection Pool Tuning

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 50
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### Kafka Tuning

```yaml
spring:
  kafka:
    producer:
      batch-size: 32768
      linger-ms: 10
      buffer-memory: 67108864
      compression-type: snappy
      acks: 1
```

### Application Tuning

```yaml
ingestion:
  parallelism: 16  # Number of parallel threads
  buffer-size: 100000  # Backpressure buffer size
  batch-size: 1000  # Database batch insert size
```

### Monitoring Performance

```bash
# Check tick processing rate
curl http://localhost:8081/engines/actuator/metrics/ingestion.ticks.rate

# Check database write rate
curl http://localhost:8081/engines/actuator/metrics/ingestion.db.writes

# Check Kafka publish rate
curl http://localhost:8081/engines/actuator/metrics/ingestion.kafka.published

# Check latency percentiles
curl http://localhost:8081/engines/actuator/metrics/ingestion.latency.p99
```

## Architecture Decisions

### Why Reactive Programming?

- **Non-blocking I/O**: Handles thousands of concurrent connections efficiently
- **Backpressure**: Prevents system overload with built-in flow control
- **Resource Efficiency**: Better CPU and memory utilization
- **Scalability**: Scales horizontally with minimal overhead

### Why TimescaleDB?

- **Time-Series Optimized**: Automatic partitioning and compression
- **PostgreSQL Compatible**: Familiar SQL interface and ecosystem
- **Performance**: 10-100x faster than vanilla PostgreSQL for time-series
- **Continuous Aggregates**: Pre-computed rollups for fast queries

### Why Apache Hudi?

- **ACID Transactions**: Ensures data consistency in data lake
- **Incremental Processing**: Efficient updates and deletes
- **Time Travel**: Query historical versions of data
- **Schema Evolution**: Backward-compatible schema changes

### Why Kafka?

- **High Throughput**: Millions of messages per second
- **Durability**: Persistent message storage with replication
- **Scalability**: Horizontal scaling with partitions
- **Ecosystem**: Rich ecosystem of connectors and tools

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is part of the MoneyPlant trading platform. All rights reserved.

## Support

- **Documentation**: https://docs.moneyplant.com
- **GitHub Issues**: https://github.com/moneyplant/engines/issues
- **Email**: support@moneyplant.com
- **Slack**: #ingestion-engine channel

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

## Acknowledgments

- Spring Boot team for the excellent framework
- TimescaleDB team for time-series optimization
- Apache Kafka team for event streaming platform
- Apache Hudi team for data lake table format

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintained by**: MoneyPlant Engineering Team
