package com.moneyplant.trading.backtest.service;

import java.util.Map;

public interface BacktestService {
    
    String runBacktest(String strategy, String symbol);
    
    String getBacktestResults(String backtestId);
    
    String getBacktestMetrics(String backtestId);
    
    String startHistoricalReplay(String symbol, String startDate, String endDate);
    
    Map<String, Object> calculatePerformanceMetrics(String backtestId);
    
    void stopBacktest(String backtestId);
    
    String getBacktestStatus(String backtestId);
}
