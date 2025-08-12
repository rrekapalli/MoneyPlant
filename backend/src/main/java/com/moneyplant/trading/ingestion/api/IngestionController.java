package com.moneyplant.trading.ingestion.api;

import com.moneyplant.trading.ingestion.service.IngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ingestion")
@RequiredArgsConstructor
@Slf4j
public class IngestionController {

    private final IngestionService ingestionService;

    @PostMapping("/start")
    public ResponseEntity<String> startIngestion(@RequestParam String symbol) {
        log.info("Starting ingestion for symbol: {}", symbol);
        // TODO: implement
        return ResponseEntity.ok("Ingestion started for " + symbol);
    }

    @PostMapping("/stop")
    public ResponseEntity<String> stopIngestion(@RequestParam String symbol) {
        log.info("Stopping ingestion for symbol: {}", symbol);
        // TODO: implement
        return ResponseEntity.ok("Ingestion stopped for " + symbol);
    }

    @GetMapping("/status")
    public ResponseEntity<String> getIngestionStatus(@RequestParam String symbol) {
        log.info("Getting ingestion status for symbol: {}", symbol);
        // TODO: implement
        return ResponseEntity.ok("Ingestion status for " + symbol);
    }

    @PostMapping("/market-data")
    public ResponseEntity<String> ingestMarketData(@RequestBody String marketData) {
        log.info("Ingesting market data: {}", marketData);
        // TODO: implement
        return ResponseEntity.ok("Market data ingested successfully");
    }
}
