package com.moneyplant.engines.strategy.service;

import com.moneyplant.engines.common.dto.TradingSignalDto;

import java.util.List;

/**
 * Service interface for trading strategy operations
 */
public interface StrategyService {
    
    /**
     * Execute a specific strategy for a symbol
     */
    TradingSignalDto executeStrategy(String strategyName, String symbol);
    
    /**
     * Execute all available strategies for a symbol
     */
    List<TradingSignalDto> executeAllStrategies(String symbol);
    
    /**
     * Get list of available strategies
     */
    List<String> getAvailableStrategies();
    
    /**
     * Enable a strategy
     */
    void enableStrategy(String strategyName);
    
    /**
     * Disable a strategy
     */
    void disableStrategy(String strategyName);
    
    /**
     * Get strategy performance metrics
     */
    String getStrategyPerformance(String strategyName);
    
    /**
     * Update strategy parameters
     */
    void updateStrategyParameters(String strategyName, String parameters);
    
    /**
     * Evaluate RSI strategy
     */
    TradingSignalDto evaluateRSIStrategy(String symbol);
    
    /**
     * Evaluate MACD strategy
     */
    TradingSignalDto evaluateMACDStrategy(String symbol);
    
    /**
     * Evaluate Bollinger Bands strategy
     */
    TradingSignalDto evaluateBollingerBandsStrategy(String symbol);
}
