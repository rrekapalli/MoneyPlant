package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.ingestion.model.PredefinedUniverse;
import com.moneyplant.engines.ingestion.model.Timeframe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;

/**
 * Scheduled service for End-of-Day (EOD) market data ingestion.
 * Runs daily at 5:30 PM IST to fetch and store OHLCV data for all symbols in the universe.
 * 
 * Data Flow:
 * 1. Get all active symbols from symbol universe
 * 2. Fetch EOD OHLCV data from Yahoo Finance
 * 3. Store directly in PostgreSQL table: nse_eq_ohlcv_historic
 * 4. Track performance metrics (time taken, records inserted)
 * 
 * Requirements: Task 11.2 - EOD data ingestion for all stocks
 */
@Service
@Slf4j
public class EodIngestionScheduler {
    
    private final BackfillService backfillService;
    private final SymbolUniverseService symbolUniverseService;
    
    @Value("${ingestion.eod.enabled:true}")
    private boolean eodIngestionEnabled;
    
    @Value("${ingestion.eod.universe:ALL_ACTIVE}")
    private String universeType;
    
    @Autowired
    public EodIngestionScheduler(
            BackfillService backfillService,
            SymbolUniverseService symbolUniverseService) {
        this.backfillService = backfillService;
        this.symbolUniverseService = symbolUniverseService;
        log.info("EodIngestionScheduler initialized - enabled: {}, universe: {}", 
            eodIngestionEnabled, universeType);
    }
    
    /**
     * Scheduled EOD ingestion job.
     * Runs at 5:30 PM IST (12:00 PM UTC) on weekdays (Monday-Friday).
     * 
     * Cron expression: "0 0 12 * * MON-FRI" (12:00 PM UTC = 5:30 PM IST)
     * Note: IST is UTC+5:30
     * 
     * For testing, you can temporarily change to run every minute: "0 * * * * *"
     */
    @Scheduled(cron = "${ingestion.eod.schedule:0 0 12 * * MON-FRI}", zone = "UTC")
    public void scheduledEodIngestion() {
        if (!eodIngestionEnabled) {
            log.info("EOD ingestion is disabled. Skipping scheduled ingestion.");
            return;
        }
        
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        log.info("╔════════════════════════════════════════════════════════════════╗");
        log.info("║         SCHEDULED EOD INGESTION STARTED                        ║");
        log.info("║  Date: {}                                              ║", today);
        log.info("║  Time: 5:30 PM IST                                             ║");
        log.info("╚════════════════════════════════════════════════════════════════╝");
        
        performEodIngestion(today);
    }
    
    /**
     * Perform EOD ingestion for a specific date.
     * This method can be called manually for testing or by the scheduled job.
     * 
     * @param date the date to ingest data for
     */
    public void performEodIngestion(LocalDate date) {
        Instant startTime = Instant.now();
        
        try {
            log.info("Starting EOD ingestion for date: {}", date);
            log.info("Universe type: {}", universeType);
            
            // Step 1: Get all symbols from the universe
            log.info("Step 1: Fetching symbols from universe...");
            Instant symbolFetchStart = Instant.now();
            
            Set<String> symbols = getSymbolsFromUniverse();
            
            Duration symbolFetchDuration = Duration.between(symbolFetchStart, Instant.now());
            log.info("✓ Fetched {} symbols in {} ms", symbols.size(), symbolFetchDuration.toMillis());
            
            if (symbols.isEmpty()) {
                log.warn("No symbols found in universe. Skipping EOD ingestion.");
                return;
            }
            
            // Step 2: Perform backfill for all symbols
            log.info("Step 2: Fetching EOD data from Yahoo Finance and storing in PostgreSQL...");
            Instant backfillStart = Instant.now();
            
            BackfillService.BackfillReport report = backfillService
                .performBackfill(symbols, date, date, Timeframe.ONE_DAY)
                .block();
            
            Duration backfillDuration = Duration.between(backfillStart, Instant.now());
            Duration totalDuration = Duration.between(startTime, Instant.now());
            
            // Step 3: Log performance metrics and results
            logEodIngestionResults(date, symbols.size(), report, symbolFetchDuration, backfillDuration, totalDuration);
            
        } catch (Exception e) {
            Duration totalDuration = Duration.between(startTime, Instant.now());
            log.error("╔════════════════════════════════════════════════════════════════╗");
            log.error("║         EOD INGESTION FAILED                                   ║");
            log.error("║  Date: {}                                              ║", date);
            log.error("║  Duration: {} seconds                                      ║", totalDuration.getSeconds());
            log.error("║  Error: {}                                             ║", e.getMessage());
            log.error("╚════════════════════════════════════════════════════════════════╝");
            log.error("Full error details:", e);
        }
    }
    
