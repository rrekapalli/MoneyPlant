package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.ingestion.model.ArchivalMetadata;
import com.moneyplant.engines.ingestion.model.ArchivalResult;
import com.moneyplant.engines.ingestion.model.TickData;
import com.moneyplant.engines.ingestion.repository.ArchivalMetadataRepository;
import com.moneyplant.engines.ingestion.repository.TimescaleRepository;
import com.moneyplant.engines.ingestion.storage.HudiWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * Service for end-of-day archival of tick data from TimescaleDB to Apache Hudi.
 * Runs as a scheduled job at 5:30 PM IST daily to archive intraday tick data.
 * 
 * Requirements: 5.3, 5.4, 11.1, 11.2, 11.8
 */
@Service
@Slf4j
public class EndOfDayArchivalService {
    
    private final TimescaleRepository timescaleRepository;
    private final HudiWriter hudiWriter;
    private final ArchivalMetadataRepository archivalMetadataRepository;
    
    @Value("${ingestion.storage.archival.enabled:true}")
    private boolean archivalEnabled;
    
    @Value("${ingestion.storage.archival.verify-integrity:true}")
    private boolean verifyIntegrity;
    
    @Value("${ingestion.storage.archival.auto-truncate:true}")
    private boolean autoTruncate;
    
    @Autowired
    public EndOfDayArchivalService(
            TimescaleRepository timescaleRepository,
            HudiWriter hudiWriter,
            ArchivalMetadataRepository archivalMetadataRepository) {
        this.timescaleRepository = timescaleRepository;
        this.hudiWriter = hudiWriter;
        this.archivalMetadataRepository = archivalMetadataRepository;
        log.info("EndOfDayArchivalService initialized - enabled: {}, verify-integrity: {}, auto-truncate: {}", 
            archivalEnabled, verifyIntegrity, autoTruncate);
    }
    
    /**
     * Scheduled job to archive tick data at end of day.
     * Runs at 5:30 PM IST (3:30 PM UTC) on weekdays (Monday-Friday).
     * 
     * Cron expression: "0 30 15 * * MON-FRI" (3:30 PM UTC = 5:30 PM IST)
     * Note: IST is UTC+5:30, so 5:30 PM IST = 12:00 PM UTC (noon)
     * Corrected cron: "0 0 12 * * MON-FRI"
     * 
     * Requirements: 5.3, 5.4, 11.1
     */
    @Scheduled(cron = "${ingestion.storage.archival.schedule-cron:0 0 12 * * MON-FRI}")
    public void scheduledArchival() {
        if (!archivalEnabled) {
            log.info("End-of-day archival is disabled. Skipping scheduled archival.");
            return;
        }
        
        // Archive data for the previous trading day
        LocalDate yesterday = LocalDate.now(ZoneId.of("Asia/Kolkata")).minusDays(1);
        
        log.info("=== Starting scheduled end-of-day archival for date: {} ===", yesterday);
        
        archiveTickData(yesterday)
            .doOnSuccess(result -> {
                log.info("=== Scheduled archival completed successfully for date: {} ===", yesterday);
                logArchivalResult(result);
            })
            .doOnError(error -> {
                log.error("=== Scheduled archival failed for date: {} ===", yesterday, error);
            })
            .subscribe();
    }
    
    /**
     * Archive tick data for a specific date.
     * This method can be called manually or by the scheduled job.
     * 
     * Process:
     * 1. Check if archival already exists for the date
     * 2. Fetch tick data from TimescaleDB
     * 3. Write data to Apache Hudi
     * 4. Verify data integrity (count matching)
     * 5. Truncate intraday table if successful
     * 6. Store archival metadata
     * 
     * Requirements: 5.3, 5.4, 11.1, 11.2, 11.8
     * 
     * @param date the date to archive
     * @return Mono with archival result
     */
    @Transactional
    public Mono<ArchivalResult> archiveTickData(LocalDate date) {
        Instant startTime = Instant.now();
        
        log.info("Starting archival process for date: {}", date);
        
        // Create initial metadata record
        ArchivalMetadata metadata = createInitialMetadata(date, startTime);
        archivalMetadataRepository.save(metadata);
        
        return Mono.defer(() -> {
            // Check if archival already completed for this date
            if (isArchivalAlreadyCompleted(date)) {
                log.warn("Archival already completed for date: {}. Skipping.", date);
                return Mono.just(createSkippedResult(date));
            }
            
            // Step 1: Fetch tick data from TimescaleDB
            return fetchTickDataFromTimescale(date)
                .flatMap(ticks -> {
                    long sourceCount = ticks.size();
                    log.info("Fetched {} tick records from TimescaleDB for date: {}", sourceCount, date);
                    
                    if (sourceCount == 0) {
                        log.warn("No tick data found for date: {}. Skipping archival.", date);
                        return Mono.just(createNoDataResult(date));
                    }
                    
                    // Step 2: Write to Apache Hudi
                    return writeToHudi(ticks, date)
                        .flatMap(destCount -> {
                            log.info("Wrote {} records to Hudi for date: {}", destCount, date);
                            
                            // Step 3: Verify data integrity
                            return verifyDataIntegrity(date, sourceCount, destCount)
                                .flatMap(integrityPassed -> {
                                    if (!integrityPassed) {
                                        String errorMsg = String.format(
                                            "Data integrity check failed: source=%d, destination=%d", 
                                            sourceCount, destCount);
                                        log.error(errorMsg);
                                        return Mono.just(createFailedResult(date, sourceCount, destCount, errorMsg));
                                    }
                                    
                                    // Step 4: Truncate intraday table if configured
                                    if (autoTruncate) {
                                        return truncateIntradayTable(date)
                                            .then(Mono.just(createSuccessResult(date, sourceCount, destCount, true)));
                                    } else {
                                        log.info("Auto-truncate disabled. Intraday table not truncated.");
                                        return Mono.just(createSuccessResult(date, sourceCount, destCount, false));
                                    }
                                });
                        });
                })
                .doOnSuccess(result -> {
                    // Step 5: Update metadata with final result
                    updateMetadataWithResult(metadata, result, startTime);
                })
                .doOnError(error -> {
                    // Update metadata with error
                    updateMetadataWithError(metadata, error, startTime);
                });
        });
    }
    
