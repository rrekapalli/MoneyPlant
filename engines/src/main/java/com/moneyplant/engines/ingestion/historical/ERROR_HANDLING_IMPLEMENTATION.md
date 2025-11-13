# Error Handling and Resilience Implementation

## Overview

This document describes the error handling and resilience features implemented for the NSE Historical Data Ingestion service.

## Implemented Features

### 1. Retry Policy Configuration (Task 12.1)

**Location**: `engines/src/main/java/com/moneyplant/engines/ingestion/historical/config/RetryConfig.java`

**Features**:
- **Download Retry**: Configured using Resilience4j with exponential backoff
  - Max attempts: 6 (configurable via `ingestion.providers.nse.historical.max-retries`)
  - Initial interval: 1 second
  - Backoff multiplier: 2.0 (configurable via `ingestion.providers.nse.historical.retry-backoff-multiplier`)
  - Max interval: 32 seconds
  - Retry on all exceptions except 404 Not Found (expected for weekends/holidays)
  - Event listeners for logging retry attempts, successes, and failures

- **Database Retry**: Configured for transient database errors
  - Max attempts: 3 (configurable via `ingestion.providers.nse.historical.db-max-retries`)
  - Wait duration: 2 seconds (fixed)
  - Retry on connection failures, timeouts, deadlocks, and temporary errors
  - Event listeners for logging retry attempts, successes, and failures

**Configuration**:
```yaml
ingestion:
  providers:
    nse:
      historical:
        max-retries: 6
        retry-backoff-multiplier: 2.0
        db-max-retries: 3
```

**Requirements Satisfied**: 6.1

### 2. Database Retry Implementation (Task 12.2)

**Location**: `engines/src/main/java/com/moneyplant/engines/ingestion/historical/service/SparkProcessingServiceImpl.java`

**Features**:
- Wrapped Spark JDBC write operations with Resilience4j retry logic
- Retries batch inserts up to 3 times on connection failures
- Logs failed batches with detailed error messages
- Continues processing even if individual batches fail
- Returns comprehensive ingestion statistics including failed records

**Implementation**:
```java
databaseRetry.executeSupplier(() -> {
    try {
        transformed.write()
            .mode(SaveMode.Append)
            .format("jdbc")
            // ... JDBC options ...
            .save();
        return null;
    } catch (Exception e) {
        log.error("Database write failed: {}", e.getMessage());
        throw new RuntimeException("Database write failed", e);
    }
});
```

**Requirements Satisfied**: 6.4, 6.5

### 3. Resume Functionality (Task 12.3)

**Database Schema**:
- Added `last_processed_date` column to `ingestion_jobs` table
- Migration script: `V1.0.7__add_last_processed_date_to_ingestion_jobs.sql`
- Index for efficient querying of resumable jobs

**Model Updates**:
- `IngestionJob.java`: Added `lastProcessedDate` field and helper methods
  - `updateLastProcessedDate(LocalDate)`: Updates the last processed date
  - `canResume()`: Checks if a job can be resumed
  
**Service Updates**:
- `HistoricalDataJobService.java`: Added `updateLastProcessedDate()` method
- `NseBhavCopyIngestionService.java`: 
  - Added `resumeIngestion(String jobId)` method
  - Modified download callback to track last processed date
  - Validates job can be resumed before starting
  - Calculates remaining date range from last processed date + 1

**Provider Updates**:
- `NseBhavCopyDownloader.java`: 
  - Added callback parameter to `downloadToStaging()` method
  - Invokes callback after each date is successfully downloaded
  - Maintains backward compatibility with overloaded method

**Controller Updates**:
- `HistoricalIngestionController.java`: Added resume endpoint
  - `POST /api/v1/ingestion/historical/nse/{jobId}/resume`
  - Returns 202 Accepted on success
  - Returns 404 Not Found if job doesn't exist
  - Returns 400 Bad Request if job cannot be resumed
  - Returns 500 Internal Server Error on other failures

**Usage Example**:
```bash
# Resume a failed or timed-out job
curl -X POST http://localhost:8081/engines/api/v1/ingestion/historical/nse/{jobId}/resume

# Response
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Ingestion job resumed successfully. Use the jobId to query status.",
  "status": "RUNNING"
}
```

