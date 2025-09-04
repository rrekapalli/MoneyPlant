package com.moneyplant.engines.screener.service;

import com.moneyplant.engines.common.dto.TradingSignalDto;

import java.util.List;

/**
 * Service interface for pattern screening operations
 */
public interface ScreenerService {
    
    /**
     * Scan for patterns in a specific symbol
     */
    List<TradingSignalDto> scanSymbol(String symbol);
    
    /**
     * Scan for patterns in all symbols
     */
    List<TradingSignalDto> scanAllSymbols();
    
    /**
     * Get detected patterns for a symbol
     */
    List<String> getDetectedPatterns(String symbol);
    
    /**
     * Add a new screener rule
     */
    void addScreenerRule(String rule);
    
    /**
     * Get all screener rules
     */
    List<String> getScreenerRules();
    
    /**
     * Delete a screener rule
     */
    void deleteScreenerRule(String ruleId);
    
    /**
     * Detect candlestick patterns
     */
    List<String> detectCandlestickPatterns(String symbol);
    
    /**
     * Detect technical indicator patterns
     */
    List<String> detectTechnicalPatterns(String symbol);
}