    /**
     * Fetch tick data from TimescaleDB for a specific date.
     */
    private Mono<List<TickData>> fetchTickDataFromTimescale(LocalDate date) {
        return Mono.fromCallable(() -> {
            log.debug("Fetching tick data from TimescaleDB for date: {}", date);
            return timescaleRepository.getTickDataForDate(date);
        });
    }
    
    /**
     * Write tick data to Apache Hudi.
     */
    private Mono<Long> writeToHudi(List<TickData> ticks, LocalDate date) {
        log.info("Writing {} ticks to Hudi for date: {}", ticks.size(), date);
        return hudiWriter.writeBatch(ticks, date);
    }
    
    /**
     * Verify data integrity by comparing source and destination counts.
     * 
     * Requirements: 11.2
     */
    private Mono<Boolean> verifyDataIntegrity(LocalDate date, long sourceCount, long destCount) {
        if (!verifyIntegrity) {
            log.info("Data integrity verification disabled. Skipping verification.");
            return Mono.just(true);
        }
        
        log.info("Verifying data integrity for date: {} - source: {}, destination: {}", 
            date, sourceCount, destCount);
        
        if (sourceCount != destCount) {
            log.error("Data integrity check FAILED: source count ({}) != destination count ({})", 
                sourceCount, destCount);
            return Mono.just(false);
        }
        
        log.info("Data integrity check PASSED: counts match ({})", sourceCount);
        return Mono.just(true);
    }
    
    /**
     * Truncate the intraday tick table after successful archival.
     * 
     * Requirements: 5.4, 11.8
     */
    private Mono<Void> truncateIntradayTable(LocalDate date) {
        return Mono.fromRunnable(() -> {
            log.warn("Truncating nse_eq_ticks table after successful archival for date: {}", date);
            timescaleRepository.truncateTickTable();
            log.info("Successfully truncated nse_eq_ticks table");
        });
    }
    
    /**
     * Check if archival already completed for a date.
     */
    private boolean isArchivalAlreadyCompleted(LocalDate date) {
        return archivalMetadataRepository.findByArchivalDate(date)
            .map(metadata -> metadata.getStatus() == ArchivalMetadata.ArchivalStatus.SUCCESS)
            .orElse(false);
    }
    
    /**
     * Create initial metadata record.
     */
    private ArchivalMetadata createInitialMetadata(LocalDate date, Instant startTime) {
        return ArchivalMetadata.builder()
            .archivalDate(date)
            .status(ArchivalMetadata.ArchivalStatus.IN_PROGRESS)
            .startTime(startTime)
            .hudiTablePath(hudiWriter.getTablePath())
            .build();
    }
    
    /**
     * Update metadata with successful result.
     */
    private void updateMetadataWithResult(ArchivalMetadata metadata, ArchivalResult result, Instant startTime) {
        Instant endTime = Instant.now();
        long durationMs = endTime.toEpochMilli() - startTime.toEpochMilli();
        
        metadata.setSourceRecordCount(result.getSourceRecordCount());
        metadata.setDestinationRecordCount(result.getDestinationRecordCount());
        metadata.setStatus(result.isSuccess() ? 
            ArchivalMetadata.ArchivalStatus.SUCCESS : ArchivalMetadata.ArchivalStatus.FAILED);
        metadata.setEndTime(endTime);
        metadata.setDurationMs(durationMs);
        metadata.setIntegrityCheckPassed(result.isIntegrityCheckPassed());
        metadata.setTableTruncated(result.isTableTruncated());
        metadata.setErrorMessage(result.getErrorMessage());
        
        archivalMetadataRepository.save(metadata);
        
        log.info("Updated archival metadata for date: {} - status: {}, duration: {}ms", 
            result.getDate(), metadata.getStatus(), durationMs);
    }
    
