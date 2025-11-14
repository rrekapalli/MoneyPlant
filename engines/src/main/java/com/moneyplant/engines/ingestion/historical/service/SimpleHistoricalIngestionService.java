package com.moneyplant.engines.ingestion.historical.service;

import com.moneyplant.engines.ingestion.historical.model.IngestionJob;
import com.moneyplant.engines.ingestion.historical.model.IngestionJobStatus;
import com.moneyplant.engines.ingestion.historical.provider.NseBhavCopyDownloader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Simple, direct implementation of historical data ingestion.
 * No reactive programming, no Spark - just straightforward JDBC batch inserts.
 * This is a fallback/alternative to the Spark-based implementation.
 */
@Service
@Slf4j
public class SimpleHistoricalIngestionService {
    
    @Autowired
    private NseBhavCopyDownloader downloader;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private HistoricalDataJobService jobService;
    
    @Autowired
    private DateRangeResolver dateRangeResolver;
    
    @Value("${ingestion.providers.nse.historical.staging-directory:/tmp/bhav_staging}")
    private String stagingBaseDir;
    
    /**
     * Start ingestion using simple, direct approach.
     */
    public String startSimpleIngestion(LocalDate startDate, LocalDate endDate) {
        String jobId = UUID.randomUUID().toString();
        
        log.info("=== STARTING SIMPLE INGESTION ===");
        log.info("Job ID: {}", jobId);
        log.info("Date range: {} to {}", startDate, endDate);
        
        // Resolve date range
        var dateRange = dateRangeResolver.resolveDateRange(startDate, endDate).block();
        
        if (dateRange == null || dateRange.isEmpty()) {
            log.warn("No ingestion needed - data is up to date");
            return null;
        }
        
        // Create job
        IngestionJob job = jobService.createJob(jobId, dateRange).block();
        
        // Execute asynchronously
        executeSimpleIngestionAsync(job, dateRange);
        
        return jobId;
    }
    
