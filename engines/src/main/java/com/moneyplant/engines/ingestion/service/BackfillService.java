package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import com.moneyplant.engines.ingestion.provider.YahooFinanceProvider;
import com.moneyplant.engines.ingestion.repository.OhlcvRepository;
import com.moneyplant.engines.ingestion.service.impl.IngestionServiceImpl;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for detecting and filling data gaps in TimescaleDB.
 * Fetches missing historical data from Yahoo Finance and performs batch inserts.
 * 
 * Requirements: 2.5, 2.6
 */
@Service
@Slf4j
public class BackfillService {
    
    private final OhlcvRepository ohlcvRepository;
    private final YahooFinanceProvider yahooFinanceProvider;
    private final IngestionServiceImpl ingestionService;
    
    @Autowired
    public BackfillService(
            OhlcvRepository ohlcvRepository,
            YahooFinanceProvider yahooFinanceProvider,
            IngestionServiceImpl ingestionService) {
        this.ohlcvRepository = ohlcvRepository;
        this.yahooFinanceProvider = yahooFinanceProvider;
        this.ingestionService = ingestionService;
    }
    
    /**
     * Detects data gaps for a symbol within a date range.
     * Compares expected trading days with actual data in TimescaleDB.
     * 
     * @param symbol Trading symbol
     * @param startDate Start date of range
     * @param endDate End date of range
     * @param timeframe Data timeframe
     * @return Flux of DataGap objects representing missing data
     */
    public Flux<DataGap> detectGaps(String symbol, LocalDate startDate, LocalDate endDate, Timeframe timeframe) {
        log.info("Detecting data gaps for symbol {} from {} to {} with timeframe {}", 
                symbol, startDate, endDate, timeframe);
        
        return Mono.fromCallable(() -> {
            // Get all dates with data from database
            List<LocalDate> existingDates = ohlcvRepository.findDatesBySymbolAndTimeframe(
                    symbol, timeframe, startDate, endDate);
            
            // Generate expected dates (all trading days in range)
            List<LocalDate> expectedDates = generateExpectedDates(startDate, endDate);
            
            // Find missing dates
            Set<LocalDate> existingDateSet = existingDates.stream().collect(Collectors.toSet());
            List<DataGap> gaps = new ArrayList<>();
            
            for (LocalDate date : expectedDates) {
                if (!existingDateSet.contains(date)) {
                    gaps.add(DataGap.builder()
                            .symbol(symbol)
                            .date(date)
                            .timeframe(timeframe)
                            .build());
                }
            }
            
            log.info("Found {} data gaps for symbol {} in range {} to {}", 
                    gaps.size(), symbol, startDate, endDate);
            
            return gaps;
        })
        .flatMapMany(Flux::fromIterable);
    }
    
    /**
     * Detects data gaps for multiple symbols.
     * 
     * @param symbols Set of trading symbols
     * @param startDate Start date of range
     * @param endDate End date of range
     * @param timeframe Data timeframe
     * @return Flux of DataGap objects
     */
    public Flux<DataGap> detectGapsForSymbols(
            Set<String> symbols, 
            LocalDate startDate, 
            LocalDate endDate, 
            Timeframe timeframe) {
        
        log.info("Detecting data gaps for {} symbols from {} to {}", 
                symbols.size(), startDate, endDate);
        
        return Flux.fromIterable(symbols)
                .flatMap(symbol -> detectGaps(symbol, startDate, endDate, timeframe));
    }
    
    /**
     * Fills data gaps by fetching missing data from Yahoo Finance.
     * Groups gaps by symbol and date range for efficient fetching.
     * 
     * @param gaps List of data gaps to fill
     * @return Mono containing backfill report with success/failure counts
     */
    public Mono<BackfillReport> fillGaps(List<DataGap> gaps) {
        if (gaps == null || gaps.isEmpty()) {
            log.info("No gaps to fill");
            return Mono.just(BackfillReport.builder()
                    .totalGaps(0)
                    .successCount(0)
                    .failureCount(0)
                    .recordsInserted(0)
                    .build());
        }
        
        log.info("Filling {} data gaps", gaps.size());
        
        // Group gaps by symbol for batch processing
        var gapsBySymbol = gaps.stream()
                .collect(Collectors.groupingBy(DataGap::getSymbol));
        
        return Flux.fromIterable(gapsBySymbol.entrySet())
                .flatMap(entry -> {
                    String symbol = entry.getKey();
                    List<DataGap> symbolGaps = entry.getValue();
                    
                    // Find date range for this symbol
                    LocalDate minDate = symbolGaps.stream()
                            .map(DataGap::getDate)
                            .min(LocalDate::compareTo)
                            .orElse(LocalDate.now());
                    
                    LocalDate maxDate = symbolGaps.stream()
                            .map(DataGap::getDate)
                            .max(LocalDate::compareTo)
                            .orElse(LocalDate.now());
                    
                    Timeframe timeframe = symbolGaps.get(0).getTimeframe();
                    
                    log.info("Filling gaps for symbol {} from {} to {}", symbol, minDate, maxDate);
                    
                    // Fetch and store data for this symbol
                    return fillGapsForSymbol(symbol, minDate, maxDate, timeframe)
                            .map(count -> GapFillResult.builder()
                                    .symbol(symbol)
                                    .gapsCount(symbolGaps.size())
                                    .recordsInserted(count)
                                    .success(count > 0)
                                    .build())
                            .onErrorResume(error -> {
                                log.error("Failed to fill gaps for symbol {}: {}", symbol, error.getMessage());
                                return Mono.just(GapFillResult.builder()
                                        .symbol(symbol)
                                        .gapsCount(symbolGaps.size())
                                        .recordsInserted(0)
                                        .success(false)
                                        .errorMessage(error.getMessage())
                                        .build());
                            });
                }, 5) // Process 5 symbols concurrently
                .collectList()
                .map(results -> {
                    int successCount = (int) results.stream().filter(GapFillResult::isSuccess).count();
                    int failureCount = results.size() - successCount;
                    int totalRecords = results.stream().mapToInt(GapFillResult::getRecordsInserted).sum();
                    
                    log.info("Backfill completed: {} symbols succeeded, {} failed, {} records inserted",
                            successCount, failureCount, totalRecords);
                    
                    return BackfillReport.builder()
                            .totalGaps(gaps.size())
                            .successCount(successCount)
                            .failureCount(failureCount)
                            .recordsInserted(totalRecords)
                            .results(results)
                            .build();
                });
    }
    
