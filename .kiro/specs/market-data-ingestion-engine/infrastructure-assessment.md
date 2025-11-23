# Infrastructure Assessment - Ingestion Engine

## Overview

This document assesses the availability of required infrastructure components for implementing and testing the Ingestion Engine on the current development system.

## ✅ Available Infrastructure

### 1. PostgreSQL Database
**Status**: ✅ **AVAILABLE**
- **Connection**: `postgres.tailce422e.ts.net:5432`
- **Database**: `MoneyPlant`
- **Configuration**: `backend/src/main/resources/application.yml`
- **Usage**: Primary database for metadata, symbol master (`nse_eq_master`), and OHLCV data
- **Note**: Can be upgraded to TimescaleDB extension for time-series optimization

### 2. Apache Kafka
**Status**: ✅ **AVAILABLE**
- **Docker Compose**: `docker-compose.kafka.yml` and `engines/docker-compose.yml`
- **Ports**: 
  - Kafka: 9092 (standalone), 9093 (engines)
  - Kafka UI: 8082 (standalone), 8080 (engines)
  - Zookeeper: 2181
- **Configuration**: Already configured in `engines/src/main/resources/application.yml`
- **Dependencies**: Already in `engines/pom.xml` (kafka-clients 3.6.0, spring-kafka)
- **Usage**: Event streaming for market data ticks and candles

### 3. Apache Trino
**Status**: ✅ **AVAILABLE**
- **Connection**: `trino.tailce422e.ts.net:8080`
- **Docker**: Available in `engines/docker-compose.yml` (port 8083)
- **Configuration**: Already configured in `engines/src/main/resources/application.yml`
- **Dependencies**: Already in `engines/pom.xml` (trino-jdbc 441)
- **Usage**: Query engine for data lake (Hudi tables)

### 4. Apache Spark
**Status**: ✅ **AVAILABLE**
- **External Cluster**: spark-master.tailce422e.ts.net:7077
- **Spark Master UI**: http://spark-master.tailce422e.ts.net:8080/
- **Configuration**: Already configured in `engines/src/main/resources/application.yml`
- **Usage**: Distributed processing for historical data analysis
- **Note**: Using external Spark cluster instead of local Docker deployment

### 5. Redis
**Status**: ✅ **AVAILABLE**
- **Docker**: Available in `engines/docker-compose.yml` (port 6380)
- **Configuration**: Referenced in engines docker-compose
- **Usage**: Caching for API layer (optional for MVP)

## ⚠️ Components Requiring Setup

### 1. TimescaleDB Extension
**Status**: ⚠️ **NEEDS SETUP**
- **Current**: Standard PostgreSQL 15
- **Required**: TimescaleDB extension for time-series optimization
- **Action Required**:
  ```sql
  -- Install TimescaleDB extension on existing PostgreSQL
  CREATE EXTENSION IF NOT EXISTS timescaledb;
  
  -- Convert nse_eq_ticks to hypertable
  SELECT create_hypertable('nse_eq_ticks', 'time');
  ```
- **Alternative**: Use standard PostgreSQL for MVP, optimize later
- **Impact**: Medium - Can proceed without it, but performance will be suboptimal

### 2. Apache Hudi
**Status**: ⚠️ **NEEDS DEPENDENCIES**
- **Current**: Configuration exists in `engines/src/main/resources/application.yml`
- **Required**: Maven dependencies for Hudi
- **Action Required**:
  ```xml
  <!-- Add to engines/pom.xml -->
  <dependency>
      <groupId>org.apache.hudi</groupId>
      <artifactId>hudi-spark3.5-bundle_2.12</artifactId>
      <version>0.14.1</version>
  </dependency>
  ```
- **Storage**: Configured to use `/tmp/hudi` (local filesystem)
- **Production**: Will need S3/MinIO for production
- **Impact**: High - Required for end-of-day archival

### 3. S3/MinIO for Data Lake
**Status**: ⚠️ **NEEDS SETUP**
- **Current**: Hudi configured to use `/tmp/hudi` (local filesystem)
- **Required**: S3-compatible storage for production
- **Options**:
  1. **Local Development**: Use `/tmp/hudi` (already configured)
  2. **Docker MinIO**: Add MinIO container to docker-compose
  3. **Cloud S3**: Use AWS S3 for production
- **Action Required for Local Dev**:
  ```yaml
  # Add to engines/docker-compose.yml
  minio:
    image: minio/minio:latest
    container_name: moneyplant-engines-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - moneyplant-network
  ```
- **Impact**: Medium - Can use local filesystem for MVP

### 4. Project Reactor Dependencies
**Status**: ⚠️ **NEEDS DEPENDENCIES**
- **Current**: Not in pom.xml
- **Required**: For reactive programming (WebSocket, Kafka)
- **Action Required**:
  ```xml
  <!-- Add to engines/pom.xml -->
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webflux</artifactId>
  </dependency>
  <dependency>
      <groupId>io.projectreactor</groupId>
      <artifactId>reactor-core</artifactId>
  </dependency>
  ```
- **Impact**: High - Core requirement for reactive streams

### 5. Avro Serialization
**Status**: ⚠️ **NEEDS DEPENDENCIES**
- **Current**: Not in pom.xml
- **Required**: For Kafka message serialization
- **Action Required**:
  ```xml
  <!-- Add to engines/pom.xml -->
  <dependency>
      <groupId>org.apache.avro</groupId>
      <artifactId>avro</artifactId>
      <version>1.11.3</version>
  </dependency>
  <dependency>
      <groupId>io.confluent</groupId>
      <artifactId>kafka-avro-serializer</artifactId>
      <version>7.5.0</version>
  </dependency>
  ```
