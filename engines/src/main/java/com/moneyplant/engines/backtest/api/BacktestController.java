package com.moneyplant.engines.backtest.api;

import com.moneyplant.engines.common.dto.BacktestResultDto;
import com.moneyplant.engines.backtest.service.BacktestService;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for backtesting operations
 */
@RestController
@RequestMapping("/api/backtest")
public class BacktestController {
    
    
    
    private final BacktestService backtestService;
    
    public BacktestController(BacktestService backtestService) {
        this.backtestService = backtestService;
    }
    
    @PostMapping("/run")
    public ResponseEntity<BacktestResultDto> runBacktest(@RequestParam String strategyName, @RequestParam String symbol, @RequestParam String startDate, @RequestParam String endDate) {
        // TODO: implement
        return ResponseEntity.ok(BacktestResultDto.builder().build());
    }
    
    @PostMapping("/run-with-parameters")
    public ResponseEntity<BacktestResultDto> runBacktestWithParameters(@RequestBody String backtestConfig) {
        // TODO: implement
        return ResponseEntity.ok(BacktestResultDto.builder().build());
    }
    
    @GetMapping("/results/{backtestId}")
    public ResponseEntity<BacktestResultDto> getBacktestResult(@PathVariable String backtestId) {
        // TODO: implement
        return ResponseEntity.ok(BacktestResultDto.builder().build());
    }
    
    @GetMapping("/results")
    public ResponseEntity<List<BacktestResultDto>> getAllBacktestResults() {
        // TODO: implement
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/results/strategy/{strategyName}")
    public ResponseEntity<List<BacktestResultDto>> getBacktestResultsByStrategy(@PathVariable String strategyName) {
        // TODO: implement
        return ResponseEntity.ok(List.of());
    }
    
    @DeleteMapping("/results/{backtestId}")
    public ResponseEntity<String> deleteBacktestResult(@PathVariable String backtestId) {
        // TODO: implement
        return ResponseEntity.ok("Backtest result deleted successfully");
    }
    
    @PostMapping("/compare")
    public ResponseEntity<Map<String, Object>> compareBacktests(@RequestBody List<String> backtestIds) {
        // TODO: implement
        return ResponseEntity.ok(Map.of("comparison", "comparison data"));
    }
}
