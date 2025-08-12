package com.moneyplant.trading.storage.service;

import com.moneyplant.trading.common.dto.MarketDataDto;

import java.util.List;

public interface StorageService {
    
    void writeData(String data);
    
    String readData(String query);
    
    void writeHudiData(String data);
    
    void writeIcebergData(String data);
    
    void writeMarketData(MarketDataDto marketData);
    
    List<MarketDataDto> readMarketData(String symbol, String startDate, String endDate);
    
    void deleteData(String query);
}