- **Note**: Requires Confluent Schema Registry or can use simple Avro without registry
- **Impact**: Medium - Can use JSON serialization for MVP

## 📋 Setup Checklist for Development

### Immediate Setup (Before Starting Implementation)

- [ ] 1. **Start Infrastructure Services**
  ```bash
  # Start Kafka
  docker-compose -f docker-compose.kafka.yml up -d
  
  # Start Engines infrastructure (Spark, Trino, etc.)
  cd engines
  docker-compose up -d
  ```

- [ ] 2. **Add Required Maven Dependencies**
  - Add to `engines/pom.xml`:
    - Spring WebFlux (Reactor)
    - Apache Hudi
    - Apache Avro
    - Resilience4j (Circuit Breaker)
  - Run: `mvn clean install`

- [ ] 3. **Create Database Schema**
  ```sql
  -- Create nse_eq_ticks table
  CREATE TABLE nse_eq_ticks (
      time TIMESTAMPTZ NOT NULL,
      symbol VARCHAR(20) NOT NULL,
      price NUMERIC(18,4) NOT NULL,
      volume BIGINT NOT NULL,
      bid NUMERIC(18,4),
      ask NUMERIC(18,4),
      metadata JSONB
  );
  
  -- Create index
  CREATE INDEX idx_ticks_symbol_time ON nse_eq_ticks (symbol, time DESC);
  ```

- [ ] 4. **Verify Kafka Topics**
  ```bash
  # Access Kafka UI at http://localhost:8082
  # Or create topics manually:
  docker exec -it moneyplant-kafka kafka-topics --create \
    --bootstrap-server localhost:9092 \
    --topic market-data-ticks \
    --partitions 32 \
    --replication-factor 1
  ```

- [ ] 5. **Test Trino Connection**
  ```bash
  # Access Trino UI at http://localhost:8083
  # Or test via JDBC
  ```

### Optional Setup (Can be done later)

- [ ] 6. **Install TimescaleDB Extension** (Optional for MVP)
  ```sql
  CREATE EXTENSION IF NOT EXISTS timescaledb;
  SELECT create_hypertable('nse_eq_ticks', 'time');
  ```

- [ ] 7. **Setup MinIO** (Optional - can use local filesystem)
  - Add MinIO to docker-compose
  - Configure Hudi to use MinIO endpoint

- [ ] 8. **Setup Schema Registry** (Optional - can use simple Avro)
  - Add Confluent Schema Registry to docker-compose
  - Configure Kafka producers/consumers

## 🧪 Testing Strategy

### Local Development Testing

1. **Unit Tests**: Use JUnit 5 + Mockito (no infrastructure needed)
2. **Integration Tests**: Use Testcontainers
   ```xml
   <dependency>
       <groupId>org.testcontainers</groupId>
       <artifactId>testcontainers</artifactId>
       <version>1.19.3</version>
       <scope>test</scope>
   </dependency>
   <dependency>
       <groupId>org.testcontainers</groupId>
       <artifactId>postgresql</artifactId>
       <version>1.19.3</version>
       <scope>test</scope>
   </dependency>
   <dependency>
       <groupId>org.testcontainers</groupId>
       <artifactId>kafka</artifactId>
       <version>1.19.3</version>
       <scope>test</scope>
   </dependency>
   ```

3. **End-to-End Tests**: Use docker-compose infrastructure
   - Start all services: `docker-compose -f engines/docker-compose.yml up -d`
   - Run application: `./start-engines.sh`
   - Execute test scenarios
   - Verify data in Kafka UI, database, and Trino

### Production-like Testing

1. **Performance Testing**: Use JMH for benchmarking
2. **Load Testing**: Use Gatling or JMeter
3. **Chaos Testing**: Stop/restart services to test resilience

## 📊 Resource Requirements

### Minimum Development System

- **CPU**: 4 cores (8 recommended)
- **RAM**: 8GB (16GB recommended)
- **Disk**: 20GB free space
- **Docker**: 4GB memory allocation minimum

### Docker Container Resources

```yaml
# Recommended docker-compose resource limits
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 1G
  kafka:
    deploy:
      resources:
        limits:
          memory: 1G
  spark-master:
    deploy:
      resources:
        limits:
          memory: 2G
  trino:
    deploy:
      resources:
        limits:
          memory: 2G
```

## 🚀 Quick Start Commands

```bash
# 1. Start infrastructure
docker-compose -f docker-compose.kafka.yml up -d
cd engines && docker-compose up -d && cd ..

# 2. Verify services
docker ps
curl http://localhost:8082  # Kafka UI
curl http://localhost:8083  # Trino UI
curl http://localhost:8082  # Spark UI

# 3. Build and run engines
cd engines
mvn clean install
./start-engines.sh

# 4. Check logs
docker-compose logs -f
tail -f engines/logs/application.log
```

## ✅ Conclusion

**Overall Status**: ✅ **READY FOR IMPLEMENTATION**

- **Available**: Kafka, Trino, Spark, PostgreSQL, Redis
- **Needs Setup**: Hudi dependencies, Reactor dependencies, Avro dependencies
- **Optional**: TimescaleDB extension, MinIO, Schema Registry

**Recommendation**: 
1. Add required Maven dependencies first (Task 1)
2. Start with local filesystem for Hudi (`/tmp/hudi`)
3. Use JSON serialization for Kafka initially (can upgrade to Avro later)
4. Proceed with implementation - all critical infrastructure is available

**Estimated Setup Time**: 1-2 hours for adding dependencies and creating database schema
