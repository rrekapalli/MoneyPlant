package com.moneyplant.trading.scanner.api;

import com.moneyplant.trading.scanner.service.ScannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scanner")
@RequiredArgsConstructor
@Slf4j
public class ScannerController {

    private final ScannerService scannerService;

    @PostMapping("/run")
    public ResponseEntity<String> runScanner(@RequestParam String pattern) {
        log.info("Running scanner for pattern: {}", pattern);
        // TODO: implement
        return ResponseEntity.ok("Scanner completed for " + pattern);
    }

    @GetMapping("/patterns")
    public ResponseEntity<String> getAvailablePatterns() {
        log.info("Getting available patterns");
        // TODO: implement
        return ResponseEntity.ok("Available patterns retrieved");
    }

    @PostMapping("/detect")
    public ResponseEntity<String> detectPattern(@RequestParam String symbol, @RequestParam String pattern) {
        log.info("Detecting pattern {} for symbol: {}", pattern, symbol);
        // TODO: implement
        return ResponseEntity.ok("Pattern detection completed");
    }

    @GetMapping("/signals")
    public ResponseEntity<String> getTradingSignals(@RequestParam String symbol) {
        log.info("Getting trading signals for symbol: {}", symbol);
        // TODO: implement
        return ResponseEntity.ok("Trading signals retrieved");
    }
}
