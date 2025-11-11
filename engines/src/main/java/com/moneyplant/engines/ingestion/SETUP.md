# Ingestion Engine - Setup Guide

## Overview

This document provides step-by-step instructions for setting up the Ingestion Engine infrastructure and running the application.

## Prerequisites

- Java 21 or higher
- Maven 3.8+
- Docker and Docker Compose
- PostgreSQL 15+ with TimescaleDB extension
- Access to NSE data feeds (for production)

## Infrastructure Setup

### 1. Start Kafka Infrastructure

```bash
# From project root
docker compose -f docker-compose.kafka.yml up -d

# Verify Kafka is running
docker ps | grep kafka

# Access Kafka UI at http://localhost:8082
```

### 2. Start Engines Infrastructure (Spark, Trino, Redis)

```bash
# From project root
cd engines
docker compose up -d
cd ..

# Verify services are running
docker ps | grep moneyplant-engines
```

### 3. Verify Infrastructure Services

- **Kafka UI**: http://localhost:8082
- **Trino UI**: http://localhost:8083
- **Spark Master UI**: http://localhost:8082 (if using engines docker-compose)

### 4. Setup Database Schema

The database schema is automatically created when you run the application with Flyway migrations enabled. However, you can also run it manually:

```bash
# Connect to PostgreSQL
psql -h postgres.tailce422e.ts.net -p 5432 -U postgres -d MoneyPlant

# Run the migration script
\i engines/src/main/resources/db/migration/V001__create_nse_eq_ticks_table.sql
```

**Important**: Ensure TimescaleDB extension is installed:

```sql
-- Check if TimescaleDB is installed
SELECT * FROM pg_extension WHERE extname = 'timescaledb';

-- If not installed, install it (requires superuser privileges)
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

### 5. Create Kafka Topics

Topics are automatically created by the application if they don't exist. However, you can create them manually for better control:

```bash
# Access Kafka container
docker exec -it moneyplant-kafka bash

# Create topics
kafka-topics --create --bootstrap-server localhost:9092 \
  --topic market-data-ticks --partitions 32 --replication-factor 1

kafka-topics --create --bootstrap-server localhost:9092 \
  --topic market-data-candles --partitions 16 --replication-factor 1

kafka-topics --create --bootstrap-server localhost:9092 \
  --topic market-data-indices --partitions 4 --replication-factor 1

kafka-topics --create --bootstrap-server localhost:9092 \
  --topic data-quality-alerts --partitions 4 --replication-factor 1

kafka-topics --create --bootstrap-server localhost:9092 \
  --topic symbol-universe-updates --partitions 1 --replication-factor 1

# List topics
kafka-topics --list --bootstrap-server localhost:9092
```

## Build and Run

### 1. Build the Application

```bash
# From project root
cd engines

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package
mvn clean package -DskipTests
```

### 2. Run the Application

```bash
# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using Java
java -jar target/moneyplant-engines-1.0-SNAPSHOT.jar

# Option 3: Using the start script
./start-engines.sh
```

### 3. Verify Application is Running

```bash
# Check health endpoint
curl http://localhost:8081/engines/actuator/health

# Check metrics
curl http://localhost:8081/engines/actuator/metrics

# Check Prometheus metrics
curl http://localhost:8081/engines/actuator/prometheus
```

## Configuration

### Environment-Specific Profiles

The application supports multiple profiles:

- **local** (default): For local development
- **dev**: For development environment
- **prod**: For production environment
- **docker**: For Docker containerized deployment

Activate a profile:

```bash
# Using Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Using Java
java -jar target/moneyplant-engines-1.0-SNAPSHOT.jar --spring.profiles.active=dev

# Using environment variable
export SPRING_PROFILES_ACTIVE=dev
java -jar target/moneyplant-engines-1.0-SNAPSHOT.jar
```

### Key Configuration Properties

Edit `engines/src/main/resources/application.yml` or create profile-specific files:

```yaml
# Database connection
spring:
  datasource:
    url: jdbc:postgresql://postgres.tailce422e.ts.net:5432/MoneyPlant
    username: postgres
    password: mysecretpassword

# Kafka connection
spring:
  kafka:
    bootstrap-servers: localhost:9092

# Ingestion configuration
ingestion:
  auto-start:
    enabled: false  # Set to true to auto-start ingestion on application startup
  providers:
    nse:
      enabled: true
      rate-limit-per-hour: 1000
    yahoo:
      enabled: true
      rate-limit-per-hour: 2000
```

## Troubleshooting

### Issue: Cannot connect to Kafka

**Solution**:
```bash
# Check if Kafka is running
docker ps | grep kafka

# Check Kafka logs
docker logs moneyplant-kafka

# Restart Kafka
docker compose -f docker-compose.kafka.yml restart
```

### Issue: Cannot connect to PostgreSQL

**Solution**:
```bash
# Test connection
psql -h postgres.tailce422e.ts.net -p 5432 -U postgres -d MoneyPlant

# Check if TimescaleDB extension is installed
psql -h postgres.tailce422e.ts.net -p 5432 -U postgres -d MoneyPlant \
  -c "SELECT * FROM pg_extension WHERE extname = 'timescaledb';"
```

### Issue: Compilation errors with Hudi

**Solution**:
Hudi has many transitive dependencies that can conflict. If you encounter issues:

1. Check for dependency conflicts:
```bash
mvn dependency:tree | grep -i hudi
```

2. Exclude conflicting dependencies in `pom.xml`:
```xml
<dependency>
    <groupId>org.apache.hudi</groupId>
    <artifactId>hudi-spark3.5-bundle_2.12</artifactId>
    <version>0.14.1</version>
    <exclusions>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### Issue: Out of memory errors

**Solution**:
Increase JVM heap size:
```bash
export MAVEN_OPTS="-Xmx2g -Xms512m"
mvn clean compile

# Or for running the application
java -Xmx2g -Xms512m -jar target/moneyplant-engines-1.0-SNAPSHOT.jar
```

## Development Workflow

### 1. Make Code Changes

Edit files in `engines/src/main/java/com/moneyplant/engines/ingestion/`

### 2. Compile and Test

```bash
# Quick compile check
mvn clean compile

# Run tests
mvn test

# Run specific test
mvn test -Dtest=YourTestClass
```

### 3. Verify Changes

```bash
# Run application
mvn spring-boot:run

# Test endpoints
curl http://localhost:8081/engines/actuator/health
```

### 4. Commit Changes

```bash
git add .
git commit -m "[Ingestion Engine] Task X.Y: Your description

- Implementation detail 1
- Implementation detail 2
- Leveraged: ExistingClass1, ExistingClass2
- Verified compilation: ✓
- Tests passing: ✓"
```

## Next Steps

After completing the infrastructure setup:

1. Implement data models (Task 2)
2. Implement repository layer (Task 3)
3. Implement data providers (Task 4)
4. Continue with remaining tasks in `tasks.md`

## Useful Commands

```bash
# Check Java version
java -version

# Check Maven version
mvn -version

# List Docker containers
docker ps -a

# View application logs
tail -f engines/logs/application.log

# View Docker logs
docker logs -f moneyplant-engines

# Stop all services
docker compose -f docker-compose.kafka.yml down
cd engines && docker compose down && cd ..

# Clean Maven build
mvn clean

# Skip tests during build
mvn clean package -DskipTests

# Run with debug logging
mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.com.moneyplant.engines=DEBUG"
```

## Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Project Reactor Documentation](https://projectreactor.io/docs/core/release/reference/)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Apache Hudi Documentation](https://hudi.apache.org/docs/overview)
- [Resilience4j Documentation](https://resilience4j.readme.io/)
