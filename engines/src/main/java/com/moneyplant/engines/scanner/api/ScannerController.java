package com.moneyplant.engines.scanner.api;

import com.moneyplant.engines.common.dto.TradingSignalDto;
import com.moneyplant.engines.scanner.service.ScannerService;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for pattern scanning operations
 */
@RestController
@RequestMapping("/api/scanner")
public class ScannerController {
    
    
    
    private final ScannerService scannerService;
    
    public ScannerController(ScannerService scannerService) {
        this.scannerService = scannerService;
    }
    
    @PostMapping("/run")
    public ResponseEntity<List<TradingSignalDto>> runScanner(@RequestParam String symbol) {
        // TODO: implement
        return ResponseEntity.ok(List.of());
    }
    
    @PostMapping("/run-all")
    public ResponseEntity<List<TradingSignalDto>> runScannerForAllSymbols() {
        // TODO: implement
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/patterns/{symbol}")
    public ResponseEntity<List<String>> getDetectedPatterns(@PathVariable String symbol) {
        // TODO: implement
        return ResponseEntity.ok(List.of("DOJI", "HAMMER"));
    }
    
    @PostMapping("/rules")
    public ResponseEntity<String> addScannerRule(@RequestBody String rule) {
        // TODO: implement
        return ResponseEntity.ok("Rule added successfully");
    }
    
    @GetMapping("/rules")
    public ResponseEntity<List<String>> getScannerRules() {
        // TODO: implement
        return ResponseEntity.ok(List.of("RSI_OVERSOLD", "MACD_CROSSOVER"));
    }
    
    @DeleteMapping("/rules/{ruleId}")
    public ResponseEntity<String> deleteScannerRule(@PathVariable String ruleId) {
        // TODO: implement
        return ResponseEntity.ok("Rule deleted successfully");
    }
}
