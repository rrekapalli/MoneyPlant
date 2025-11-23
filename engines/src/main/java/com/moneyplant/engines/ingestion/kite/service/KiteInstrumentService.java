package com.moneyplant.engines.ingestion.kite.service;

import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMaster;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

public interface KiteInstrumentService {
    
    CompletableFuture<String> importInstruments(List<String> exchanges);
    
    Optional<KiteInstrumentMaster> getInstrument(String instrumentToken, String exchange);
    
    List<KiteInstrumentMaster> searchByTradingSymbol(String tradingSymbol);
}
