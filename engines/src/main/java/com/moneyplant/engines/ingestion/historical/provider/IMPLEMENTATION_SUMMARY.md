# NSE Bhav Copy Downloader - Implementation Summary

## Overview

Successfully implemented Task 3: "Implement NSE bhavcopy downloader" from the NSE Historical Data Ingestion specification.

## Implementation Details

### File Created
- `NseBhavCopyDownloader.java` - Complete service for downloading NSE bhav copy files

### Features Implemented

#### 3.1 NSE Session Initialization ✓
- Implemented `initializeNseSession()` method
- Visits NSE homepage to establish session and set cookies
- Proper HTTP headers configured:
  - User-Agent: Mozilla/5.0 (Chrome 120)
  - Accept: text/html,application/xhtml+xml,application/xml
  - Accept-Language: en-US,en;q=0.9
  - Accept-Encoding: gzip, deflate, br
  - Connection: keep-alive
  - Cache-Control: max-age=0
  - Security headers (Sec-Fetch-*)
- Retry logic for session initialization (3 attempts with backoff)

#### 3.2 Download Logic ✓
- URL building: `https://www.nseindia.com/content/historical/EQUITIES/{year}/{month}/cm{DDMMMYYYY}bhav.csv.zip`
- Date formatting: `ddMMMyyyy` format (e.g., "15JAN2024")
- Month formatting: `MMM` format (e.g., "JAN")
- WebClient-based reactive download using Spring WebFlux
- **404 Handling**: Gracefully skips dates with 404 errors (weekends/holidays)
- **Retry Logic**: 6 attempts with exponential backoff (1s, 2s, 4s, 8s, 16s, 32s)
- **Rate Limiting**: 300ms delay between consecutive downloads
- Referer header set to NSE homepage for each download

#### 3.3 ZIP Extraction to Staging Directory ✓
- Extracts ZIP files in-memory using `ZipInputStream`
- Saves CSV content to staging directory
- Filename format: `bhav_{YYYYMMDD}.csv` (e.g., "bhav_20240115.csv")
- Staging directory structure: `/tmp/bhav_staging/{jobId}/`
- Automatic directory creation if not exists
- Proper error handling for extraction failures

### Key Methods

1. **`initializeNseSession()`**
   - Establishes NSE session by visiting homepage
   - Sets up cookies for subsequent requests
   - Returns: `Mono<Void>`

2. **`downloadToStaging(LocalDate startDate, LocalDate endDate, Path stagingDir)`**
   - Main entry point for downloading bhav copy files
   - Downloads files for date range sequentially
   - Applies rate limiting between downloads
   - Returns: `Mono<Void>`

3. **`downloadBhavCopyForDate(LocalDate date, Path stagingDir)`**
   - Downloads and extracts bhav copy for a single date
   - Handles 404 errors gracefully (weekends/holidays)
   - Returns: `Mono<Void>`

4. **`downloadBhavCopy(String url)`**
   - Downloads ZIP file from NSE
   - Implements retry logic with exponential backoff
   - Returns: `Mono<byte[]>`

5. **`extractZipToFile(byte[] zipBytes, Path outputPath)`**
   - Extracts ZIP content to CSV file
   - Saves to staging directory
   - Returns: `Mono<Void>`

6. **`buildBhavCopyUrl(LocalDate date)`**
   - Builds NSE bhav copy URL for a specific date
   - Returns: `String`

### Configuration Properties

The service uses the following configuration properties from `application.yml`:

```yaml
ingestion:
  providers:
    nse:
      historical:
        base-url: https://www.nseindia.com
        download-delay-ms: 300
        max-retries: 6
        retry-backoff-multiplier: 2.0
```

### Error Handling

1. **404 Not Found**: Logged as info, does not fail the process (expected for weekends/holidays)
2. **Network Errors**: Retried up to 6 times with exponential backoff
3. **ZIP Extraction Errors**: Logged as error, fails the specific date but continues with others
4. **Session Initialization Errors**: Retried up to 3 times before failing

### Testing

Created comprehensive unit tests in `NseBhavCopyDownloaderTest.java`:
- URL building verification
- Date formatting validation
- Configuration initialization
- Multiple month handling
- Staging directory path handling

All tests pass successfully.

### Requirements Satisfied

- ✓ Requirement 1.1: Download NSE bhavcopy CSV files
- ✓ Requirement 1.2: Use correct URL format
- ✓ Requirement 1.3: NSE session initialization with proper headers
- ✓ Requirement 1.4: Extract ZIP and save to staging directory
- ✓ Requirement 1.8: Handle 404 as missing data
- ✓ Requirement 1.9: Retry logic with exponential backoff
- ✓ Requirement 1.10: Rate limiting between downloads
- ✓ Requirement 1.12: Staging directory management
- ✓ Requirement 6.1: Retry failed downloads
- ✓ Requirement 6.2: Log status codes and errors

### Technology Stack

- Spring WebFlux (WebClient for reactive HTTP)
- Project Reactor (Mono/Flux for reactive streams)
- Java 21
- Lombok for boilerplate reduction
- SLF4J for logging

### Next Steps

The downloader is ready to be integrated with:
1. Spark processing service (Task 4)
2. Date range resolver (Task 6)
3. Ingestion orchestration service (Task 8)
4. REST API endpoints (Task 9)

### Usage Example

```java
@Autowired
private NseBhavCopyDownloader downloader;

public void downloadHistoricalData() {
    LocalDate startDate = LocalDate.of(2024, 1, 1);
    LocalDate endDate = LocalDate.of(2024, 1, 31);
    Path stagingDir = Paths.get("/tmp/bhav_staging/job-123");
    
    downloader.downloadToStaging(startDate, endDate, stagingDir)
        .doOnSuccess(v -> log.info("Download completed"))
        .doOnError(e -> log.error("Download failed", e))
        .subscribe();
}
```

## Compilation Status

✓ Code compiles successfully with no errors
✓ All unit tests pass
✓ No diagnostic issues found

## Completion Status

- [x] Task 3.1: Create NseBhavCopyDownloader service
- [x] Task 3.2: Implement download logic
- [x] Task 3.3: Implement ZIP extraction to staging directory
- [x] Task 3: Implement NSE bhavcopy downloader

**Status**: COMPLETE ✓
