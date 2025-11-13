# NSE Historical Data Ingestion - Testing Guide

This guide will help you test the complete historical data ingestion functionality.

## Prerequisites

1. **Database**: PostgreSQL/TimescaleDB running and accessible
   - Host: `postgres.tailce422e.ts.net:5432`
   - Database: `MoneyPlant`
   - User: `postgres`

2. **Spark**: Spark cluster running (optional for local testing)
   - Master: `spark://spark-master.tailce422e.ts.net:7077`
   - Or use local mode: `local[*]`

3. **Java**: Java 21 installed
4. **Maven**: Maven 3.6+ installed

## Step 1: Apply Database Migration

The new migration adds the `last_processed_date` column for resume functionality.

```bash
# Check if migration is needed
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c "\d ingestion_jobs"

# If last_processed_date column is missing, apply migration manually:
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -f src/main/resources/db/migration/V1.0.7__add_last_processed_date_to_ingestion_jobs.sql
```

Or let Flyway apply it automatically when the application starts.

## Step 2: Configure Application (Optional)

Edit `src/main/resources/application.yml` if needed:

```yaml
# For local Spark testing, change to:
spark:
  master: local[*]  # Use all available cores locally

# For smaller batch sizes during testing:
spark:
  jdbc-batch-size: 1000
  jdbc-num-partitions: 2
```

## Step 3: Start the Application

### Option A: Using Maven (Recommended for testing)

```bash
cd engines
mvn spring-boot:run
```

### Option B: Using packaged JAR

```bash
cd engines
mvn clean package -DskipTests
java -jar target/moneyplant-engines-1.0-SNAPSHOT.jar
```

### Option C: Using IDE

Run the main class: `com.moneyplant.engines.EnginesApplication`

## Step 4: Verify Application Started

Wait for the application to start (look for "Started EnginesApplication" in logs), then:

```bash
# Check health endpoint
curl http://localhost:8081/engines/api/v1/ingestion/historical/nse/health

# Expected response: "Historical ingestion service is running"
```

## Step 5: Run the Test Script

The test script will:
1. Check if service is running
2. Start an ingestion job for a small date range
3. Monitor progress in real-time
4. Verify data was inserted into the database

```bash
cd engines
./test-historical-ingestion.sh
```

## Step 6: Manual Testing

### Test 1: Start Ingestion Job

```bash
# Start ingestion for a small date range (5 days)
curl -X POST http://localhost:8081/engines/api/v1/ingestion/historical/nse \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-11-01",
    "endDate": "2024-11-05"
  }'

# Response will contain jobId:
# {
#   "jobId": "550e8400-e29b-41d4-a716-446655440000",
#   "message": "Ingestion job started successfully...",
#   "status": "PENDING"
# }
```

### Test 2: Check Job Status

```bash
# Replace JOB_ID with the actual job ID from previous response
JOB_ID="550e8400-e29b-41d4-a716-446655440000"

curl http://localhost:8081/engines/api/v1/ingestion/historical/nse/${JOB_ID}

# Response will show progress:
# {
#   "jobId": "...",
#   "status": "RUNNING",
#   "progressPercentage": 45,
#   "startDate": "2024-11-01",
#   "endDate": "2024-11-05",
#   "totalDates": 5,
#   "processedDates": 2,
#   "totalRecords": 100000,
#   "insertedRecords": 99500,
#   "failedRecords": 500,
#   "estimatedSecondsRemaining": 120
# }
```

### Test 3: Verify Data in Database

```bash
# Count records inserted
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c \
  "SELECT COUNT(*) FROM nse_eq_ohlcv_historic WHERE time >= '2024-11-01' AND time <= '2024-11-05'"

# View sample records
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c \
  "SELECT time, symbol, open, high, low, close, volume 
   FROM nse_eq_ohlcv_historic 
   WHERE time >= '2024-11-01' AND time <= '2024-11-05' 
   ORDER BY time DESC 
   LIMIT 10"

# Check job record
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c \
  "SELECT job_id, status, start_date, end_date, last_processed_date, 
          processed_dates, total_records, inserted_records, failed_records 
   FROM ingestion_jobs 
   ORDER BY started_at DESC 
   LIMIT 5"
```

### Test 4: Test Resume Functionality

To test resume functionality, you need to simulate a job failure:

```bash
# Option 1: Kill the application mid-job
# Start a large ingestion job, then kill the application after a few minutes

# Option 2: Manually mark a job as FAILED
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c \
  "UPDATE ingestion_jobs 
   SET status = 'FAILED', last_processed_date = '2024-11-03' 
   WHERE job_id = 'YOUR_JOB_ID'"

# Then resume the job
curl -X POST http://localhost:8081/engines/api/v1/ingestion/historical/nse/YOUR_JOB_ID/resume

# The job should continue from 2024-11-04 onwards
```

### Test 5: Test Error Handling

#### Test Download Retry

```bash
# Start ingestion during NSE maintenance window or with invalid dates
curl -X POST http://localhost:8081/engines/api/v1/ingestion/historical/nse \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-12-25",
    "endDate": "2024-12-25"
  }'

# Check logs for retry attempts
# You should see messages like:
# "Download retry attempt 1/6: ..."
# "Download retry attempt 2/6: ..."
```

#### Test Database Retry

```bash
# Temporarily stop the database or block connections
# Start an ingestion job
# Check logs for database retry attempts
# You should see messages like:
# "Database retry attempt 1/3: ..."
```

