package com.moneyplant.trading.backtest.api;

import com.moneyplant.trading.backtest.service.BacktestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backtest")
@RequiredArgsConstructor
@Slf4j
public class BacktestController {

    private final BacktestService backtestService;

    @PostMapping("/run")
    public ResponseEntity<String> runBacktest(@RequestParam String strategy, @RequestParam String symbol) {
        log.info("Running backtest for strategy {} on symbol: {}", strategy, symbol);
        // TODO: implement
        return ResponseEntity.ok("Backtest completed for " + symbol);
    }

    @GetMapping("/results")
    public ResponseEntity<String> getBacktestResults(@RequestParam String backtestId) {
        log.info("Getting backtest results for ID: {}", backtestId);
        // TODO: implement
        return ResponseEntity.ok("Backtest results retrieved successfully");
    }

    @GetMapping("/metrics")
    public ResponseEntity<String> getBacktestMetrics(@RequestParam String backtestId) {
        log.info("Getting backtest metrics for ID: {}", backtestId);
        // TODO: implement
        return ResponseEntity.ok("Backtest metrics retrieved successfully");
    }

    @PostMapping("/historical-replay")
    public ResponseEntity<String> startHistoricalReplay(@RequestParam String symbol, @RequestParam String startDate, @RequestParam String endDate) {
        log.info("Starting historical replay for symbol: {} from {} to {}", symbol, startDate, endDate);
        // TODO: implement
        return ResponseEntity.ok("Historical replay started successfully");
    }
}
