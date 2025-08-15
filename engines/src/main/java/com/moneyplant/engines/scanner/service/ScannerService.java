package com.moneyplant.engines.scanner.service;

import com.moneyplant.engines.common.dto.TradingSignalDto;

import java.util.List;

/**
 * Service interface for pattern scanning operations
 */
public interface ScannerService {
    
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
     * Add a new scanner rule
     */
    void addScannerRule(String rule);
    
    /**
     * Get all scanner rules
     */
    List<String> getScannerRules();
    
    /**
     * Delete a scanner rule
     */
    void deleteScannerRule(String ruleId);
    
    /**
     * Detect candlestick patterns
     */
    List<String> detectCandlestickPatterns(String symbol);
    
    /**
     * Detect technical indicator patterns
     */
    List<String> detectTechnicalPatterns(String symbol);
}
