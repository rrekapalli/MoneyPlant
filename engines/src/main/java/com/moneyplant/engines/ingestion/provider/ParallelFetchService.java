package com.moneyplant.engines.ingestion.provider;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Service for parallel fetching of historical data using Java 21 virtual threads.
 * Enables processing of 2000+ symbols concurrently with minimal resource overhead.
 * 
 * Virtual threads are lightweight threads that allow massive concurrency without
 * the overhead of traditional platform threads.
 * 
 * Requirements: 2.4
 */
@Service
public class ParallelFetchService {
    
    private static final Logger log = LoggerFactory.getLogger(ParallelFetchService.class);
    
    private final DataProvider nseProvider;
    private final DataProvider yahooProvider;
    private final Executor virtualThreadExecutor;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param nseProvider NSE data provider
     * @param yahooProvider Yahoo Finance data provider
     */
    public ParallelFetchService(
            NseDataProvider nseProvider,
            YahooFinanceProvider yahooProvider) {
        this.nseProvider = nseProvider;
        this.yahooProvider = yahooProvider;
        
        // Create virtual thread executor for parallel processing
        this.virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
        
        log.info("ParallelFetchService initialized with virtual thread executor");
    }
    
    /**
     * Fetches historical data for multiple symbols in parallel using virtual threads.
     * 
     * @param symbols List of trading symbols
     * @param start Start date
     * @param end End date
     * @param timeframe Data timeframe
     * @param provider Provider to use (NSE or Yahoo Finance)
     * @return Flux of OHLCV data for all symbols
     */
    public Flux<OhlcvData> fetchHistoricalDataParallel(
            List<String> symbols,
            LocalDate start,
            LocalDate end,
            Timeframe timeframe,
            DataProvider.ProviderType provider) {
        
        log.info("Starting parallel fetch for {} symbols using {} provider", symbols.size(), provider);
        
        DataProvider dataProvider = selectProvider(provider);
        
        return Flux.fromIterable(symbols)
                .flatMap(symbol -> 
                    Mono.fromCallable(() -> {
                        log.debug("Fetching data for symbol: {} on virtual thread: {}", 
                                symbol, Thread.currentThread());
                        return dataProvider.fetchHistorical(symbol, start, end, timeframe).block();
                    })
                    .subscribeOn(Schedulers.fromExecutor(virtualThreadExecutor))
                    .flatMapMany(Flux::fromIterable)
                    .onErrorResume(error -> {
                        log.error("Failed to fetch data for symbol: {}", symbol, error);
                        return Flux.empty();
                    })
                )
                .doOnComplete(() -> log.info("Completed parallel fetch for {} symbols", symbols.size()));
    }
    
    /**
     * Fetches historical data for multiple symbols in parallel with batching.
     * Processes symbols in batches to avoid overwhelming the API.
     * 
     * @param symbols List of trading symbols
     * @param start Start date
     * @param end End date
     * @param timeframe Data timeframe
     * @param provider Provider to use
     * @param batchSize Number of symbols to process in each batch
     * @return Flux of OHLCV data for all symbols
     */
    public Flux<OhlcvData> fetchHistoricalDataParallelBatched(
            List<String> symbols,
            LocalDate start,
            LocalDate end,
            Timeframe timeframe,
            DataProvider.ProviderType provider,
            int batchSize) {
        
        log.info("Starting batched parallel fetch for {} symbols (batch size: {}) using {} provider", 
                symbols.size(), batchSize, provider);
        
        DataProvider dataProvider = selectProvider(provider);
        
        return Flux.fromIterable(symbols)
                .buffer(batchSize)
                .concatMap(batch -> 
                    Flux.fromIterable(batch)
                        .flatMap(symbol -> 
                            Mono.fromCallable(() -> {
                                log.debug("Fetching data for symbol: {} in batch on virtual thread: {}", 
                                        symbol, Thread.currentThread());
                                return dataProvider.fetchHistorical(symbol, start, end, timeframe).block();
                            })
                            .subscribeOn(Schedulers.fromExecutor(virtualThreadExecutor))
                            .flatMapMany(Flux::fromIterable)
                            .onErrorResume(error -> {
                                log.error("Failed to fetch data for symbol: {}", symbol, error);
                                return Flux.empty();
                            })
                        )
                )
                .doOnComplete(() -> log.info("Completed batched parallel fetch for {} symbols", symbols.size()));
    }
    
    /**
     * Fetches historical data for a single symbol with fallback to alternate provider.
     * Tries primary provider first, falls back to secondary if primary fails.
     * 
     * @param symbol Trading symbol
     * @param start Start date
     * @param end End date
     * @param timeframe Data timeframe
     * @param primaryProvider Primary provider to try first
     * @return Mono containing list of OHLCV data
     */
    public Mono<List<OhlcvData>> fetchWithFallback(
            String symbol,
            LocalDate start,
            LocalDate end,
            Timeframe timeframe,
            DataProvider.ProviderType primaryProvider) {
        
        DataProvider primary = selectProvider(primaryProvider);
        DataProvider fallback = primaryProvider == DataProvider.ProviderType.NSE 
                ? yahooProvider 
                : nseProvider;
        
        return primary.fetchHistorical(symbol, start, end, timeframe)
                .onErrorResume(error -> {
                    log.warn("Primary provider {} failed for symbol {}, trying fallback provider {}", 
                            primaryProvider, symbol, fallback.getType());
                    return fallback.fetchHistorical(symbol, start, end, timeframe);
                });
    }
    
    /**
     * Estimates the time required to fetch data for given number of symbols.
     * 
     * @param symbolCount Number of symbols
     * @param provider Provider type
     * @return Estimated time in seconds
     */
    public long estimateFetchTime(int symbolCount, DataProvider.ProviderType provider) {
        // Rate limits: NSE = 1000/hour, Yahoo = 2000/hour
        int requestsPerHour = provider == DataProvider.ProviderType.NSE ? 1000 : 2000;
        double requestsPerSecond = requestsPerHour / 3600.0;
        
        // With virtual threads, we can process many requests concurrently
        // but still limited by rate limiter
        long estimatedSeconds = (long) Math.ceil(symbolCount / requestsPerSecond);
        
        log.info("Estimated fetch time for {} symbols using {}: {} seconds ({} minutes)", 
                symbolCount, provider, estimatedSeconds, estimatedSeconds / 60);
        
        return estimatedSeconds;
    }
    
    /**
     * Selects the appropriate data provider based on provider type.
     * 
     * @param providerType Provider type enum
     * @return DataProvider instance
     */
    private DataProvider selectProvider(DataProvider.ProviderType providerType) {
        return switch (providerType) {
            case NSE -> nseProvider;
            case YAHOO_FINANCE -> yahooProvider;
            case CSV -> throw new UnsupportedOperationException("CSV provider not supported for parallel fetch");
        };
    }
    
    /**
     * Gets statistics about virtual thread usage.
     * 
     * @return String containing thread statistics
     */
    public String getThreadStatistics() {
        Thread currentThread = Thread.currentThread();
        return String.format("Current thread: %s, Is virtual: %s", 
                currentThread.getName(), 
                currentThread.isVirtual());
    }
}
