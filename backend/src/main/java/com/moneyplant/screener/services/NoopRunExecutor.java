package com.moneyplant.screener.services;

import com.moneyplant.screener.entities.ScreenerResult;
import com.moneyplant.screener.entities.ScreenerRun;
import com.moneyplant.screener.repositories.ScreenerResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * No-op implementation of RunExecutor for testing and development.
 * Creates dummy screener results for immediate frontend development.
 */
@Service("noopRunExecutor")
@RequiredArgsConstructor
@Slf4j
public class NoopRunExecutor implements RunExecutor {

    private final ScreenerResultRepository screenerResultRepository;
    private final Random random = new Random();

    @Override
    public ScreenerRun executeRun(ScreenerRun run) {
        log.info("Executing run with NoopRunExecutor for run: {}", run.getScreenerRunId());
        
        try {
            // Simulate execution time
            Thread.sleep(1000 + random.nextInt(2000));
            
            // Generate dummy results
            List<ScreenerResult> results = generateDummyResults(run);
            
            // Save results
            screenerResultRepository.saveAll(results);
            
            // Update run status and totals
            run.setStatus("success");
            run.setFinishedAt(OffsetDateTime.now());
            run.setTotalCandidates(results.size());
            run.setTotalMatches((int) results.stream().filter(ScreenerResult::getMatched).count());
            
            log.info("Completed run {} with {} candidates, {} matches", 
                    run.getScreenerRunId(), run.getTotalCandidates(), run.getTotalMatches());
            
        } catch (Exception e) {
            log.error("Error executing run {}: {}", run.getScreenerRunId(), e.getMessage(), e);
            run.setStatus("failed");
            run.setFinishedAt(OffsetDateTime.now());
            run.setErrorMessage(e.getMessage());
        }
        
        return run;
    }

    @Override
    public String getExecutorType() {
        return "noop";
    }

    /**
     * Generates dummy screener results for testing.
     */
    private List<ScreenerResult> generateDummyResults(ScreenerRun run) {
        List<ScreenerResult> results = new ArrayList<>();
        
        // Get universe symbols from run
        List<String> symbols = getUniverseSymbols(run);
        
        for (int i = 0; i < symbols.size(); i++) {
            String symbol = symbols.get(i);
            boolean matched = random.nextDouble() < 0.3; // 30% match rate
            BigDecimal score = matched ? BigDecimal.valueOf(random.nextDouble()) : null;
            Integer rank = matched ? i + 1 : null;
            
            ScreenerResult result = ScreenerResult.builder()
                    .screenerRun(run)
                    .symbol(symbol)
                    .matched(matched)
                    .score0To1(score)
                    .rankInRun(rank)
                    .metricsJson(createDummyMetrics(symbol))
                    .reasonJson(createDummyReason(symbol, matched))
                    .build();
            
            results.add(result);
        }
        
        return results;
    }

    /**
     * Gets universe symbols from run.
     */
    @SuppressWarnings("unchecked")
    private List<String> getUniverseSymbols(ScreenerRun run) {
        if (run.getUniverseSnapshot() instanceof List) {
            return (List<String>) run.getUniverseSnapshot();
        }
        
        // Default symbols for testing
        return List.of("RELIANCE", "TCS", "HDFC", "INFY", "HINDUNILVR", "ICICIBANK", 
                      "KOTAKBANK", "BHARTIARTL", "ITC", "SBIN");
    }

    /**
     * Creates dummy metrics for a symbol.
     */
    private Map<String, Object> createDummyMetrics(String symbol) {
        return Map.of(
                "pe_ratio", BigDecimal.valueOf(10 + random.nextDouble() * 30),
                "rsi_14", BigDecimal.valueOf(20 + random.nextDouble() * 60),
                "sma_50", BigDecimal.valueOf(100 + random.nextDouble() * 200),
                "sma_200", BigDecimal.valueOf(80 + random.nextDouble() * 180),
                "volume", random.nextInt(1000000) + 100000
        );
    }

    /**
     * Creates dummy reason for match/no-match.
     */
    private Map<String, Object> createDummyReason(String symbol, boolean matched) {
        if (matched) {
            return Map.of(
                    "reason", "Met all criteria",
                    "pe_ok", random.nextBoolean(),
                    "rsi_ok", random.nextBoolean(),
                    "trend_ok", random.nextBoolean()
            );
        } else {
            return Map.of(
                    "reason", "Failed criteria",
                    "pe_ok", false,
                    "rsi_ok", random.nextBoolean(),
                    "trend_ok", random.nextBoolean()
            );
        }
    }
}
