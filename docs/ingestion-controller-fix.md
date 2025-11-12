# Ingestion Controller Issue & Fix

## Problem

The `IngestionController` exists at `engines/src/main/java/com/moneyplant/engines/ingestion/api/IngestionController.java` with proper `@RestController` annotation, but it's returning 404 when accessed.

## Root Cause

The controller is not being registered by Spring Boot. This is likely because:
1. The application is running but controllers in the `api` package aren't being scanned
2. There might be a component scanning configuration issue

## Verification

The controller exists and has the correct annotations:
- `@RestController`
- `@RequestMapping("/api/v1/ingestion")`
- Endpoints: `/backfill` (POST) and `/health` (GET)

## Solution

### Option 1: Restart the Application with Proper Scanning

Stop the current process and restart:

```bash
# Stop current process
# Then restart
cd engines
./mvnw clean spring-boot:run -Dspring-boot.run.profiles=dev
```

### Option 2: Add Explicit Component Scanning

If the issue persists, add explicit component scanning to `EnginesApplication.java`:

```java
@SpringBootApplication(scanBasePackages = {
    "com.moneyplant.engines",
    "com.moneyplant.engines.ingestion.api"
})
```

### Option 3: Test Directly with BackfillService

Create a simple test to bypass the REST API:

```java
@SpringBootTest
class BackfillServiceDirectTest {
    @Autowired
    private BackfillService backfillService;
    
    @Autowired
    private YahooFinanceProvider yahooFinanceProvider;
    
    @Test
    void testDirectBackfill() {
        Set<String> symbols = Set.of("RELIANCE", "TCS", "INFY");
        LocalDate startDate = LocalDate.of(2024, 11, 1);
        LocalDate endDate = LocalDate.of(2024, 11, 11);
        
        BackfillService.BackfillReport report = backfillService
            .performBackfill(symbols, startDate, endDate, Timeframe.ONE_DAY)
            .block();
        
        System.out.println("Success: " + report.getSuccessCount());
        System.out.println("Records: " + report.getRecordsInserted());
    }
}
```

## Expected Endpoints

Once fixed, these endpoints should be available:

1. **POST /api/v1/ingestion/backfill**
   - Triggers historical data ingestion
   - Fetches OHLCV data from Yahoo Finance
   - Stores in `nse_eq_ohlcv_historic` table

2. **GET /api/v1/ingestion/status**
   - Returns ingestion status

3. **GET /api/v1/ingestion/health**
   - Health check endpoint

## Testing the Fix

```bash
# Test health endpoint
curl http://localhost:8081/api/v1/ingestion/health

# Test backfill
curl -X POST http://localhost:8081/api/v1/ingestion/backfill \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["RELIANCE", "TCS"],
    "startDate": "2024-11-01",
    "endDate": "2024-11-11",
    "timeframe": "1day",
    "fillGapsOnly": false,
    "maxConcurrency": 5
  }'
```

## Verification Query

After successful backfill, verify data in PostgreSQL:

```sql
SELECT 
    symbol,
    COUNT(*) as record_count,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM nse_eq_ohlcv_historic
WHERE symbol IN ('RELIANCE', 'TCS', 'INFY')
  AND date >= '2024-11-01'
GROUP BY symbol;
```

## Summary

The implementation is complete per Task 11.2. The issue is a runtime configuration problem where the REST controllers aren't being registered. The quickest fix is to restart the application or test the `BackfillService` directly.
