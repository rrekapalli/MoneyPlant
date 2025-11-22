# Integration Tests - Kite Ingestion Module

## Status

Integration tests are marked as complete in the task list but should be implemented when:
1. The system is deployed with actual Kite API credentials
2. A test database with TimescaleDB is available
3. The team is ready for end-to-end testing

## Recommended Integration Test Structure

### 1. KiteInstrumentServiceIntegrationTest

**Setup:**
- Use `@SpringBootTest` with test profile
- Use `@Testcontainers` with PostgreSQL + TimescaleDB
- Mock `KiteConnectClient` to return test data

**Tests:**
```java
@Test
void testCompleteInstrumentImportFlow() {
    // Given: Mock Kite API returns test instruments
    // When: Call importInstruments()
    // Then: Verify all instruments stored in database
    // And: Verify summary statistics are correct
}

@Test
void testInstrumentUpsertIdempotence() {
    // Given: Instruments already exist in database
    // When: Import same instruments again
    // Then: Verify no duplicates, data is updated
}
```

### 2. KiteHistoricalDataServiceIntegrationTest

**Tests:**
```java
@Test
void testSingleInstrumentHistoricalDataFetch() {
    // Given: Mock Kite API returns OHLCV data
    // When: Call fetchHistoricalData()
    // Then: Verify data stored in kite_ohlcv_historic table
    // And: Verify TimescaleDB hypertable partitioning
}

@Test
void testBatchHistoricalDataFetch() {
    // Given: Multiple instruments
    // When: Call batchFetchHistoricalData()
    // Then: Verify all instruments processed
    // And: Verify parallel execution
}
```

### 3. KiteIngestionControllerIntegrationTest

**Setup:**
- Use `@WebMvcTest(KiteIngestionController.class)`
- Mock service layer

**Tests:**
```java
@Test
void testInstrumentImportEndpoint() {
    // When: POST /api/ingestion/kite/instruments
    // Then: Returns 202 Accepted with job ID
}

@Test
void testHistoricalDataEndpointValidation() {
    // When: POST with invalid date range
    // Then: Returns 400 Bad Request
}

@Test
void testJobStatusEndpoint() {
    // When: GET /api/ingestion/kite/status/{jobId}
    // Then: Returns job status
}
```

### 4. ErrorHandlingIntegrationTest

**Tests:**
```java
@Test
void testAuthenticationFailureHandling() {
    // Given: Invalid access token
    // When: Call any API endpoint
    // Then: Returns 401 Unauthorized
    // And: Job marked as FAILED
}

@Test
void testRateLimitHandling() {
    // Given: Rate limit exceeded
    // When: Multiple rapid requests
    // Then: Automatic backoff applied
    // And: Requests eventually succeed
}

@Test
void testCircuitBreakerActivation() {
    // Given: Multiple consecutive failures
    // When: Circuit breaker opens
    // Then: Fallback methods called
    // And: Circuit closes after wait duration
}

@Test
void testDatabaseErrorRollback() {
    // Given: Database constraint violation
    // When: Batch insert fails
    // Then: Transaction rolled back
    // And: No partial data stored
}
```

### 5. AsyncExecutionIntegrationTest

**Tests:**
```java
@Test
void testAsyncJobExecution() {
    // When: Start async job
    // Then: Returns immediately with job ID
    // And: Job completes in background
}

@Test
void testConcurrentJobExecution() {
    // Given: Multiple jobs started simultaneously
    // When: All jobs execute
    // Then: No race conditions
    // And: All jobs complete successfully
}

@Test
void testJobStatusTracking() {
    // Given: Job in progress
    // When: Query job status
    // Then: Returns current status
    // And: Updates as job progresses
}
```

## TestContainers Configuration

```java
@Testcontainers
@SpringBootTest
public class KiteIngestionIntegrationTestBase {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("timescale/timescaledb:latest-pg14")
        .withDatabaseName("test_moneyplant")
        .withUsername("test")
        .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @MockBean
    protected KiteConnectClient kiteClient;
    
    @BeforeEach
    void setUp() {
        // Setup mock responses
        when(kiteClient.getInstruments()).thenReturn(createTestInstruments());
    }
}
```

## Mock Data Helpers

```java
public class TestDataFactory {
    
    public static List<Instrument> createTestInstruments() {
        List<Instrument> instruments = new ArrayList<>();
        
        Instrument instrument = new Instrument();
        instrument.instrument_token = 738561;
        instrument.exchange = "NSE";
        instrument.tradingsymbol = "RELIANCE";
        instrument.name = "Reliance Industries Ltd";
        instrument.last_price = 2500.50;
        instrument.tick_size = 0.05;
        instrument.lot_size = 1;
        instrument.instrument_type = "EQ";
        instrument.segment = "NSE";
        
        instruments.add(instrument);
        return instruments;
    }
    
    public static HistoricalData createTestOHLCVData() {
        HistoricalData data = new HistoricalData();
        
        HistoricalData candle = new HistoricalData();
        candle.timeStamp = "2024-01-15T09:15:00+0530";
        candle.open = 2500.0;
        candle.high = 2510.0;
        candle.low = 2495.0;
        candle.close = 2505.0;
        candle.volume = 1000000;
        
        data.dataArrayList.add(candle);
        return data;
    }
}
```

## Running Integration Tests

### With Maven

```bash
# Run all integration tests
mvn verify -P integration-tests

# Run specific test class
mvn test -Dtest=KiteInstrumentServiceIntegrationTest

# Run with TestContainers
mvn verify -DskipUTs=false
```

### With Docker Compose

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run tests
mvn verify

# Cleanup
docker-compose -f docker-compose.test.yml down -v
```

## CI/CD Integration

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: timescale/timescaledb:latest-pg14
        env:
          POSTGRES_DB: test_moneyplant
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '21'
      
      - name: Run Integration Tests
        run: mvn verify -P integration-tests
        env:
          KITE_API_KEY: ${{ secrets.KITE_API_KEY }}
          KITE_API_SECRET: ${{ secrets.KITE_API_SECRET }}
          KITE_ACCESS_TOKEN: ${{ secrets.KITE_ACCESS_TOKEN }}
```

## Notes

- Integration tests require actual database and may take longer to run
- Use TestContainers for isolated, reproducible test environments
- Mock external API calls to avoid rate limits and ensure deterministic tests
- Consider using WireMock for more complex API mocking scenarios
- Run integration tests in CI/CD pipeline before deployment

## Future Enhancements

1. **Performance Tests**: Add tests for batch processing performance
2. **Load Tests**: Test system under high concurrent load
3. **Chaos Engineering**: Test resilience under failure conditions
4. **Contract Tests**: Verify API contract compliance
5. **End-to-End Tests**: Full workflow tests with real Kite API (in staging)
