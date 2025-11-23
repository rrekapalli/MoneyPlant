# Ingestion Engine Integration Tests

This directory contains comprehensive integration tests for the Ingestion Engine using Testcontainers.

## Test Coverage

### 1. TimescaleDB Integration Tests (`TimescaleDbIntegrationTest.java`)
Tests TimescaleDB operations including:
- Saving single tick data
- Batch inserting tick data
- Querying tick data by date
- Saving and querying OHLCV data
- Batch operations for OHLCV data
- Table truncation for end-of-day cleanup

### 2. Kafka Publishing Integration Tests (`KafkaPublishingIntegrationTest.java`)
Tests Kafka publishing operations including:
- Publishing tick data to `market-data-ticks` topic
- Publishing OHLCV data to `market-data-candles` topic
- Batch publishing multiple messages
- Symbol-based partitioning strategy
- Message verification with Kafka consumer

### 3. End-to-End Data Flow Tests (`EndToEndDataFlowIntegrationTest.java`)
Tests complete data pipeline including:
- Provider → Validator → Normalizer → Publisher → Storage flow
- Tick data processing pipeline
- OHLCV data processing pipeline
- Batch data processing
- Data validation in pipeline
- Historical data backfill
- Concurrent data processing

### 4. Archival Service Tests (`ArchivalServiceIntegrationTest.java`)
Tests end-of-day archival operations including:
- Archival metadata storage
- Tick data retrieval for archival
- Table truncation after archival
- Archival metadata queries

## Prerequisites

### Required Software
- Docker (for Testcontainers)
- Java 21
- Maven 3.8+

### Docker Images Used
- `timescale/timescaledb:latest-pg15` - TimescaleDB for time-series storage
- `confluentinc/cp-kafka:7.5.0` - Apache Kafka for event streaming

## Running Tests

### Run All Integration Tests
```bash
cd engines
mvn test -Dtest=IntegrationTestSuite
```

### Run Specific Test Class
```bash
# TimescaleDB tests
mvn test -Dtest=TimescaleDbIntegrationTest

# Kafka tests
mvn test -Dtest=KafkaPublishingIntegrationTest

# End-to-end tests
mvn test -Dtest=EndToEndDataFlowIntegrationTest

# Archival tests
mvn test -Dtest=ArchivalServiceIntegrationTest
```

### Run All Tests (including unit tests)
```bash
mvn test
```

## Test Configuration

Tests use `application-test.yml` configuration with the following settings:
- Kafka and auto-start features disabled
- Testcontainers override database and Kafka URLs dynamically
- Reduced connection pool sizes for testing
- Debug logging for ingestion components

## Testcontainers

Tests use Testcontainers to spin up real PostgreSQL (TimescaleDB) and Kafka instances:

```java
@Container
static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("timescale/timescaledb:latest-pg15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test")
        .withInitScript("test-schema.sql");

@Container
static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"))
        .withEmbeddedZookeeper();
```

### Benefits of Testcontainers
- Real database and Kafka instances (not mocks)
- Isolated test environment
- Automatic cleanup after tests
- Consistent behavior across environments

## Test Data

Test schema is initialized from `test-schema.sql` which includes:
- TimescaleDB hypertables for tick and OHLCV data
- Indexes for efficient querying
- Sample symbol master data
- Archival metadata table

## Troubleshooting

### Docker Not Running
```
Error: Could not find a valid Docker environment
```
**Solution**: Start Docker Desktop or Docker daemon

### Port Conflicts
```
Error: Port 5432 is already in use
```
**Solution**: Testcontainers automatically assigns random ports. If issues persist, stop other PostgreSQL/Kafka instances.

### Out of Memory
```
Error: Java heap space
```
**Solution**: Increase Maven memory:
```bash
export MAVEN_OPTS="-Xmx2g"
mvn test
```

### Slow Test Execution
- First run downloads Docker images (may take 5-10 minutes)
- Subsequent runs are faster (images are cached)
- Consider running tests in parallel: `mvn test -T 1C`

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
      - name: Run Integration Tests
        run: cd engines && mvn test -Dtest=IntegrationTestSuite
```

## Best Practices

1. **Clean State**: Each test starts with a clean database (truncate in `@BeforeEach`)
2. **Isolation**: Tests don't depend on each other
3. **Assertions**: Use AssertJ for readable assertions
4. **Reactive Testing**: Use `StepVerifier` for reactive streams
5. **Resource Cleanup**: Testcontainers automatically cleans up containers

## Performance Metrics

Typical test execution times:
- TimescaleDB tests: ~10-15 seconds
- Kafka tests: ~15-20 seconds
- End-to-end tests: ~20-30 seconds
- Archival tests: ~10-15 seconds

Total suite execution: ~60-90 seconds (after Docker images are cached)

## Future Enhancements

- [ ] Add performance benchmarking tests
- [ ] Add chaos engineering tests (network failures, container crashes)
- [ ] Add load testing with JMeter/Gatling
- [ ] Add contract testing for Kafka messages
- [ ] Add mutation testing for test quality
