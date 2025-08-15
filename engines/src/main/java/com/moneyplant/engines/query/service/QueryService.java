package com.moneyplant.engines.query.service;

import java.util.List;
import java.util.Map;

/**
 * Service interface for query operations
 */
public interface QueryService {
    
    /**
     * Run a SQL query
     */
    List<Map<String, Object>> runQuery(String sqlQuery);
    
    /**
     * Run an analytics query
     */
    Map<String, Object> runAnalyticsQuery(String queryType, String symbol);
    
    /**
     * Generate performance report
     */
    Map<String, Object> generatePerformanceReport(String symbol, String period);
    
    /**
     * Generate risk report
     */
    Map<String, Object> generateRiskReport(String symbol);
    
    /**
     * Generate volatility report
     */
    Map<String, Object> generateVolatilityReport(String symbol, String timeframe);
    
    /**
     * Run backtest query
     */
    List<Map<String, Object>> runBacktestQuery(String backtestQuery);
    
    /**
     * Get list of queryable tables
     */
    List<String> getQueryableTables();
    
    /**
     * Execute Trino query
     */
    List<Map<String, Object>> executeTrinoQuery(String query);
    
    /**
     * Execute Spark SQL query
     */
    List<Map<String, Object>> executeSparkQuery(String query);
    
    /**
     * Get query execution plan
     */
    String getQueryExecutionPlan(String query);
}
