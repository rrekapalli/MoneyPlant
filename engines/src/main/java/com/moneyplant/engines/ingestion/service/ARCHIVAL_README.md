# End-of-Day Archival Service

## Overview

The End-of-Day Archival Service automatically archives intraday tick data from TimescaleDB to Apache Hudi at the end of each trading day. This ensures fast intraday query performance while preserving historical data in the data lake for long-term analytics.

## Features

- **Scheduled Archival**: Runs automatically at 5:30 PM IST (12:00 PM UTC) on weekdays
- **Data Integrity Verification**: Ensures source and destination record counts match
- **Automatic Table Truncation**: Clears intraday table after successful archival
- **Metadata Tracking**: Stores archival history in database for auditing
- **Manual Trigger**: Supports manual archival via REST API
- **Retry Failed Archivals**: Ability to retry failed archival operations
- **Comprehensive Logging**: Detailed logs for monitoring and troubleshooting

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                End-of-Day Archival Process                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Scheduled Job (5:30 PM IST)                             │
│     └─> Check if archival already completed                 │
│                                                               │
│  2. Fetch Tick Data from TimescaleDB                        │
│     └─> Query nse_eq_ticks for previous trading day         │
│                                                               │
│  3. Write to Apache Hudi                                     │
│     └─> Partition by date for efficient querying            │
│                                                               │
│  4. Verify Data Integrity                                    │
│     └─> Compare source and destination record counts        │
│                                                               │
│  5. Truncate Intraday Table (if successful)                 │
│     └─> Clear nse_eq_ticks to prepare for next day          │
│                                                               │
│  6. Store Archival Metadata                                  │
│     └─> Save status, counts, duration to database           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Application Properties

```yaml
ingestion:
  storage:
    archival:
      enabled: true                                    # Enable/disable archival
      schedule-cron: "0 0 12 * * MON-FRI"             # 5:30 PM IST = 12:00 PM UTC
      verify-integrity: true                           # Verify record counts match
      auto-truncate: true                              # Truncate table after success
```

### Cron Schedule

The default schedule is `0 0 12 * * MON-FRI` which translates to:
- **12:00 PM UTC** = **5:30 PM IST** (India Standard Time is UTC+5:30)
- **Monday to Friday** (trading days only)

To change the schedule, update the `schedule-cron` property in `application.yml`.

## Database Schema

### archival_metadata Table

```sql
CREATE TABLE archival_metadata (
    id BIGSERIAL PRIMARY KEY,
    archival_date DATE NOT NULL UNIQUE,
    source_record_count BIGINT NOT NULL,
    destination_record_count BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    error_message VARCHAR(2000),
    integrity_check_passed BOOLEAN,
    table_truncated BOOLEAN,
    hudi_table_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### Status Values

- `IN_PROGRESS`: Archival is currently running
- `SUCCESS`: Archival completed successfully
- `FAILED`: Archival failed with errors
- `PARTIAL_SUCCESS`: Archival completed but with warnings

## REST API Endpoints

### Trigger Manual Archival

```bash
POST /api/v1/archival/trigger?date=2024-01-15
```

Manually trigger archival for a specific date.

**Response:**
```json
{
  "date": "2024-01-15",
  "sourceRecordCount": 125000,
  "destinationRecordCount": 125000,
  "success": true,
  "integrityCheckPassed": true,
  "tableTruncated": true,
  "startTime": "2024-01-15T12:00:00Z",
  "endTime": "2024-01-15T12:05:30Z",
  "durationMs": 330000
}
```

### Retry Failed Archival

```bash
POST /api/v1/archival/retry?date=2024-01-15
```

Retry a failed archival operation.

### Get Archival Metadata

```bash
GET /api/v1/archival/metadata?date=2024-01-15
```

Get archival metadata for a specific date.

### Get Archival History

```bash
GET /api/v1/archival/history?startDate=2024-01-01&endDate=2024-01-31
```

Get archival history for a date range.

### Get Failed Archivals

```bash
GET /api/v1/archival/failed
```

Get all failed archival records.

### Health Check

```bash
GET /api/v1/archival/health
```

Check if archival service is running.

## Usage Examples

### Manual Archival

```bash
# Trigger archival for yesterday
curl -X POST "http://localhost:8081/engines/api/v1/archival/trigger?date=2024-01-15"

# Check archival status
curl "http://localhost:8081/engines/api/v1/archival/metadata?date=2024-01-15"
```

### Retry Failed Archival

```bash
# Get all failed archivals
curl "http://localhost:8081/engines/api/v1/archival/failed"

