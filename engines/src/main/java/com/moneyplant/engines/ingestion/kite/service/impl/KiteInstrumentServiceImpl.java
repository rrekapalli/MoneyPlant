package com.moneyplant.engines.ingestion.kite.service.impl;

import com.moneyplant.engines.ingestion.kite.client.KiteConnectClient;
import com.moneyplant.engines.ingestion.kite.exception.KiteIngestionException;
import com.moneyplant.engines.ingestion.kite.model.dto.IngestionSummary;

import java.time.LocalDate;
import java.time.ZoneId;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMaster;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMasterId;
import com.moneyplant.engines.ingestion.kite.repository.KiteBatchRepository;
import com.moneyplant.engines.ingestion.kite.repository.KiteInstrumentMasterRepository;
import com.moneyplant.engines.ingestion.kite.service.KiteInstrumentService;
import com.moneyplant.engines.ingestion.kite.service.KiteJobTrackingService;
import com.zerodhatech.models.Instrument;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class KiteInstrumentServiceImpl implements KiteInstrumentService {
    
    private final KiteConnectClient kiteClient;
    private final KiteInstrumentMasterRepository repository;
    private final KiteBatchRepository batchRepository;
    private final KiteJobTrackingService jobTrackingService;
    
    public KiteInstrumentServiceImpl(
        KiteConnectClient kiteClient,
        KiteInstrumentMasterRepository repository,
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
    public CompletableFuture<String> importInstruments(List<String> exchanges) {
        String jobId = UUID.randomUUID().toString();
        LocalDateTime startTime = LocalDateTime.now();
        
        try {
            jobTrackingService.startJob(jobId, "INSTRUMENT_IMPORT");
            log.info("Starting instrument import job {} for exchanges: {}", jobId, exchanges);
            
            List<Instrument> instruments = kiteClient.getInstruments();
            log.info("Fetched {} instruments from Kite API", instruments.size());
            
            if (exchanges != null && !exchanges.isEmpty()) {
                instruments = instruments.stream()
                    .filter(i -> exchanges.contains(i.getExchange()))
                    .collect(Collectors.toList());
                log.info("Filtered to {} instruments for exchanges: {}", instruments.size(), exchanges);
            }
            
            List<KiteInstrumentMaster> entities = instruments.stream()
                .map(this::toEntity)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
            
            log.info("Transformed {} instruments to entities", entities.size());
            
            int[] results = batchRepository.batchUpsertInstruments(entities);
            int totalAffected = Arrays.stream(results).sum();
            
            IngestionSummary summary = calculateSummary(entities, totalAffected, startTime);
            
            jobTrackingService.completeJob(jobId, summary);
            log.info("Completed instrument import job {} successfully", jobId);
            
            return CompletableFuture.completedFuture(jobId);
            
        } catch (Exception e) {
            log.error("Instrument import failed for job {}", jobId, e);
            jobTrackingService.failJob(jobId, e.getMessage());
            throw new KiteIngestionException("Instrument import failed", e);
        }
    }
    
    @Override
    public Optional<KiteInstrumentMaster> getInstrument(String instrumentToken, String exchange) {
        KiteInstrumentMasterId id = new KiteInstrumentMasterId(instrumentToken, exchange);
        return repository.findById(id);
    }
    
    @Override
    public List<KiteInstrumentMaster> searchByTradingSymbol(String tradingSymbol) {
        return repository.findByTradingsymbolIgnoreCase(tradingSymbol);
    }
    
    private KiteInstrumentMaster toEntity(Instrument instrument) {
        try {
            if (instrument.instrument_token == 0 ||
                instrument.exchange == null || instrument.exchange.isEmpty() ||
                instrument.tradingsymbol == null || instrument.tradingsymbol.isEmpty()) {
                log.warn("Skipping instrument with missing required fields: {}", instrument.tradingsymbol);
                return null;
            }
            
            // Convert Date to LocalDate for expiry
            LocalDate expiryDate = null;
            if (instrument.expiry != null) {
                expiryDate = instrument.expiry.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            }
            
            // Parse strike from String to Double
            Double strikeValue = null;
            if (instrument.strike != null && !instrument.strike.isEmpty()) {
                try {
                    strikeValue = Double.parseDouble(instrument.strike);
                } catch (NumberFormatException e) {
                    log.warn("Invalid strike value for instrument {}: {}", instrument.tradingsymbol, instrument.strike);
                }
            }
            
            return KiteInstrumentMaster.builder()
                .instrumentToken(String.valueOf(instrument.instrument_token))
                .exchangeToken(String.valueOf(instrument.exchange_token))
                .tradingsymbol(instrument.tradingsymbol)
                .name(instrument.name)
                .lastPrice(instrument.last_price != 0.0 ? instrument.last_price : null)
                .expiry(expiryDate)
                .strike(strikeValue)
                .tickSize(instrument.tick_size != 0.0 ? instrument.tick_size : null)
                .lotSize(instrument.lot_size)
                .instrumentType(instrument.instrument_type)
                .segment(instrument.segment)
                .exchange(instrument.exchange)
                .build();
        } catch (Exception e) {
            log.error("Error transforming instrument: {}", instrument.tradingsymbol, e);
            return null;
        }
    }
    
    private IngestionSummary calculateSummary(List<KiteInstrumentMaster> entities, int totalAffected, LocalDateTime startTime) {
        Map<String, Integer> recordsByCategory = new HashMap<>();
        
        Map<String, Long> byExchange = entities.stream()
            .collect(Collectors.groupingBy(KiteInstrumentMaster::getExchange, Collectors.counting()));
        
        byExchange.forEach((exchange, count) -> 
            recordsByCategory.put("exchange_" + exchange, count.intValue()));
        
        Map<String, Long> byType = entities.stream()
            .filter(e -> e.getInstrumentType() != null)
            .collect(Collectors.groupingBy(KiteInstrumentMaster::getInstrumentType, Collectors.counting()));
        
        byType.forEach((type, count) -> 
            recordsByCategory.put("type_" + type, count.intValue()));
        
        Duration executionTime = Duration.between(startTime, LocalDateTime.now());
        
        return IngestionSummary.builder()
            .totalRecords(totalAffected)
            .successCount(totalAffected)
            .failureCount(0)
            .recordsByCategory(recordsByCategory)
            .executionTime(executionTime)
            .build();
    }
}
