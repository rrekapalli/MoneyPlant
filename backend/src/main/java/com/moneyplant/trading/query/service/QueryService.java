package com.moneyplant.trading.query.service;

import java.util.List;
import java.util.Map;

public interface QueryService {
    
    String runQuery(String query);
    
    String getAnalytics(String symbol);
    
    String getBacktestingData(String strategy);
    
    String getReport(String reportType);
    
    List<Map<String, Object>> executeTrinoQuery(String sql);
    
    Map<String, Object> getPerformanceMetrics(String symbol, String startDate, String endDate);
    
    List<Map<String, Object>> getHistoricalData(String symbol, String startDate, String endDate);
}