**Requirements Satisfied**: 6.8

## Error Handling Flow

### Download Errors
1. Network error occurs during bhav copy download
2. Resilience4j retry policy kicks in
3. Retries up to 6 times with exponential backoff (1s, 2s, 4s, 8s, 16s, 32s)
4. Logs each retry attempt with attempt number and error message
5. If all retries fail, logs final error and continues with next date
6. 404 errors are not retried (expected for weekends/holidays)

### Database Errors
1. Database connection failure during Spark write
2. Resilience4j retry policy kicks in
3. Retries up to 3 times with 2-second delay
4. Logs each retry attempt with attempt number and error message
5. If all retries fail, logs final error and throws exception
6. Job is marked as FAILED with error details

### Job Interruption
1. Job fails or times out during execution
2. Last successfully processed date is tracked in database
3. User can resume the job via REST API
4. Service validates job can be resumed
5. Calculates remaining date range from last processed date + 1
6. Continues ingestion from where it left off

## Monitoring and Observability

### Retry Events
- All retry attempts are logged with:
  - Attempt number
  - Total max attempts
  - Error message
  - Success/failure status

### Job Progress Tracking
- Last processed date is updated after each successful download
- Progress percentage calculated based on processed dates
- Estimated time remaining calculated based on average processing time

### Error Logging
- Download errors: Logged with date and exception details
- Database errors: Logged with batch size and exception details
- Resume errors: Logged with job ID and validation failure reason

## Testing Recommendations

### Unit Tests
- Test retry policy configuration
- Test database retry logic with mock failures
- Test resume validation logic
- Test last processed date tracking

### Integration Tests
- Test download retry with simulated network failures
- Test database retry with Testcontainers and connection failures
- Test resume functionality with interrupted jobs
- Test end-to-end flow with failures and recovery

### Manual Testing
1. Start an ingestion job with a large date range
2. Kill the process mid-execution
3. Verify last_processed_date is updated in database
4. Resume the job via REST API
5. Verify job continues from last processed date + 1

## Configuration Reference

```yaml
ingestion:
  providers:
    nse:
      historical:
        # Download retry configuration
        max-retries: 6                      # Max download retry attempts
        retry-backoff-multiplier: 2.0       # Exponential backoff multiplier
        
        # Database retry configuration
        db-max-retries: 3                   # Max database retry attempts
        
        # Job timeout configuration
        job-timeout-hours: 6                # Job timeout in hours
        
        # Other settings
        download-delay-ms: 300              # Delay between downloads
        staging-directory: /tmp/bhav_staging # Staging directory for CSV files
```

## API Endpoints

### Start Ingestion
```
POST /api/v1/ingestion/historical/nse
Body: { "startDate": "2024-01-01", "endDate": "2024-01-31" }
Response: { "jobId": "...", "message": "...", "status": "PENDING" }
```

### Resume Ingestion
```
POST /api/v1/ingestion/historical/nse/{jobId}/resume
Response: { "jobId": "...", "message": "...", "status": "RUNNING" }
```

### Query Job Status
```
GET /api/v1/ingestion/historical/nse/{jobId}
Response: { 
  "jobId": "...", 
  "status": "RUNNING",
  "progressPercentage": 45,
  "lastProcessedDate": "2024-01-15",
  ...
}
```

## Requirements Traceability

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| 6.1 | RetryConfig.downloadRetry() | ✅ Complete |
| 6.4 | RetryConfig.databaseRetry() | ✅ Complete |
| 6.5 | SparkProcessingServiceImpl with retry | ✅ Complete |
| 6.8 | Resume functionality | ✅ Complete |

## Future Enhancements

1. **Circuit Breaker**: Add circuit breaker pattern for NSE API calls
2. **Rate Limiter**: Add rate limiting to prevent overwhelming NSE servers
3. **Bulkhead**: Isolate download and database operations
4. **Metrics**: Export retry metrics to Prometheus
5. **Alerts**: Configure alerts for high retry rates or frequent failures
6. **Auto-Resume**: Automatically resume failed jobs after a delay
