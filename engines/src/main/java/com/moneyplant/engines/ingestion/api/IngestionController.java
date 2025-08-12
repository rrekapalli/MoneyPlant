package com.moneyplant.engines.ingestion.api;

import com.moneyplant.engines.common.dto.MarketDataDto;
import com.moneyplant.engines.ingestion.service.IngestionService;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for data ingestion operations
 */
@RestController
@RequestMapping("/api/ingestion")
public class IngestionController {
    
    
    
    private final IngestionService ingestionService;
    
    public IngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }
    
    @PostMapping("/start")
    public ResponseEntity<String> startIngestion(@RequestParam String dataSource) {
        // TODO: implement
        return ResponseEntity.ok("Ingestion started for " + dataSource);
    }
    
    @PostMapping("/stop")
    public ResponseEntity<String> stopIngestion(@RequestParam String dataSource) {
        // TODO: implement
        return ResponseEntity.ok("Ingestion stopped for " + dataSource);
    }
    
    @GetMapping("/status")
    public ResponseEntity<String> getIngestionStatus(@RequestParam String dataSource) {
        // TODO: implement
        return ResponseEntity.ok("Ingestion status: RUNNING");
    }
    
    @PostMapping("/data")
    public ResponseEntity<String> ingestData(@RequestBody MarketDataDto marketData) {
        // TODO: implement
        return ResponseEntity.ok("Data ingested successfully");
    }
    
    @GetMapping("/data/{symbol}")
    public ResponseEntity<List<MarketDataDto>> getIngestedData(@PathVariable String symbol) {
        // TODO: implement
        return ResponseEntity.ok(List.of());
    }
}
