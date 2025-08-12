package com.moneyplant.engines.backtest.service;

import com.moneyplant.engines.common.dto.BacktestResultDto;

import java.util.List;
import java.util.Map;

/**
 * Service interface for backtesting operations
 */
public interface BacktestService {
    
    /**
     * Run a backtest for a strategy and symbol
     */
    BacktestResultDto runBacktest(String strategyName, String symbol, String startDate, String endDate);
    
    /**
     * Run a backtest with custom parameters
     */
    BacktestResultDto runBacktestWithParameters(String backtestConfig);
    
    /**
     * Get backtest result by ID
     */
    BacktestResultDto getBacktestResult(String backtestId);
    
    /**
     * Get all backtest results
     */
    List<BacktestResultDto> getAllBacktestResults();
    
    /**
     * Get backtest results by strategy
     */
    List<BacktestResultDto> getBacktestResultsByStrategy(String strategyName);
    
    /**
     * Delete backtest result
     */
    void deleteBacktestResult(String backtestId);
    
    /**
     * Compare multiple backtests
     */
    Map<String, Object> compareBacktests(List<String> backtestIds);
    
    /**
     * Run historical replay
     */
    BacktestResultDto runHistoricalReplay(String strategyName, String symbol, String startDate, String endDate);
    
    /**
     * Calculate performance metrics
     */
    Map<String, Object> calculatePerformanceMetrics(BacktestResultDto backtestResult);
    
    /**
     * Simulate trade execution
     */
    List<BacktestResultDto.TradeDto> simulateTradeExecution(String strategyName, String symbol, String startDate, String endDate);
}
