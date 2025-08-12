package com.moneyplant.trading.strategy.service;

import com.moneyplant.trading.common.dto.TradingSignalDto;
import com.moneyplant.trading.common.enums.StrategyType;

import java.util.List;

public interface StrategyService {
    
    TradingSignalDto executeStrategy(String strategy, String symbol);
    
    List<String> getAvailableStrategies();
    
    String backtestStrategy(String strategy, String symbol);
    
    String getStrategyPerformance(String strategy);
    
    boolean validateStrategy(String strategy);
    
    void updateStrategyParameters(String strategy, Object parameters);
}