## Expected Results

### Successful Ingestion

1. **Job Status**: Should progress from PENDING → RUNNING → COMPLETED
2. **Progress**: Should show increasing percentage and processed dates
3. **Database**: Should contain records in `nse_eq_ohlcv_historic` table
4. **Logs**: Should show:
   - NSE session initialization
   - Download progress for each date
   - Spark processing statistics
   - Final completion message

### Sample Log Output

```
2025-11-13 16:15:00 [main] INFO  c.m.e.i.h.s.NseBhavCopyIngestionService - Starting NSE historical data ingestion - jobId: abc-123, startDate: 2024-11-01, endDate: 2024-11-05
2025-11-13 16:15:01 [main] INFO  c.m.e.i.h.p.NseBhavCopyDownloader - Initializing NSE session by visiting homepage
2025-11-13 16:15:02 [main] INFO  c.m.e.i.h.p.NseBhavCopyDownloader - NSE session initialized successfully
2025-11-13 16:15:02 [main] INFO  c.m.e.i.h.p.NseBhavCopyDownloader - Starting bhav copy download from 2024-11-01 to 2024-11-05
2025-11-13 16:15:03 [main] INFO  c.m.e.i.h.p.NseBhavCopyDownloader - Successfully downloaded and extracted bhav copy for date: 2024-11-01
2025-11-13 16:15:04 [main] INFO  c.m.e.i.h.s.HistoricalDataJobServiceImpl - Updated last processed date: jobId=abc-123, lastProcessedDate=2024-11-01
...
2025-11-13 16:15:20 [main] INFO  c.m.e.i.h.s.SparkProcessingServiceImpl - Starting Spark processing for staging directory: /tmp/bhav_staging/abc-123
2025-11-13 16:15:21 [main] INFO  c.m.e.i.h.s.SparkProcessingServiceImpl - Read 50000 records from CSV files
2025-11-13 16:15:25 [main] INFO  c.m.e.i.h.s.SparkProcessingServiceImpl - Writing 49500 valid records to PostgreSQL
2025-11-13 16:15:30 [main] INFO  c.m.e.i.h.s.SparkProcessingServiceImpl - Successfully inserted 49500 records in 5 seconds
2025-11-13 16:15:30 [main] INFO  c.m.e.i.h.s.NseBhavCopyIngestionService - Job abc-123 completed successfully
```

## Troubleshooting

### Issue: "Service not running"

**Solution**: Start the application using one of the methods in Step 3.

### Issue: "Connection refused" to database

**Solution**: 
- Check database is running: `psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c "SELECT 1"`
- Check connection settings in `application.yml`
- Verify network connectivity to database host

### Issue: "Connection refused" to Spark

**Solution**:
- Change Spark master to local mode in `application.yml`:
  ```yaml
  spark:
    master: local[*]
  ```
- Or start Spark cluster

### Issue: "404 Not Found" for bhav copy downloads

**Solution**: This is expected for weekends and holidays. The system will skip these dates automatically.

### Issue: Job stuck in RUNNING status

**Solution**:
- Check application logs for errors
- Check Spark UI: http://localhost:4040 (if using local mode)
- Check database connectivity
- Verify staging directory has write permissions: `/tmp/bhav_staging`

### Issue: No records inserted

**Solution**:
- Check if dates are weekends/holidays (NSE doesn't publish data)
- Check Spark logs for transformation errors
- Verify database table exists: `\d nse_eq_ohlcv_historic`
- Check for data validation errors in logs

## Performance Benchmarks

Expected performance (approximate):

- **Download**: ~1-2 seconds per date (with 300ms delay between requests)
- **Spark Processing**: ~5-10 seconds per 50,000 records
- **Total**: ~5-10 minutes for 1 month of data (~20 trading days)

## Next Steps

After successful testing:

1. **Larger Date Range**: Test with a full year of data
2. **Resume Testing**: Simulate failures and test resume functionality
3. **Concurrent Jobs**: Test multiple jobs running simultaneously
4. **Performance Tuning**: Adjust batch sizes and parallelism
5. **Monitoring**: Set up Prometheus metrics and Grafana dashboards

## API Reference

### Start Ingestion

```
POST /api/v1/ingestion/historical/nse
Content-Type: application/json

{
  "startDate": "2024-01-01",  // Optional
  "endDate": "2024-01-31"     // Optional
}

Response: 202 Accepted
{
  "jobId": "uuid",
  "message": "Ingestion job started successfully",
  "status": "PENDING"
}
```

### Get Job Status

```
GET /api/v1/ingestion/historical/nse/{jobId}

Response: 200 OK
{
  "jobId": "uuid",
  "status": "RUNNING|COMPLETED|FAILED|TIMEOUT",
  "progressPercentage": 45,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "totalDates": 20,
  "processedDates": 9,
  "totalRecords": 450000,
  "insertedRecords": 448500,
  "failedRecords": 1500,
  "startedAt": "2024-01-01T10:00:00Z",
  "estimatedSecondsRemaining": 1200
}
```

### Resume Job

```
POST /api/v1/ingestion/historical/nse/{jobId}/resume

Response: 202 Accepted
{
  "jobId": "uuid",
  "message": "Ingestion job resumed successfully",
  "status": "RUNNING"
}
```

### Health Check

```
GET /api/v1/ingestion/historical/nse/health

Response: 200 OK
"Historical ingestion service is running"
```
