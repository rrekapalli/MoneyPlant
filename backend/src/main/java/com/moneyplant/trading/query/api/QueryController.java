package com.moneyplant.trading.query.api;

import com.moneyplant.trading.query.service.QueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/query")
@RequiredArgsConstructor
@Slf4j
public class QueryController {

    private final QueryService queryService;

    @PostMapping("/run")
    public ResponseEntity<String> runQuery(@RequestBody String query) {
        log.info("Running query: {}", query);
        // TODO: implement
        return ResponseEntity.ok("Query executed successfully");
    }

    @GetMapping("/analytics")
    public ResponseEntity<String> getAnalytics(@RequestParam String symbol) {
        log.info("Getting analytics for symbol: {}", symbol);
        // TODO: implement
        return ResponseEntity.ok("Analytics retrieved successfully");
    }

    @GetMapping("/backtesting")
    public ResponseEntity<String> getBacktestingData(@RequestParam String strategy) {
        log.info("Getting backtesting data for strategy: {}", strategy);
        // TODO: implement
        return ResponseEntity.ok("Backtesting data retrieved successfully");
    }

    @GetMapping("/reporting")
    public ResponseEntity<String> getReport(@RequestParam String reportType) {
        log.info("Getting report: {}", reportType);
        // TODO: implement
        return ResponseEntity.ok("Report generated successfully");
    }
}
