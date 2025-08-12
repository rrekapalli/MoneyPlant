package com.moneyplant.engines.ingestion;

import com.moneyplant.engines.model.MarketData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service interface for market data ingestion
 */
public interface MarketDataIngestionService {

    /**
     * Ingest market data from external sources
     * @param symbol The trading symbol
     * @param startDate Start date for data ingestion
     * @param endDate End date for data ingestion
     * @return CompletableFuture with the number of records ingested
     */
    CompletableFuture<Integer> ingestMarketData(String symbol, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Ingest real-time market data
     * @param marketData The market data to ingest
     * @return CompletableFuture with the ingested market data
     */
    CompletableFuture<MarketData> ingestRealTimeData(MarketData marketData);

    /**
     * Ingest market data from CSV file
     * @param filePath Path to the CSV file
     * @param symbol The trading symbol
     * @return CompletableFuture with the number of records ingested
     */
    CompletableFuture<Integer> ingestFromCSV(String filePath, String symbol);

    /**
     * Ingest market data from Excel file
     * @param filePath Path to the Excel file
     * @param symbol The trading symbol
     * @return CompletableFuture with the number of records ingested
     */
    CompletableFuture<Integer> ingestFromExcel(String filePath, String symbol);

    /**
     * Ingest market data from Yahoo Finance API
     * @param symbol The trading symbol
     * @param startDate Start date for data ingestion
     * @param endDate End date for data ingestion
     * @return CompletableFuture with the number of records ingested
     */
    CompletableFuture<Integer> ingestFromYahooFinance(String symbol, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get ingestion status for a symbol
     * @param symbol The trading symbol
     * @return CompletableFuture with the ingestion status
     */
    CompletableFuture<IngestionStatus> getIngestionStatus(String symbol);

    /**
     * Retry failed ingestion jobs
     * @param symbol The trading symbol
     * @return CompletableFuture with the retry result
     */
    CompletableFuture<Boolean> retryFailedIngestion(String symbol);
}
