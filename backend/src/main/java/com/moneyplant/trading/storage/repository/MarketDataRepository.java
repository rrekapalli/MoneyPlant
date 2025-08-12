package com.moneyplant.trading.storage.repository;

import com.moneyplant.trading.common.dto.MarketDataDto;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarketDataRepository {
    
    void save(MarketDataDto marketData);
    
    Optional<MarketDataDto> findById(String id);
    
    List<MarketDataDto> findBySymbol(String symbol);
    
    List<MarketDataDto> findBySymbolAndTimeRange(String symbol, LocalDateTime start, LocalDateTime end);
    
    List<MarketDataDto> findByTimeRange(LocalDateTime start, LocalDateTime end);
    
    void deleteById(String id);
    
    void deleteBySymbol(String symbol);
    
    long countBySymbol(String symbol);
}
