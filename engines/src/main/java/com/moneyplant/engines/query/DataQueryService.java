package com.moneyplant.engines.query;

import com.moneyplant.engines.model.MarketData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service interface for querying market data and analytics
 */
public interface DataQueryService {

    /**
     * Query market data for a symbol within a date range
     * @param symbol The trading symbol
     * @param startDate Start date for query
     * @param endDate End date for query
     * @param interval Data interval (1m, 5m, 15m, 1h, 1d, etc.)
     * @return CompletableFuture with the market data
     */
    CompletableFuture<List<MarketData>> queryMarketData(String symbol, LocalDateTime startDate, 
                                                        LocalDateTime endDate, String interval);

    /**
     * Query real-time market data for a symbol
     * @param symbol The trading symbol
     * @return CompletableFuture with the real-time market data
     */
    CompletableFuture<MarketData> queryRealTimeData(String symbol);

    /**
     * Query aggregated market data
     * @param symbol The trading symbol
     * @param startDate Start date for query
     * @param endDate End date for query
     * @param aggregationType Type of aggregation (OHLCV, VWAP, etc.)
     * @param interval Aggregation interval
     * @return CompletableFuture with the aggregated data
     */
    CompletableFuture<List<AggregatedData>> queryAggregatedData(String symbol, LocalDateTime startDate,
                                                                LocalDateTime endDate, String aggregationType,
                                                                String interval);

    /**
     * Query technical indicators
     * @param symbol The trading symbol
     * @param startDate Start date for query
     * @param endDate End date for query
     * @param indicators List of technical indicators
     * @return CompletableFuture with the technical indicator data
     */
    CompletableFuture<List<TechnicalIndicatorData>> queryTechnicalIndicators(String symbol, LocalDateTime startDate,
                                                                            LocalDateTime endDate, List<String> indicators);

    /**
     * Query fundamental data
     * @param symbol The trading symbol
     * @param metrics List of fundamental metrics
     * @return CompletableFuture with the fundamental data
     */
    CompletableFuture<FundamentalData> queryFundamentalData(String symbol, List<String> metrics);

    /**
     * Query market statistics
     * @param symbol The trading symbol
     * @param startDate Start date for query
     * @param endDate End date for query
     * @return CompletableFuture with the market statistics
     */
    CompletableFuture<MarketStatistics> queryMarketStatistics(String symbol, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Query correlation data between symbols
     * @param symbols List of symbols to analyze
     * @param startDate Start date for query
     * @param endDate End date for query
     * @return CompletableFuture with the correlation data
     */
    CompletableFuture<CorrelationData> queryCorrelationData(List<String> symbols, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Execute custom SQL query
     * @param sqlQuery The SQL query to execute
     * @return CompletableFuture with the query results
     */
    CompletableFuture<QueryResult> executeCustomQuery(String sqlQuery);

    /**
     * Get query performance metrics
     * @return CompletableFuture with the query performance metrics
     */
    CompletableFuture<QueryPerformanceMetrics> getQueryPerformanceMetrics();
}
