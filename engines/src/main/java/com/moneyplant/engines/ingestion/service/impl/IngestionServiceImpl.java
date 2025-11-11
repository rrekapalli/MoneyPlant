package com.moneyplant.engines.ingestion.service.impl;

import com.moneyplant.engines.common.dto.MarketDataDto;
import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import com.moneyplant.engines.ingestion.processor.DataNormalizer;
import com.moneyplant.engines.ingestion.processor.DataValidator;
import com.moneyplant.engines.ingestion.provider.DataProvider;
import com.moneyplant.engines.ingestion.provider.YahooFinanceProvider;
import com.moneyplant.engines.ingestion.publisher.KafkaPublisher;
import com.moneyplant.engines.ingestion.repository.OhlcvRepository;
import com.moneyplant.engines.ingestion.repository.TimescaleRepository;
import com.moneyplant.engines.ingestion.service.IngestionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Implementation of IngestionService with reactive data flow orchestration.
 * Coordinates provider → validator → normalizer → publisher → storage pipeline.
 * 
 * Requirements: 2.1, 2.3, 2.4
 */
@Service
@Slf4j
public class IngestionServiceImpl implements IngestionService {
    
    private final DataValidator dataValidator;
    private final DataNormalizer dataNormalizer;
    private final KafkaPublisher kafkaPublisher;
    private final TimescaleRepository timescaleRepository;
    private final OhlcvRepository ohlcvRepository;
    private final YahooFinanceProvider yahooFinanceProvider;
    
    // Track ingestion status per data source
    private final ConcurrentHashMap<String, String> ingestionStatus = new ConcurrentHashMap<>();
    
    @Autowired
    public IngestionServiceImpl(
            DataValidator dataValidator,
            DataNormalizer dataNormalizer,
            KafkaPublisher kafkaPublisher,
            TimescaleRepository timescaleRepository,
            OhlcvRepository ohlcvRepository,
            YahooFinanceProvider yahooFinanceProvider) {
        this.dataValidator = dataValidator;
        this.dataNormalizer = dataNormalizer;
        this.kafkaPublisher = kafkaPublisher;
        this.timescaleRepository = timescaleRepository;
        this.ohlcvRepository = ohlcvRepository;
        this.yahooFinanceProvider = yahooFinanceProvider;
    }
    
    /**
     * Starts historical data ingestion for a set of symbols.
     * Orchestrates the complete data flow: provider → validator → normalizer → publisher → storage.
     * Uses reactive streams (Flux/Mono) for efficient data pipeline processing.
     * 
     * @param symbols Set of trading symbols to ingest
     * @param startDate Start date for historical data
     * @param endDate End date for historical data
     * @param timeframe Data timeframe (e.g., 1day, 1hour)
     * @return Mono containing ingestion result with success/failure counts
     */
    public Mono<IngestionResult> startHistoricalIngestion(
            Set<String> symbols, 
            LocalDate startDate, 
            LocalDate endDate, 
            Timeframe timeframe) {
        
        log.info("Starting historical ingestion for {} symbols from {} to {} with timeframe {}", 
                symbols.size(), startDate, endDate, timeframe);
        
        ingestionStatus.put("historical", "RUNNING");
        
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        
        return Flux.fromIterable(symbols)
                // Process symbols in parallel using reactive streams
                .flatMap(symbol -> 
                    processSymbolHistoricalData(symbol, startDate, endDate, timeframe)
                        .doOnSuccess(count -> {
                            successCount.incrementAndGet();
                            log.info("Successfully ingested {} records for symbol: {}", count, symbol);
                        })
                        .doOnError(error -> {
                            failureCount.incrementAndGet();
                            log.error("Failed to ingest data for symbol: {}", symbol, error);
                        })
                        .onErrorResume(error -> Mono.just(0)) // Continue processing other symbols
                , 10) // Parallel concurrency of 10 symbols at a time
                .collectList()
                .map(results -> {
                    ingestionStatus.put("historical", "COMPLETED");
                    int totalRecords = results.stream().mapToInt(Integer::intValue).sum();
                    
                    log.info("Historical ingestion completed: {} symbols succeeded, {} failed, {} total records",
                            successCount.get(), failureCount.get(), totalRecords);
                    
                    return IngestionResult.builder()
                            .successCount(successCount.get())
                            .failureCount(failureCount.get())
                            .totalRecords(totalRecords)
                            .status("COMPLETED")
                            .build();
                })
                .doOnError(error -> {
                    ingestionStatus.put("historical", "FAILED");
                    log.error("Historical ingestion failed", error);
                });
    }
    