    /**
     * Update metadata with error.
     */
    private void updateMetadataWithError(ArchivalMetadata metadata, Throwable error, Instant startTime) {
        Instant endTime = Instant.now();
        long durationMs = endTime.toEpochMilli() - startTime.toEpochMilli();
        
        metadata.setStatus(ArchivalMetadata.ArchivalStatus.FAILED);
        metadata.setEndTime(endTime);
        metadata.setDurationMs(durationMs);
        metadata.setErrorMessage(error.getMessage());
        metadata.setIntegrityCheckPassed(false);
        metadata.setTableTruncated(false);
        
        archivalMetadataRepository.save(metadata);
        
        log.error("Updated archival metadata with error for date: {} - duration: {}ms", 
            metadata.getArchivalDate(), durationMs);
    }
    
    /**
     * Create success result.
     */
    private ArchivalResult createSuccessResult(LocalDate date, long sourceCount, long destCount, boolean truncated) {
        return ArchivalResult.builder()
            .date(date)
            .sourceRecordCount(sourceCount)
            .destinationRecordCount(destCount)
            .success(true)
            .integrityCheckPassed(true)
            .tableTruncated(truncated)
            .build();
    }
    
    /**
     * Create failed result.
     */
    private ArchivalResult createFailedResult(LocalDate date, long sourceCount, long destCount, String errorMsg) {
        return ArchivalResult.builder()
            .date(date)
            .sourceRecordCount(sourceCount)
            .destinationRecordCount(destCount)
            .success(false)
            .integrityCheckPassed(false)
            .tableTruncated(false)
            .errorMessage(errorMsg)
            .build();
    }
    
    /**
     * Create skipped result.
     */
    private ArchivalResult createSkippedResult(LocalDate date) {
        return ArchivalResult.builder()
            .date(date)
            .sourceRecordCount(0)
            .destinationRecordCount(0)
            .success(true)
            .integrityCheckPassed(true)
            .tableTruncated(false)
            .errorMessage("Archival already completed for this date")
            .build();
    }
    
    /**
     * Create no data result.
     */
    private ArchivalResult createNoDataResult(LocalDate date) {
        return ArchivalResult.builder()
            .date(date)
            .sourceRecordCount(0)
            .destinationRecordCount(0)
            .success(true)
            .integrityCheckPassed(true)
            .tableTruncated(false)
            .errorMessage("No tick data found for this date")
            .build();
    }
    
    /**
     * Log archival result summary.
     * 
     * Requirements: 11.2
     */
    private void logArchivalResult(ArchivalResult result) {
        log.info("╔════════════════════════════════════════════════════════════════╗");
        log.info("║           END-OF-DAY ARCHIVAL SUMMARY                          ║");
        log.info("╠════════════════════════════════════════════════════════════════╣");
        log.info("║ Date:                    {}                              ║", result.getDate());
        log.info("║ Status:                  {}                                ║", 
            result.isSuccess() ? "SUCCESS" : "FAILED");
        log.info("║ Source Records:          {}                                  ║", result.getSourceRecordCount());
        log.info("║ Destination Records:     {}                                  ║", result.getDestinationRecordCount());
        log.info("║ Integrity Check:         {}                                 ║", 
            result.isIntegrityCheckPassed() ? "PASSED" : "FAILED");
        log.info("║ Table Truncated:         {}                                  ║", 
            result.isTableTruncated() ? "YES" : "NO");
        if (result.getErrorMessage() != null) {
            log.info("║ Error:                   {}                                ║", result.getErrorMessage());
        }
        log.info("╚════════════════════════════════════════════════════════════════╝");
    }
    
    /**
     * Get archival history for a date range.
     * 
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @return list of archival metadata
     */
    public List<ArchivalMetadata> getArchivalHistory(LocalDate startDate, LocalDate endDate) {
        return archivalMetadataRepository.findByArchivalDateBetween(startDate, endDate);
    }
    
    /**
     * Get archival metadata for a specific date.
     * 
     * @param date the date to query
     * @return archival metadata or null if not found
     */
    public ArchivalMetadata getArchivalMetadata(LocalDate date) {
        return archivalMetadataRepository.findByArchivalDate(date).orElse(null);
    }
    
    /**
     * Get all failed archival records.
     * 
     * @return list of failed archival metadata
     */
    public List<ArchivalMetadata> getFailedArchivals() {
        return archivalMetadataRepository.findAllFailed();
    }
    
    /**
     * Retry failed archival for a specific date.
     * 
     * @param date the date to retry
     * @return Mono with archival result
     */
    public Mono<ArchivalResult> retryFailedArchival(LocalDate date) {
        log.info("Retrying failed archival for date: {}", date);
        
        // Delete existing failed metadata to allow retry
        archivalMetadataRepository.findByArchivalDate(date)
            .ifPresent(metadata -> {
                if (metadata.getStatus() == ArchivalMetadata.ArchivalStatus.FAILED) {
                    archivalMetadataRepository.delete(metadata);
                    log.info("Deleted failed archival metadata for date: {}", date);
                }
            });
        
        return archiveTickData(date);
    }
}
