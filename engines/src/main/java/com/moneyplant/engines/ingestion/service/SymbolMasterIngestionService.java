package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.common.entities.NseEquityMaster;
import com.moneyplant.engines.ingestion.provider.NseDataProvider;
import com.moneyplant.engines.ingestion.repository.NseEquityMasterCustomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

/**
 * Service for ingesting and managing NSE equity master data.
 * Orchestrates symbol master data ingestion from NSE API and updates nse_eq_master table.
 * 
 * Scheduled Job: Runs daily at 6:00 AM to refresh symbol master data
 * 
 * Requirements: 7.1, 7.2, 7.8
 */
@Service
@Slf4j
public class SymbolMasterIngestionService {
    
    private final NseDataProvider nseDataProvider;
    private final NseEquityMasterCustomRepository customRepository;
    
    private Instant lastRefreshTime;
    private int lastRefreshCount;
    private boolean isRefreshing = false;
    
    public SymbolMasterIngestionService(
            NseDataProvider nseDataProvider,
            NseEquityMasterCustomRepository customRepository) {
        this.nseDataProvider = nseDataProvider;
        this.customRepository = customRepository;
        
        log.info("SymbolMasterIngestionService initialized");
    }
    
    /**
     * Scheduled job to refresh symbol master data daily at 6:00 AM.
     * Fetches latest equity master data from NSE API and updates nse_eq_master table.
     * 
     * Cron expression: "0 0 6 * * *" = 6:00 AM every day
     * 
     * Requirements: 7.1, 7.8
     */
    @Scheduled(cron = "0 0 6 * * *")
    public void refreshSymbolMaster() {
        if (isRefreshing) {
            log.warn("Symbol master refresh already in progress, skipping scheduled run");
            return;
        }
        
        log.info("Starting scheduled symbol master refresh at {}", Instant.now());
        
        ingestSymbolMaster()
            .doOnSuccess(count -> {
                log.info("Scheduled symbol master refresh completed successfully. Records updated: {}", count);
                lastRefreshTime = Instant.now();
                lastRefreshCount = count;
            })
            .doOnError(error -> {
                log.error("Scheduled symbol master refresh failed", error);
            })
            .doFinally(signalType -> {
                isRefreshing = false;
            })
            .subscribe();
    }
    
    /**
     * Manually trigger symbol master ingestion.
     * Fetches equity master data from NSE API, parses and transforms to NseEquityMaster entities,
     * and performs batch upsert to nse_eq_master table.
     * 
     * @return Mono containing the number of records updated
     * 
     * Requirements: 7.1, 7.2
     */
    public Mono<Integer> ingestSymbolMaster() {
        if (isRefreshing) {
            log.warn("Symbol master refresh already in progress");
            return Mono.error(new IllegalStateException("Symbol master refresh already in progress"));
        }
        
        isRefreshing = true;
        log.info("Starting symbol master ingestion from NSE API");
        
        return nseDataProvider.fetchEquityMasterData()
            .flatMap(masterDataList -> {
                if (masterDataList == null || masterDataList.isEmpty()) {
                    log.warn("No equity master data received from NSE API");
                    return Mono.just(0);
                }
                
                log.info("Fetched {} equity master records from NSE API", masterDataList.size());
                log.debug("Sample symbols: {}", 
                    masterDataList.stream()
                        .limit(5)
                        .map(NseEquityMaster::getSymbol)
                        .toList());
                
                // Perform batch upsert using custom repository
                return Mono.fromCallable(() -> {
                    customRepository.batchUpsert(masterDataList);
                    return masterDataList.size();
                });
            })
            .doOnSuccess(count -> {
                log.info("Symbol master ingestion completed. Total records updated: {}", count);
                lastRefreshTime = Instant.now();
                lastRefreshCount = count;
            })
            .doOnError(error -> {
                log.error("Symbol master ingestion failed", error);
            })
            .doFinally(signalType -> {
                isRefreshing = false;
            });
    }
    
    /**
     * Gets the status of the last symbol master refresh.
     * 
     * @return Mono containing refresh status information
     */
    public Mono<RefreshStatus> getRefreshStatus() {
        return Mono.just(new RefreshStatus(
            lastRefreshTime,
            lastRefreshCount,
            isRefreshing
        ));
    }
    
    /**
     * Checks if symbol master data is stale (older than 24 hours).
     * 
     * @return Mono containing true if data is stale
     */
    public Mono<Boolean> isDataStale() {
        if (lastRefreshTime == null) {
            return Mono.just(true);
        }
        
        long hoursSinceRefresh = java.time.Duration.between(lastRefreshTime, Instant.now()).toHours();
        return Mono.just(hoursSinceRefresh > 24);
    }
    
    /**
     * Record class for refresh status information.
     */
    public record RefreshStatus(
        Instant lastRefreshTime,
        int lastRefreshCount,
        boolean isRefreshing
    ) {}
}