# Retry specific date
curl -X POST "http://localhost:8081/engines/api/v1/archival/retry?date=2024-01-15"
```

### Query Archival History

```bash
# Get history for January 2024
curl "http://localhost:8081/engines/api/v1/archival/history?startDate=2024-01-01&endDate=2024-01-31"
```

## Monitoring

### Log Messages

The service provides comprehensive logging at different levels:

**INFO Level:**
- Archival start and completion
- Record counts and durations
- Success/failure status

**WARN Level:**
- Archival already completed (skip)
- No data found for date
- Table truncation warnings

**ERROR Level:**
- Data integrity check failures
- Hudi write errors
- Database errors

### Example Log Output

```
2024-01-15 17:30:00 [scheduling-1] INFO  EndOfDayArchivalService - === Starting scheduled end-of-day archival for date: 2024-01-14 ===
2024-01-15 17:30:00 [scheduling-1] INFO  EndOfDayArchivalService - Starting archival process for date: 2024-01-14
2024-01-15 17:30:01 [scheduling-1] INFO  EndOfDayArchivalService - Fetched 125000 tick records from TimescaleDB for date: 2024-01-14
2024-01-15 17:30:05 [scheduling-1] INFO  EndOfDayArchivalService - Writing 125000 ticks to Hudi for date: 2024-01-14
2024-01-15 17:35:20 [scheduling-1] INFO  EndOfDayArchivalService - Wrote 125000 records to Hudi for date: 2024-01-14
2024-01-15 17:35:20 [scheduling-1] INFO  EndOfDayArchivalService - Verifying data integrity for date: 2024-01-14 - source: 125000, destination: 125000
2024-01-15 17:35:20 [scheduling-1] INFO  EndOfDayArchivalService - Data integrity check PASSED: counts match (125000)
2024-01-15 17:35:20 [scheduling-1] WARN  EndOfDayArchivalService - Truncating nse_eq_ticks table after successful archival for date: 2024-01-14
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - Successfully truncated nse_eq_ticks table
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - Updated archival metadata for date: 2024-01-14 - status: SUCCESS, duration: 321000ms
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - === Scheduled archival completed successfully for date: 2024-01-14 ===
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ╔════════════════════════════════════════════════════════════════╗
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ║           END-OF-DAY ARCHIVAL SUMMARY                          ║
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ╠════════════════════════════════════════════════════════════════╣
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ║ Date:                    2024-01-14                            ║
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ║ Status:                  SUCCESS                               ║
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ║ Source Records:          125000                                ║
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ║ Destination Records:     125000                                ║
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ║ Integrity Check:         PASSED                                ║
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ║ Table Truncated:         YES                                   ║
2024-01-15 17:35:21 [scheduling-1] INFO  EndOfDayArchivalService - ╚════════════════════════════════════════════════════════════════╝
```

## Troubleshooting

### Archival Fails with Integrity Check Error

**Problem:** Source and destination record counts don't match.

**Solution:**
1. Check Hudi write logs for errors
2. Verify Spark cluster is healthy
3. Check network connectivity to Hudi storage
4. Retry the archival operation

### Table Not Truncated After Archival

**Problem:** `nse_eq_ticks` table still contains data after archival.

**Solution:**
1. Check if `auto-truncate` is enabled in configuration
2. Verify archival completed successfully
3. Check database permissions for TRUNCATE operation
4. Manually truncate if needed (after verifying data in Hudi)

### Scheduled Job Not Running

**Problem:** Archival doesn't run at scheduled time.

**Solution:**
1. Verify `@EnableScheduling` is present in main application class
2. Check if `archival.enabled` is set to `true`
3. Verify cron expression is correct
4. Check application logs for scheduling errors
5. Ensure application is running during scheduled time

### Hudi Write Fails

**Problem:** Error writing data to Apache Hudi.

**Solution:**
1. Check Spark cluster connectivity
2. Verify Hudi base path is accessible
3. Check Hive Metastore connectivity
4. Review Spark logs for detailed errors
5. Verify sufficient disk space

## Performance Considerations

### Expected Performance

- **125,000 records**: ~5-6 minutes
- **500,000 records**: ~15-20 minutes
- **1,000,000 records**: ~30-40 minutes

### Optimization Tips

1. **Increase Spark Parallelism**: Adjust `spark.executor-instances` and `spark.executor-cores`
2. **Tune Batch Size**: Modify `ingestion.storage.batch-size`
3. **Enable Compression**: Use Snappy compression for Parquet files
4. **Optimize Partitioning**: Ensure proper date-based partitioning

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 5.3**: End-of-day archival from TimescaleDB to Apache Hudi
- **Requirement 5.4**: Truncate intraday table after successful archival
- **Requirement 11.1**: Export tick data to data lake
- **Requirement 11.2**: Store archival metadata and track status
- **Requirement 11.8**: Verify data integrity before truncation

## Related Components

- **TimescaleRepository**: Fetches tick data from TimescaleDB
- **HudiWriter**: Writes data to Apache Hudi data lake
- **ArchivalMetadataRepository**: Stores archival history
- **ArchivalController**: REST API for manual operations

## Future Enhancements

1. **Parallel Archival**: Archive multiple dates in parallel
2. **Incremental Archival**: Archive data in smaller batches throughout the day
3. **Compression**: Compress archived data for storage efficiency
4. **Alerting**: Send notifications on archival failures
5. **Dashboard**: Web UI for monitoring archival status
6. **Metrics**: Prometheus metrics for archival operations
