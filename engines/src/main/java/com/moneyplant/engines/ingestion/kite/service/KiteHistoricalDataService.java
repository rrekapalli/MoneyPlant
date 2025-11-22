package com.moneyplant.engines.ingestion.kite.service;

import com.moneyplant.engines.ingestion.kite.model.dto.BatchHistoricalDataRequest;
import com.moneyplant.engines.ingestion.kite.model.dto.HistoricalDataRequest;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteOhlcvHistoric;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface KiteHistoricalDataService {
    
    CompletableFuture<String> fetchHistoricalData(HistoricalDataRequest request);
    
    CompletableFuture<String> batchFetchHistoricalData(BatchHistoricalDataRequest request);
    
    List<KiteOhlcvHistoric> queryHistoricalData(
        String instrumentToken,
        String exchange,
        LocalDate fromDate,
        LocalDate toDate,
        String interval
    );
}
