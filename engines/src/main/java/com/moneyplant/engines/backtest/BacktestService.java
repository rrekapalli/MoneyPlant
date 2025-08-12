package com.moneyplant.engines.backtest;

import com.moneyplant.engines.model.BacktestResult;
import com.moneyplant.engines.model.Strategy;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service interface for strategy backtesting
 */
public interface BacktestService {

    /**
     * Run backtest for a strategy
     * @param strategy The strategy to backtest
     * @param symbol The trading symbol
     * @param startDate Start date for backtest
     * @param endDate End date for backtest
     * @param initialCapital Initial capital for backtest
     * @return CompletableFuture with the backtest result
     */
    CompletableFuture<BacktestResult> runBacktest(Strategy strategy, String symbol, 
                                                 LocalDateTime startDate, LocalDateTime endDate, 
                                                 Double initialCapital);

    /**
     * Run backtest with custom parameters
     * @param strategyId The strategy ID
     * @param symbol The trading symbol
     * @param startDate Start date for backtest
     * @param endDate End date for backtest
     * @param initialCapital Initial capital for backtest
     * @param parameters Custom strategy parameters
     * @return CompletableFuture with the backtest result
     */
    CompletableFuture<BacktestResult> runBacktestWithParameters(Long strategyId, String symbol,
                                                               LocalDateTime startDate, LocalDateTime endDate,
                                                               Double initialCapital, String parameters);

    /**
     * Get backtest results for a strategy
     * @param strategyId The strategy ID
     * @return CompletableFuture with the list of backtest results
     */
    CompletableFuture<List<BacktestResult>> getBacktestResults(Long strategyId);

    /**
     * Get backtest result by ID
     * @param backtestId The backtest result ID
     * @return CompletableFuture with the backtest result
     */
    CompletableFuture<BacktestResult> getBacktestResult(Long backtestId);

    /**
     * Cancel running backtest
     * @param backtestId The backtest ID to cancel
     * @return CompletableFuture with the cancellation result
     */
    CompletableFuture<Boolean> cancelBacktest(Long backtestId);

    /**
     * Get backtest performance metrics
     * @param backtestId The backtest ID
     * @return CompletableFuture with the performance metrics
     */
    CompletableFuture<BacktestMetrics> getBacktestMetrics(Long backtestId);

    /**
     * Compare multiple backtest results
     * @param backtestIds List of backtest IDs to compare
     * @return CompletableFuture with the comparison results
     */
    CompletableFuture<BacktestComparison> compareBacktests(List<Long> backtestIds);
}