    /**
     * Get symbols from the configured universe.
     */
    private Set<String> getSymbolsFromUniverse() {
        try {
            PredefinedUniverse universe = PredefinedUniverse.valueOf(universeType);
            return symbolUniverseService.getPredefinedUniverse(universe)
                .map(u -> u.getSymbols())
                .block();
        } catch (IllegalArgumentException e) {
            // If not a predefined universe, try to get it as a custom universe
            log.warn("Universe '{}' not found as predefined, trying custom universe", universeType);
            return symbolUniverseService.getUniverse(universeType)
                .map(u -> u.getSymbols())
                .block();
        }
    }
    
    /**
     * Log EOD ingestion results with performance metrics.
     */
    private void logEodIngestionResults(
            LocalDate date,
            int totalSymbols,
            BackfillService.BackfillReport report,
            Duration symbolFetchDuration,
            Duration backfillDuration,
            Duration totalDuration) {
        
        log.info("╔════════════════════════════════════════════════════════════════╗");
        log.info("║         EOD INGESTION COMPLETED SUCCESSFULLY                   ║");
        log.info("╠════════════════════════════════════════════════════════════════╣");
        log.info("║ Date:                    {}                              ║", date);
        log.info("║ Total Symbols:           {}                                  ║", totalSymbols);
        log.info("║ Successful:              {}                                  ║", report.getSuccessCount());
        log.info("║ Failed:                  {}                                   ║", report.getFailureCount());
        log.info("║ Records Inserted:        {}                                  ║", report.getRecordsInserted());
        log.info("║ Success Rate:            {:.2f}%                              ║", report.getSuccessRate());
        log.info("╠════════════════════════════════════════════════════════════════╣");
        log.info("║ PERFORMANCE METRICS                                            ║");
        log.info("╠════════════════════════════════════════════════════════════════╣");
        log.info("║ Symbol Fetch Time:       {} ms                              ║", symbolFetchDuration.toMillis());
        log.info("║ Data Fetch & Insert:     {} seconds                         ║", backfillDuration.getSeconds());
        log.info("║ Total Duration:          {} seconds                         ║", totalDuration.getSeconds());
        log.info("║ Avg Time per Symbol:     {} ms                              ║", 
            totalSymbols > 0 ? backfillDuration.toMillis() / totalSymbols : 0);
        log.info("║ Throughput:              {:.2f} symbols/sec                    ║", 
            backfillDuration.getSeconds() > 0 ? (double) totalSymbols / backfillDuration.getSeconds() : 0);
        log.info("╠════════════════════════════════════════════════════════════════╣");
        log.info("║ DATA STORAGE                                                   ║");
        log.info("╠════════════════════════════════════════════════════════════════╣");
        log.info("║ Database:                PostgreSQL                            ║");
        log.info("║ Table:                   nse_eq_ohlcv_historic                 ║");
        log.info("║ Data Source:             NSE India                             ║");
        log.info("║ Timeframe:               1 day (EOD)                           ║");
        log.info("╚════════════════════════════════════════════════════════════════╝");
        
        // Log any failures
        if (report.getFailureCount() > 0) {
            log.warn("Failed to fetch data for {} symbols", report.getFailureCount());
        }
    }
    
    /**
     * Manual trigger for EOD ingestion (for testing).
     * Can be called via REST API or directly for testing.
     * 
     * @param date the date to ingest data for (null = today)
     */
    public void triggerManualEodIngestion(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now(ZoneId.of("Asia/Kolkata"));
        log.info("Manual EOD ingestion triggered for date: {}", targetDate);
        performEodIngestion(targetDate);
    }
}
