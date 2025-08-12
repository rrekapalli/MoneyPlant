package com.moneyplant.strategy.services;

import com.moneyplant.strategy.entities.TradingStrategy;
import org.springframework.modulith.ApplicationModuleListener;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing trading strategies.
 */
public interface TradingStrategyService {
    
    /**
     * Create a new trading strategy.
     */
    TradingStrategy createStrategy(TradingStrategy strategy);
    
    /**
     * Update an existing trading strategy.
     */
    TradingStrategy updateStrategy(Long id, TradingStrategy strategy);
    
    /**
     * Get a strategy by ID.
     */
    Optional<TradingStrategy> getStrategyById(Long id);
    
    /**
     * Get all active strategies.
     */
    List<TradingStrategy> getActiveStrategies();
    
    /**
     * Activate a strategy.
     */
    TradingStrategy activateStrategy(Long id);
    
    /**
     * Pause a strategy.
     */
    TradingStrategy pauseStrategy(Long id);
    
    /**
     * Archive a strategy.
     */
    TradingStrategy archiveStrategy(Long id);
    
    /**
     * Execute a strategy.
     */
    void executeStrategy(Long id);
}
