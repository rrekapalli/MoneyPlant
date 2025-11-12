package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.common.entities.NseEquityMaster;
import com.moneyplant.engines.ingestion.model.PredefinedUniverse;
import com.moneyplant.engines.ingestion.model.SymbolUniverse;
import com.moneyplant.engines.ingestion.model.UniverseFilter;
import com.moneyplant.engines.ingestion.repository.NseEquityMasterRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service for managing symbol universes and filtering symbols based on various criteria.
 * Queries nse_eq_master table for predefined universes (NSE 500, Nifty 50, etc.)
 * and supports custom filters (sector, industry, market cap ranges).
 * 
 * Requirements: 7.3, 7.6
 */
@Service
@Slf4j
public class SymbolUniverseService {
    
    private final NseEquityMasterRepository repository;
    
    // Cache for custom universes
    private final Map<String, SymbolUniverse> customUniverses = new ConcurrentHashMap<>();
    
    public SymbolUniverseService(NseEquityMasterRepository repository) {
        this.repository = repository;
        log.info("SymbolUniverseService initialized");
    }
    
    /**
     * Get a predefined universe by name.
     * Queries nse_eq_master table using pd_sector_ind, is_fno_sec, and trading_status fields.
     * 
     * @param universeType the predefined universe type
     * @return Mono containing the symbol universe
     * 
     * Requirements: 7.3, 7.6
     */
    public Mono<SymbolUniverse> getPredefinedUniverse(PredefinedUniverse universeType) {
        return Mono.fromCallable(() -> {
            log.info("Fetching predefined universe: {}", universeType.getUniverseName());
            
            List<NseEquityMaster> equities;
            
            switch (universeType) {
                case NIFTY_50:
                    equities = repository.findNifty50Symbols();
                    break;
                    
                case NIFTY_BANK:
                    equities = repository.findNiftyBankSymbols();
                    break;
                    
                case FNO_STOCKS:
                    equities = repository.findFnoEligibleStocks();
                    break;
                    
                case NIFTY_NEXT_50:
                case NIFTY_100:
                case NIFTY_200:
                case NIFTY_500:
                case NIFTY_MIDCAP_50:
                case NIFTY_SMALLCAP_50:
                    equities = repository.findByIndex(universeType.getIndexName());
                    break;
                    
                case ALL_ACTIVE:
                    equities = repository.findByTradingStatus("Active");
                    break;
                    
                default:
                    equities = Collections.emptyList();
            }
            
            Set<String> symbols = equities.stream()
                    .map(NseEquityMaster::getSymbol)
                    .collect(Collectors.toSet());
            
            log.info("Found {} symbols for universe {}", symbols.size(), universeType.getUniverseName());
            
            return SymbolUniverse.builder()
                    .name(universeType.getUniverseName())
                    .description(universeType.getDescription())
                    .symbols(symbols)
                    .type(SymbolUniverse.UniverseType.PREDEFINED)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .doOnError(error -> log.error("Failed to fetch predefined universe {}", 
            universeType.getUniverseName(), error));
    }
    
    /**
     * Get a universe by name (predefined or custom).
     * 
     * @param name the universe name
     * @return Mono containing the symbol universe
     */
    public Mono<SymbolUniverse> getUniverse(String name) {
        // Check if it's a predefined universe
        try {
            PredefinedUniverse predefined = PredefinedUniverse.valueOf(name);
            return getPredefinedUniverse(predefined);
        } catch (IllegalArgumentException e) {
            // Not a predefined universe, check custom universes
            SymbolUniverse custom = customUniverses.get(name);
            if (custom != null) {
                return Mono.just(custom);
            }
            return Mono.error(new IllegalArgumentException("Universe not found: " + name));
        }
    }
    
    /**
     * Create a custom universe with specific filter criteria.
     * Supports filtering by sector, industry, trading status, market cap ranges, etc.
     * 
     * @param name the universe name
     * @param description the universe description
     * @param filter the filter criteria
     * @return Mono containing the created symbol universe
     * 
     * Requirements: 7.3, 7.6
     */
    public Mono<SymbolUniverse> createCustomUniverse(String name, String description, UniverseFilter filter) {
        return getSymbolsByFilter(filter)
                .collect(Collectors.toSet())
                .map(symbols -> {
                    SymbolUniverse universe = SymbolUniverse.builder()
                            .name(name)
                            .description(description)
                            .symbols(symbols)
                            .type(SymbolUniverse.UniverseType.CUSTOM)
                            .filter(filter)
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();
                    
                    customUniverses.put(name, universe);
                    log.info("Created custom universe '{}' with {} symbols", name, symbols.size());
                    
                    return universe;
                })
                .doOnError(error -> log.error("Failed to create custom universe '{}'", name, error));
    }
    
    /**
     * Get symbols by applying custom filter criteria.
     * Uses pd_sector_ind, is_fno_sec, trading_status, sector, and industry fields for filtering.
     * 
     * @param filter the filter criteria
     * @return Flux of symbols matching the filter
     * 
     * Requirements: 7.3, 7.6
     */
    public Flux<String> getSymbolsByFilter(UniverseFilter filter) {
        return Mono.fromCallable(() -> {
            log.debug("Applying filter: {}", filter);
            
            if (filter == null || filter.isEmpty()) {
                log.warn("Empty filter provided, returning all active symbols");
                return repository.findByTradingStatus("Active");
            }
            
            // Start with all equities
            List<NseEquityMaster> equities = repository.findAll();
            
            // Apply filters
            return equities.stream()
                    .filter(equity -> applyFilter(equity, filter))
                    .collect(Collectors.toList());
        })
        .subscribeOn(Schedulers.boundedElastic())
        .flatMapMany(Flux::fromIterable)
        .map(NseEquityMaster::getSymbol)
        .doOnComplete(() -> log.debug("Filter application completed"))
        .doOnError(error -> log.error("Failed to apply filter", error));
    }
    
    /**
     * Apply filter criteria to a single equity.
     */
    private boolean applyFilter(NseEquityMaster equity, UniverseFilter filter) {
        // Trading status filter
        if (filter.getTradingStatus() != null && 
            !filter.getTradingStatus().equals(equity.getTradingStatus())) {
            return false;
        }
        
        // Exclude suspended
        if (Boolean.TRUE.equals(filter.getExcludeSuspended()) && 
            "Yes".equals(equity.getIsSuspended())) {
            return false;
        }
        
        // Exclude delisted
        if (Boolean.TRUE.equals(filter.getExcludeDelisted()) && 
            "Yes".equals(equity.getIsDelisted())) {
            return false;
        }
        
        // Sector filter
        if (filter.getSectors() != null && !filter.getSectors().isEmpty() &&
            !filter.getSectors().contains(equity.getSector())) {
            return false;
        }
        
        // Industry filter
        if (filter.getIndustries() != null && !filter.getIndustries().isEmpty() &&
            !filter.getIndustries().contains(equity.getIndustry())) {
            return false;
        }
        
        // Index filter (pd_sector_ind)
        if (filter.getIndices() != null && !filter.getIndices().isEmpty() &&
            !filter.getIndices().contains(equity.getPdSectorInd())) {
            return false;
        }
        
        // FNO eligibility filter
        if (filter.getIsFnoEligible() != null) {
            boolean isFno = "Yes".equals(equity.getIsFnoSec());
            if (filter.getIsFnoEligible() != isFno) {
                return false;
            }
        }
        
        // Price filters
        if (equity.getLastPrice() != null) {
            BigDecimal lastPrice = BigDecimal.valueOf(equity.getLastPrice());
            
            if (filter.getMinPrice() != null && lastPrice.compareTo(filter.getMinPrice()) < 0) {
                return false;
            }
            
            if (filter.getMaxPrice() != null && lastPrice.compareTo(filter.getMaxPrice()) > 0) {
                return false;
            }
        }
        
        // Volume filter
        if (filter.getMinVolume() != null && equity.getTotalTradedVolume() != null) {
            long volume = equity.getTotalTradedVolume().longValue();
            if (volume < filter.getMinVolume()) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Update an existing custom universe with new filter criteria.
     * 
     * @param name the universe name
     * @param filter the new filter criteria
     * @return Mono containing the updated symbol universe
     */
    public Mono<SymbolUniverse> updateCustomUniverse(String name, UniverseFilter filter) {
        SymbolUniverse existing = customUniverses.get(name);
        if (existing == null) {
            return Mono.error(new IllegalArgumentException("Custom universe not found: " + name));
        }
        
        return getSymbolsByFilter(filter)
                .collect(Collectors.toSet())
                .map(symbols -> {
                    SymbolUniverse updated = SymbolUniverse.builder()
                            .name(existing.getName())
                            .description(existing.getDescription())
                            .symbols(symbols)
                            .type(SymbolUniverse.UniverseType.CUSTOM)
                            .filter(filter)
                            .createdAt(existing.getCreatedAt())
                            .updatedAt(Instant.now())
                            .build();
                    
                    customUniverses.put(name, updated);
                    log.info("Updated custom universe '{}' with {} symbols", name, symbols.size());
                    
                    return updated;
                })
                .doOnError(error -> log.error("Failed to update custom universe '{}'", name, error));
    }
    
    /**
     * Delete a custom universe.
     * 
     * @param name the universe name
     * @return Mono that completes when universe is deleted
     */
    public Mono<Void> deleteCustomUniverse(String name) {
        return Mono.fromRunnable(() -> {
            SymbolUniverse removed = customUniverses.remove(name);
            if (removed != null) {
                log.info("Deleted custom universe '{}'", name);
            } else {
                log.warn("Custom universe '{}' not found for deletion", name);
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        .then();
    }
    
    /**
     * List all available universes (predefined and custom).
     * 
     * @return Flux of universe names
     */
    public Flux<String> listUniverses() {
        return Flux.concat(
            Flux.fromArray(PredefinedUniverse.values())
                .map(PredefinedUniverse::getUniverseName),
            Flux.fromIterable(customUniverses.keySet())
        );
    }
    
    /**
     * Get all custom universes.
     * 
     * @return Flux of custom symbol universes
     */
    public Flux<SymbolUniverse> getCustomUniverses() {
        return Flux.fromIterable(customUniverses.values());
    }
    
    /**
     * Get symbols from multiple universes (union).
     * 
     * @param universeNames the universe names
     * @return Flux of unique symbols
     */
    public Flux<String> getSymbolsFromUniverses(Set<String> universeNames) {
        return Flux.fromIterable(universeNames)
                .flatMap(this::getUniverse)
                .flatMapIterable(SymbolUniverse::getSymbols)
                .distinct();
    }
    
    /**
     * Check if a symbol exists in a universe.
     * 
     * @param universeName the universe name
     * @param symbol the symbol to check
     * @return Mono containing true if symbol exists in universe
     */
    public Mono<Boolean> containsSymbol(String universeName, String symbol) {
        return getUniverse(universeName)
                .map(universe -> universe.getSymbols().contains(symbol))
                .onErrorReturn(false);
    }
}
