package com.moneyplant.engines.ingestion.kite.api;

import com.moneyplant.engines.ingestion.kite.model.dto.*;
import com.moneyplant.engines.ingestion.kite.service.KiteHistoricalDataService;
import com.moneyplant.engines.ingestion.kite.service.KiteInstrumentService;
import com.moneyplant.engines.ingestion.kite.service.KiteJobTrackingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/ingestion/kite")
@Slf4j
@Validated
public class KiteIngestionController {
    
    private final KiteInstrumentService instrumentService;
    private final KiteHistoricalDataService historicalDataService;
    private final KiteJobTrackingService jobTrackingService;
    
    public KiteIngestionController(
        KiteInstrumentService instrumentService,
        KiteHistoricalDataService historicalDataService,
        KiteJobTrackingService jobTrackingService
    ) {
        this.instrumentService = instrumentService;
        this.historicalDataService = historicalDataService;
        this.jobTrackingService = jobTrackingService;
    }
    
    @PostMapping("/instruments")
    public ResponseEntity<JobStatusResponse> importInstruments(
        @RequestBody(required = false) InstrumentImportRequest request
    ) {
        log.info("Received instrument import request: {}", request);
        
        CompletableFuture<String> jobIdFuture = instrumentService.importInstruments(
            request != null ? request.getExchanges() : null
        );
        
        String jobId = jobIdFuture.join();
        JobStatusResponse response = jobTrackingService.getJobStatus(jobId);
        
        log.info("Started instrument import job: {}", jobId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
    
    @PostMapping("/historical")
    public ResponseEntity<JobStatusResponse> fetchHistoricalData(
        @Valid @RequestBody HistoricalDataRequest request
    ) {
        log.info("Received historical data fetch request: {}", request);
        
        CompletableFuture<String> jobIdFuture = historicalDataService.fetchHistoricalData(request);
        String jobId = jobIdFuture.join();
        JobStatusResponse response = jobTrackingService.getJobStatus(jobId);
        
        log.info("Started historical data fetch job: {}", jobId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
    
    @PostMapping("/historical/batch")
    public ResponseEntity<JobStatusResponse> batchFetchHistoricalData(
        @Valid @RequestBody BatchHistoricalDataRequest request
    ) {
        log.info("Received batch historical data fetch request for {} instruments", 
            request.getInstrumentTokens().size());
        
        CompletableFuture<String> jobIdFuture = historicalDataService.batchFetchHistoricalData(request);
        String jobId = jobIdFuture.join();
        JobStatusResponse response = jobTrackingService.getJobStatus(jobId);
        
        log.info("Started batch historical data fetch job: {}", jobId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
    
    @GetMapping("/status/{jobId}")
    public ResponseEntity<JobStatusResponse> getJobStatus(@PathVariable String jobId) {
        log.debug("Received job status request for jobId: {}", jobId);
        
        JobStatusResponse response = jobTrackingService.getJobStatus(jobId);
        
        if (response == null) {
            log.warn("Job not found: {}", jobId);
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(response);
    }
}
