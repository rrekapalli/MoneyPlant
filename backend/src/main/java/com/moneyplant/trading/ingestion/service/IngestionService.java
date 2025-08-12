package com.moneyplant.trading.ingestion.service;

import com.moneyplant.trading.common.dto.MarketDataDto;

public interface IngestionService {
    
    void startIngestion(String symbol);
    
    void stopIngestion(String symbol);
    
    String getIngestionStatus(String symbol);
    
    void ingestMarketData(MarketDataDto marketData);
    
    void processKafkaMessage(String message);
    
    void startSparkStreaming();
    
    void stopSparkStreaming();
}
