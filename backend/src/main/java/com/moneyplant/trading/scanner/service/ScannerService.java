package com.moneyplant.trading.scanner.service;

import com.moneyplant.trading.common.dto.TradingSignalDto;
import com.moneyplant.trading.common.enums.PatternType;

import java.util.List;

public interface ScannerService {
    
    void runScanner(String pattern);
    
    List<String> getAvailablePatterns();
    
    TradingSignalDto detectPattern(String symbol, String pattern);
    
    List<TradingSignalDto> getTradingSignals(String symbol);
    
    boolean validatePattern(String pattern);
    
    void publishSignal(TradingSignalDto signal);
}
