package com.moneyplant.engines.ingestion.kite.service.impl;

import com.moneyplant.engines.ingestion.kite.client.KiteConnectClient;
import com.moneyplant.engines.ingestion.kite.exception.KiteIngestionException;
import com.moneyplant.engines.ingestion.kite.model.dto.BatchHistoricalDataRequest;
import com.moneyplant.engines.ingestion.kite.model.dto.HistoricalDataRequest;
import com.moneyplant.engines.ingestion.kite.model.dto.IngestionSummary;
import com.moneyplant.engines.ingestion.kite.model.enums.CandleInterval;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteOhlcvHistoric;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteOhlcvHistoricId;
import com.moneyplant.engines.ingestion.kite.repository.KiteBatchRepository;
import com.moneyplant.engines.ingestion.kite.repository.KiteOhlcvHistoricRepository;
import com.moneyplant.engines.ingestion.kite.service.KiteHistoricalDataService;
import com.moneyplant.engines.ingestion.kite.service.KiteJobTrackingService;
import com.zerodhatech.models.HistoricalData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class KiteHistoricalDataServiceImpl implements KiteHistoricalDataService {
    
    private final KiteConnectClient kiteClient;
    private final KiteOhlcvHistoricRepository repository;
    private final KiteBatchRepository batchRepository;
    private final KiteJobTrackingService jobTrackingService;
    
    public KiteHistoricalDataServiceImpl(
        KiteConnectClient kiteClient,
        KiteOhlcvHistoricRepository repository,
        KiteBatchRepository batchRepository,
        KiteJobTrackingService jobTrackingService
    ) {
        this.kiteClient = kiteClient;
        this.repository = repository;
        this.batchRepository = batchRepository;
        this.jobTrackingService = jobTrackingService;
    }
    
    @Override
    @Async("kiteIngestionExecutor")
    public CompletableFuture<String> fetchHistoricalData(HistoricalDataRequest request) {
        String jobId = UUID.randomUUID().toString();
        LocalDateTime startTime = LocalDateTime.now();
        
        try {
            jobTrackingService.startJob(jobId, "HISTORICAL_DATA_FETCH");
            log.info("Starting historical data fetch job {} for instrument {}", jobId, request.getInstrumentToken());
            
            validateDateRange(request.getFromDate(), request.getToDate());
            
            HistoricalData data = kiteClient.getHistoricalData(
                request.getInstrumentToken(),
                request.getFromDate(),
                request.getToDate(),
                request.getInterval().getKiteValue(),
                false
            );
            
            List<KiteOhlcvHistoric> entities = transformToEntities(
                data,
                request.getInstrumentToken(),
                request.getExchange(),
                request.getInterval().getKiteValue()
            );
            
            log.info("Transformed {} candles to entities", entities.size());
            
            int[] results = batchRepository.batchInsertOhlcv(entities);
            int totalInserted = Arrays.stream(results).sum();
            
            IngestionSummary summary = IngestionSummary.builder()
                .totalRecords(totalInserted)
                .successCount(totalInserted)
                .failureCount(0)
                .executionTime(Duration.between(startTime, LocalDateTime.now()))
                .build();
            
            jobTrackingService.completeJob(jobId, summary);
            log.info("Completed historical data fetch job {} successfully", jobId);
            
            return CompletableFuture.completedFuture(jobId);
            
        } catch (Exception e) {
            log.error("Historical data fetch failed for job {}", jobId, e);
            jobTrackingService.failJob(jobId, e.getMessage());
            throw new KiteIngestionException("Historical data fetch failed", e);
        }
    }
    
    @Override
    @Async("kiteIngestionExecutor")
    public CompletableFuture<String> batchFetchHistoricalData(BatchHistoricalDataRequest request) {
        String jobId = UUID.randomUUID().toString();
        LocalDateTime startTime = LocalDateTime.now();
        
        try {
            jobTrackingService.startJob(jobId, "BATCH_HISTORICAL_DATA_FETCH");
            log.info("Starting batch historical data fetch job {} for {} instruments", 
                jobId, request.getInstrumentTokens().size());
            
            validateDateRange(request.getFromDate(), request.getToDate());
            
            int totalInserted = 0;
            int successCount = 0;
            int failureCount = 0;
            
            for (String instrumentToken : request.getInstrumentTokens()) {
                try {
                    HistoricalData data = kiteClient.getHistoricalData(
                        instrumentToken,
                        request.getFromDate(),
                        request.getToDate(),
                        request.getInterval().getKiteValue(),
                        false
                    );
                    
                    List<KiteOhlcvHistoric> entities = transformToEntities(
                        data,
                        instrumentToken,
                        request.getExchange(),
                        request.getInterval().getKiteValue()
                    );
                    
                    int[] results = batchRepository.batchInsertOhlcv(entities);
                    totalInserted += Arrays.stream(results).sum();
                    successCount++;
                    
                } catch (Exception e) {
                    log.error("Failed to fetch data for instrument {}", instrumentToken, e);
                    failureCount++;
                }
            }
            
            IngestionSummary summary = IngestionSummary.builder()
                .totalRecords(totalInserted)
                .successCount(successCount)
                .failureCount(failureCount)
                .executionTime(Duration.between(startTime, LocalDateTime.now()))
                .build();
            
            jobTrackingService.completeJob(jobId, summary);
            log.info("Completed batch historical data fetch job {} successfully", jobId);
            
            return CompletableFuture.completedFuture(jobId);
            
        } catch (Exception e) {
            log.error("Batch historical data fetch failed for job {}", jobId, e);
            jobTrackingService.failJob(jobId, e.getMessage());
            throw new KiteIngestionException("Batch historical data fetch failed", e);
        }
    }
    
    @Override
    public List<KiteOhlcvHistoric> queryHistoricalData(
        String instrumentToken,
        String exchange,
        LocalDate fromDate,
        LocalDate toDate,
        String interval
    ) {
        CandleInterval candleInterval = CandleInterval.fromKiteValue(interval);
        return repository.findByInstrumentAndDateRange(
            instrumentToken,
            exchange,
            candleInterval,
            fromDate.atStartOfDay(),
            toDate.atTime(23, 59, 59)
        );
    }
    
    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("fromDate must be before toDate");
        }
        
        if (fromDate.isAfter(LocalDate.now()) || toDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Dates cannot be in the future");
        }
    }
    
    private List<KiteOhlcvHistoric> transformToEntities(
        HistoricalData data,
        String instrumentToken,
        String exchange,
        String interval
    ) {
        if (data == null || data.dataArrayList == null) {
            return Collections.emptyList();
        }
        
        return data.dataArrayList.stream()
            .map(candle -> {
                try {
                    // Parse timestamp string (format: "2024-01-01T09:15:00+0530")
                    LocalDateTime date = LocalDateTime.parse(
                        candle.timeStamp.substring(0, 19),
                        java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME
                    );
                    
                    CandleInterval candleInterval = CandleInterval.fromKiteValue(interval);
                    
                    return KiteOhlcvHistoric.builder()
                        .instrumentToken(instrumentToken)
                        .exchange(exchange)
                        .date(date)
                        .candleInterval(candleInterval)
                        .open(candle.open)
                        .high(candle.high)
                        .low(candle.low)
                        .close(candle.close)
                        .volume(candle.volume)
                        .build();
                } catch (Exception e) {
                    log.error("Error transforming candle data: {}", e.getMessage(), e);
                    return null;
                }
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
}