    @Async
    public void executeSimpleIngestionAsync(IngestionJob job, com.moneyplant.engines.ingestion.historical.model.DateRange dateRange) {
        String jobId = job.getJobId();
        Path stagingDir = Paths.get(stagingBaseDir, jobId);
        Instant startTime = Instant.now();
        
        log.info("=== SIMPLE INGESTION ASYNC EXECUTION ===");
        log.info("Job: {}", jobId);
        log.info("Staging: {}", stagingDir);
        
        try {
            // Update to RUNNING
            jobService.updateStatus(jobId, IngestionJobStatus.RUNNING).block();
            
            // 1. DOWNLOAD FILES
            log.info("Step 1: Downloading files...");
            downloader.downloadToStaging(
                    dateRange.getStart(),
                    dateRange.getEnd(),
                    stagingDir,
                    processedDate -> {
                        log.info("Downloaded: {}", processedDate);
                        jobService.updateLastProcessedDate(jobId, processedDate).subscribe();
                    });
            
            log.info("Download complete!");
            
            // 2. LIST FILES
            log.info("Step 2: Listing downloaded files...");
            List<Path> csvFiles = new ArrayList<>();
            Files.list(stagingDir)
                    .filter(p -> p.toString().endsWith(".csv"))
                    .forEach(csvFiles::add);
            
            log.info("Found {} CSV files", csvFiles.size());
            
            if (csvFiles.isEmpty()) {
                log.warn("No CSV files to process!");
                jobService.completeJob(jobId, createEmptyResult()).block();
                return;
            }
            
            // 3. PROCESS FILES WITH SIMPLE JDBC
            log.info("Step 3: Processing files with JDBC...");
            int totalRecords = 0;
            int insertedRecords = 0;
            
            for (Path csvFile : csvFiles) {
                log.info("Processing file: {}", csvFile.getFileName());
                
                try (BufferedReader reader = new BufferedReader(new FileReader(csvFile.toFile()))) {
                    String line;
                    boolean isHeader = true;
                    List<String[]> batch = new ArrayList<>();
                    
                    while ((line = reader.readLine()) != null) {
                        if (isHeader) {
                            isHeader = false;
                            log.info("CSV Header: {}", line);
                            continue; // Skip header
                        }
                        
                        totalRecords++;
                        String[] fields = line.split(",");
                        
                        if (fields.length >= 13) {
                            batch.add(fields);
                            
                            // Batch insert every 1000 records
                            if (batch.size() >= 1000) {
                                int batchInserted = insertBatch(batch);
                                insertedRecords += batchInserted;
                                log.info("Batch processed: {} inserted", batchInserted);
                                batch.clear();
                            }
                        } else {
                            log.debug("Skipping record with {} fields (need 13+)", fields.length);
                        }
                    }
                    
                    // Insert remaining records
                    if (!batch.isEmpty()) {
                        insertedRecords += insertBatch(batch);
                    }
                    
                    log.info("Processed {}: {} records", csvFile.getFileName(), totalRecords);
                }
            }
            
            log.info("Processing complete: {} total, {} inserted", totalRecords, insertedRecords);
            
            // 4. CLEANUP
            log.info("Step 4: Cleaning up...");
            Files.walk(stagingDir)
                    .sorted(java.util.Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (Exception e) {
                            log.warn("Failed to delete: {}", path);
                        }
                    });
            
            // 5. COMPLETE JOB
            var result = com.moneyplant.engines.ingestion.historical.model.IngestionResult.builder()
                    .totalRecordsProcessed(totalRecords)
                    .totalRecordsInserted(insertedRecords)
                    .totalRecordsFailed(totalRecords - insertedRecords)
                    .duration(java.time.Duration.between(startTime, Instant.now()))
                    .build();
            
            jobService.completeJob(jobId, result).block();
            
            log.info("=== SIMPLE INGESTION COMPLETED ===");
            log.info("Total: {}, Inserted: {}", totalRecords, insertedRecords);
            
        } catch (Exception e) {
            log.error("Simple ingestion failed", e);
            jobService.failJob(jobId, e.getMessage()).block();
        }
    }
    
    private int insertBatch(List<String[]> batch) {
        // NSE CSV format: SYMBOL,SERIES,OPEN,HIGH,LOW,CLOSE,LAST,PREVCLOSE,TOTTRDQTY,TOTTRDVAL,TIMESTAMP,TOTALTRADES,ISIN,
        // Database schema: symbol, date, time, timeframe, open, high, low, close, volume, series, previous_close
        // Primary key is (symbol, time) so we use ON CONFLICT to handle duplicates
        String sql = "INSERT INTO nse_eq_ohlcv_historic " +
                "(symbol, date, time, timeframe, open, high, low, close, volume, series, previous_close) " +
                "VALUES (?, ?, ?, '1day', ?, ?, ?, ?, ?, ?, ?) " +
                "ON CONFLICT (symbol, time) DO NOTHING";
        
        List<Object[]> batchArgs = new ArrayList<>();
        // NSE uses uppercase month names: 08-JAN-2024
        // Use case-insensitive parsing
        DateTimeFormatter dateFormatter = new java.time.format.DateTimeFormatterBuilder()
                .parseCaseInsensitive()
                .appendPattern("dd-MMM-yyyy")
                .toFormatter(java.util.Locale.ENGLISH);
        
        for (String[] fields : batch) {
            try {
                if (fields.length < 13) {
                    continue; // Skip incomplete records
                }
                
                // Parse date from TIMESTAMP field (index 10)
                LocalDate date = LocalDate.parse(fields[10].trim(), dateFormatter);
                java.sql.Timestamp timestamp = java.sql.Timestamp.valueOf(date.atTime(15, 30));
                java.sql.Date sqlDate = java.sql.Date.valueOf(date);
                
                Object[] args = new Object[]{
                        fields[0].trim(),                   // symbol (index 0)
                        sqlDate,                            // date
                        timestamp,                          // time
                        parseDouble(fields[2]),             // open (index 2 - OPEN)
                        parseDouble(fields[3]),             // high (index 3 - HIGH)
                        parseDouble(fields[4]),             // low (index 4 - LOW)
                        parseDouble(fields[5]),             // close (index 5 - CLOSE)
                        parseLong(fields[8]),               // volume (index 8 - TOTTRDQTY)
                        fields[1].trim(),                   // series (index 1)
                        parseDouble(fields[7])              // previous_close (index 7 - PREVCLOSE)
                };
                
                batchArgs.add(args);
                
            } catch (Exception e) {
                if (batchArgs.isEmpty()) {
                    // Log first failure to understand the issue
                    log.error("Failed to parse first record: {} - Error: {}", String.join(",", fields), e.getMessage(), e);
                }
            }
        }
        
        if (batchArgs.isEmpty()) {
            log.warn("No valid records to insert in this batch");
            return 0;
        }
        
        log.info("Inserting batch of {} records", batchArgs.size());
        
        try {
            int[] results = jdbcTemplate.batchUpdate(sql, batchArgs);
            int inserted = 0;
            for (int result : results) {
                if (result > 0) inserted++;
            }
            log.info("Batch insert completed: {} records inserted out of {}", inserted, results.length);
            return inserted;
        } catch (Exception e) {
            log.error("Batch insert failed", e);
            return 0;
        }
    }
    
    private Double parseDouble(String value) {
        try {
            return value == null || value.trim().isEmpty() ? 0.0 : Double.parseDouble(value.trim());
        } catch (Exception e) {
            return 0.0;
        }
    }
    
    private Long parseLong(String value) {
        try {
            return value == null || value.trim().isEmpty() ? 0L : Long.parseLong(value.trim());
        } catch (Exception e) {
            return 0L;
        }
    }
    
    private com.moneyplant.engines.ingestion.historical.model.IngestionResult createEmptyResult() {
        return com.moneyplant.engines.ingestion.historical.model.IngestionResult.builder()
                .totalRecordsProcessed(0)
                .totalRecordsInserted(0)
                .totalRecordsFailed(0)
                .duration(java.time.Duration.ZERO)
                .build();
    }
}
