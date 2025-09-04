package com.moneyplant.engines.screener.api;

import com.moneyplant.engines.common.dto.TradingSignalDto;
import com.moneyplant.engines.screener.service.ScreenerService;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for pattern screening operations
 */
@RestController
@RequestMapping("/api/screener")
public class ScreenerController {
    
    
    
    private final ScreenerService screenerService;
    
    public ScreenerController(ScreenerService screenerService) {
        this.screenerService = screenerService;
    }
    
    @PostMapping("/run")
    public ResponseEntity<List<TradingSignalDto>> runScreener(@RequestParam String symbol) {
        // TODO: implement
        return ResponseEntity.ok(List.of());
    }
    
    @PostMapping("/run-all")
    public ResponseEntity<List<TradingSignalDto>> runScreenerForAllSymbols() {
        // TODO: implement
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/patterns/{symbol}")
    public ResponseEntity<List<String>> getDetectedPatterns(@PathVariable String symbol) {
        // TODO: implement
        return ResponseEntity.ok(List.of("DOJI", "HAMMER"));
    }
    
    @PostMapping("/rules")
    public ResponseEntity<String> addScreenerRule(@RequestBody String rule) {
        // TODO: implement
        return ResponseEntity.ok("Rule added successfully");
    }
    
    @GetMapping("/rules")
    public ResponseEntity<List<String>> getScreenerRules() {
        // TODO: implement
        return ResponseEntity.ok(List.of("RSI_OVERSOLD", "MACD_CROSSOVER"));
    }
    
    @DeleteMapping("/rules/{ruleId}")
    public ResponseEntity<String> deleteScreenerRule(@PathVariable String ruleId) {
        // TODO: implement
        return ResponseEntity.ok("Rule deleted successfully");
    }
}
