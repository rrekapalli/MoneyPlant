package com.moneyplant.trading.strategy.api;

import com.moneyplant.trading.strategy.service.StrategyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/strategy")
@RequiredArgsConstructor
@Slf4j
public class StrategyController {

    private final StrategyService strategyService;

    @PostMapping("/execute")
    public ResponseEntity<String> executeStrategy(@RequestParam String strategy, @RequestParam String symbol) {
        log.info("Executing strategy {} for symbol: {}", strategy, symbol);
        // TODO: implement
        return ResponseEntity.ok("Strategy executed for " + symbol);
    }

    @GetMapping("/list")
    public ResponseEntity<String> getAvailableStrategies() {
        log.info("Getting available strategies");
        // TODO: implement
        return ResponseEntity.ok("Available strategies retrieved");
    }

    @PostMapping("/backtest")
    public ResponseEntity<String> backtestStrategy(@RequestParam String strategy, @RequestParam String symbol) {
        log.info("Backtesting strategy {} for symbol: {}", strategy, symbol);
        // TODO: implement
        return ResponseEntity.ok("Backtest completed for " + symbol);
    }

    @GetMapping("/performance")
    public ResponseEntity<String> getStrategyPerformance(@RequestParam String strategy) {
        log.info("Getting performance for strategy: {}", strategy);
        // TODO: implement
        return ResponseEntity.ok("Strategy performance retrieved");
    }
}