    /**
     * Fills gaps for a single symbol by fetching data from Yahoo Finance.
     * 
     * @param symbol Trading symbol
     * @param startDate Start date
     * @param endDate End date
     * @param timeframe Data timeframe
     * @return Mono containing count of records inserted
     */
    private Mono<Integer> fillGapsForSymbol(
            String symbol, 
            LocalDate startDate, 
            LocalDate endDate, 
            Timeframe timeframe) {
        
        log.debug("Fetching data for symbol {} from {} to {}", symbol, startDate, endDate);
        
        return yahooFinanceProvider.fetchHistorical(symbol, startDate, endDate, timeframe)
                .flatMapMany(Flux::fromIterable)
                .collectList()
                .flatMap(ohlcvList -> {
                    if (ohlcvList.isEmpty()) {
                        log.warn("No data fetched for symbol {} in range {} to {}", 
                                symbol, startDate, endDate);
                        return Mono.just(0);
                    }
                    
                    // Batch insert into TimescaleDB
                    return Mono.fromCallable(() -> {
                        int[] results = ohlcvRepository.batchInsert(ohlcvList);
                        int count = results.length;
                        log.info("Inserted {} records for symbol {}", count, symbol);
                        return count;
                    });
                });
    }
    
    /**
     * Performs a complete backfill operation for a set of symbols.
     * Detects gaps and fills them automatically.
     * 
     * @param symbols Set of trading symbols
     * @param startDate Start date of range
     * @param endDate End date of range
     * @param timeframe Data timeframe
     * @return Mono containing backfill report
     */
    public Mono<BackfillReport> performBackfill(
            Set<String> symbols, 
            LocalDate startDate, 
            LocalDate endDate, 
            Timeframe timeframe) {
        
        log.info("Starting backfill for {} symbols from {} to {}", 
                symbols.size(), startDate, endDate);
        
        return detectGapsForSymbols(symbols, startDate, endDate, timeframe)
                .collectList()
                .flatMap(this::fillGaps)
                .doOnSuccess(report -> 
                    log.info("Backfill completed: {} gaps filled, {} records inserted",
                            report.getSuccessCount(), report.getRecordsInserted()))
                .doOnError(error -> 
                    log.error("Backfill failed", error));
    }
    
    /**
     * Generates list of expected trading dates (excluding weekends).
     * Note: This is a simplified version. In production, should exclude market holidays.
     * 
     * @param startDate Start date
     * @param endDate End date
     * @return List of expected trading dates
     */
    private List<LocalDate> generateExpectedDates(LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate current = startDate;
        
        while (!current.isAfter(endDate)) {
            // Exclude weekends (Saturday=6, Sunday=7)
            if (current.getDayOfWeek().getValue() < 6) {
                dates.add(current);
            }
            current = current.plusDays(1);
        }
        
        return dates;
    }
    
    /**
     * Data class representing a data gap.
     */
    @Data
    @Builder
    public static class DataGap {
        private String symbol;
        private LocalDate date;
        private Timeframe timeframe;
    }
    
    /**
     * Result of filling gaps for a single symbol.
     */
    @Data
    @Builder
    private static class GapFillResult {
        private String symbol;
        private int gapsCount;
        private int recordsInserted;
        private boolean success;
        private String errorMessage;
    }
    
    /**
     * Report summarizing backfill operation.
     */
    @Data
    @Builder
    public static class BackfillReport {
        private int totalGaps;
        private int successCount;
        private int failureCount;
        private int recordsInserted;
        private List<GapFillResult> results;
        
        public double getSuccessRate() {
            if (totalGaps == 0) return 0.0;
            return (double) successCount / totalGaps * 100.0;
        }
    }
}