    /**
     * Processes historical data for a single symbol through the complete pipeline.
     * 
     * @param symbol Trading symbol
     * @param startDate Start date
     * @param endDate End date
     * @param timeframe Data timeframe
     * @return Mono containing count of processed records
     */
    private Mono<Integer> processSymbolHistoricalData(
            String symbol, 
            LocalDate startDate, 
            LocalDate endDate, 
            Timeframe timeframe) {
        
        log.debug("Processing historical data for symbol: {}", symbol);
        
        return yahooFinanceProvider.fetchHistorical(symbol, startDate, endDate, timeframe)
                .flatMapMany(Flux::fromIterable)
                // Apply validation
                .transform(dataValidator::validateOhlcv)
                // Apply normalization
                .transform(dataNormalizer::normalizeOhlcv)
                // Publish to Kafka (non-blocking)
                .flatMap(ohlcv -> 
                    kafkaPublisher.publishCandle(ohlcv)
                        .thenReturn(ohlcv)
                        .onErrorResume(error -> {
                            log.warn("Failed to publish to Kafka for {}: {}", symbol, error.getMessage());
                            return Mono.just(ohlcv); // Continue even if Kafka fails
                        })
                )
                // Collect for batch storage
                .collectList()
                .flatMap(ohlcvList -> {
                    if (ohlcvList.isEmpty()) {
                        log.warn("No valid data to store for symbol: {}", symbol);
                        return Mono.just(0);
                    }
                    
                    // Batch insert into TimescaleDB
                    return Mono.fromCallable(() -> {
                        int[] results = ohlcvRepository.batchInsert(ohlcvList);
                        return results.length;
                    })
                    .subscribeOn(Schedulers.boundedElastic())
                    .doOnSuccess(count -> 
                        log.debug("Stored {} OHLCV records for symbol: {}", count, symbol))
                    .doOnError(error -> 
                        log.error("Failed to store data for symbol: {}", symbol, error));
                });
    }
    
    /**
     * Processes a stream of tick data through the complete pipeline.
     * Used for real-time data ingestion.
     * 
     * @param tickFlux Stream of tick data
     * @return Processed stream of tick data
     */
    public Flux<TickData> processTickDataPipeline(Flux<TickData> tickFlux) {
        log.debug("Processing tick data pipeline");
        
        return tickFlux
                // Apply validation
                .transform(dataValidator::validate)
                // Apply normalization
                .transform(dataNormalizer::normalize)
                // Publish to Kafka (non-blocking)
                .flatMap(tick -> 
                    kafkaPublisher.publishTick(tick)
                        .thenReturn(tick)
                        .onErrorResume(error -> {
                            log.warn("Failed to publish tick to Kafka: {}", error.getMessage());
                            return Mono.just(tick); // Continue even if Kafka fails
                        })
                )
                // Store in TimescaleDB
                .flatMap(tick -> 
                    Mono.fromCallable(() -> {
                        timescaleRepository.save(tick);
                        return tick;
                    })
                    .subscribeOn(Schedulers.boundedElastic())
                    .onErrorResume(error -> {
                        log.error("Failed to store tick in database: {}", error.getMessage());
                        return Mono.just(tick); // Continue even if storage fails
                    })
                )
                .doOnNext(tick -> 
                    log.trace("Processed tick: symbol={}, price={}", tick.getSymbol(), tick.getPrice()))
                .doOnError(error -> 
                    log.error("Error in tick data pipeline", error));
    }
    
    @Override
    public void startIngestion(String dataSource) {
        log.info("Starting ingestion for data source: {}", dataSource);
        ingestionStatus.put(dataSource, "RUNNING");
        // Implementation depends on specific data source
        // For now, just update status
    }
    
    @Override
    public void stopIngestion(String dataSource) {
        log.info("Stopping ingestion for data source: {}", dataSource);
        ingestionStatus.put(dataSource, "STOPPED");
        // Gracefully close connections and clean up resources
    }
    
    @Override
    public String getIngestionStatus(String dataSource) {
        return ingestionStatus.getOrDefault(dataSource, "UNKNOWN");
    }
    
    @Override
    public void ingestMarketData(MarketDataDto marketData) {
        log.debug("Ingesting market data for symbol: {}", marketData.getSymbol());
        // Convert DTO to internal model and process
        // This is a legacy method - prefer using reactive methods above
    }
    
    @Override
    public List<MarketDataDto> getIngestedData(String symbol) {
        log.debug("Fetching ingested data for symbol: {}", symbol);
        // Query from TimescaleDB
        // This is a legacy method - prefer using reactive methods
        return List.of();
    }
    
    @Override
    public void processStreamingData(String data) {
        log.debug("Processing streaming data");
        // Parse and route to appropriate handlers
        // This is a legacy method - prefer using reactive methods above
    }
    
    /**
     * Result object for ingestion operations.
     */
    @lombok.Builder
    @lombok.Data
    public static class IngestionResult {
        private int successCount;
        private int failureCount;
        private int totalRecords;
        private String status;
    }
}
