package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.PageResp;
import com.moneyplant.screener.dtos.ResultDiffResp;
import com.moneyplant.screener.dtos.ResultResp;
import com.moneyplant.screener.services.ScreenerResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST controller for screener result management.
 */
@RestController
@RequestMapping("/api/runs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screener Results", description = "Screener result management operations")
public class ScreenerResultController {

    private final ScreenerResultService screenerResultService;

    /**
     * Gets paged results for a run.
     */
    @GetMapping("/{runId}/results")
    @Operation(summary = "Get screener results", description = "Gets paged results for a screener run with filters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Results retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PageResp<ResultResp>> getResults(
            @Parameter(description = "Run ID") @PathVariable Long runId,
            @Parameter(description = "Filter by matched status") @RequestParam(required = false) Boolean matched,
            @Parameter(description = "Minimum score filter") @RequestParam(required = false) BigDecimal minScore,
            @Parameter(description = "Symbol ID filter") @RequestParam(required = false) String symbolId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort criteria (rank,score)") @RequestParam(defaultValue = "rank") String sort) {
        log.info("Getting results for run: {}, matched: {}, minScore: {}, symbolId: {}", 
                runId, matched, minScore, symbolId);
        PageResp<ResultResp> response = screenerResultService.getResults(runId, matched, minScore, symbolId, page, size, sort);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets all results for a run.
     */
    @GetMapping("/{runId}/results/all")
    @Operation(summary = "Get all screener results", description = "Gets all results for a screener run")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Results retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ResultResp>> getAllResults(
            @Parameter(description = "Run ID") @PathVariable Long runId) {
        log.info("Getting all results for run: {}", runId);
        List<ResultResp> response = screenerResultService.getAllResults(runId);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets matched results for a run.
     */
    @GetMapping("/{runId}/results/matched")
    @Operation(summary = "Get matched screener results", description = "Gets only matched results for a screener run")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Results retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ResultResp>> getMatchedResults(
            @Parameter(description = "Run ID") @PathVariable Long runId) {
        log.info("Getting matched results for run: {}", runId);
        List<ResultResp> response = screenerResultService.getMatchedResults(runId);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets result diffs for a run.
     */
    @GetMapping("/{runId}/diffs")
    @Operation(summary = "Get result diffs", description = "Gets result differences for a screener run")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Diffs retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ResultDiffResp>> getResultDiffs(
            @Parameter(description = "Run ID") @PathVariable Long runId) {
        log.info("Getting result diffs for run: {}", runId);
        List<ResultDiffResp> response = screenerResultService.getResultDiffs(runId);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets result diffs by change type.
     */
    @GetMapping("/{runId}/diffs/{changeType}")
    @Operation(summary = "Get result diffs by change type", description = "Gets result differences filtered by change type")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Diffs retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ResultDiffResp>> getResultDiffsByChangeType(
            @Parameter(description = "Run ID") @PathVariable Long runId,
            @Parameter(description = "Change type") @PathVariable String changeType) {
        log.info("Getting result diffs for run: {} with change type: {}", runId, changeType);
        List<ResultDiffResp> response = screenerResultService.getResultDiffsByChangeType(runId, changeType);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets top results for a run.
     */
    @GetMapping("/{runId}/results/top")
    @Operation(summary = "Get top results", description = "Gets top results for a screener run")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Results retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ResultResp>> getTopResults(
            @Parameter(description = "Run ID") @PathVariable Long runId,
            @Parameter(description = "Number of top results") @RequestParam(defaultValue = "50") int limit) {
        log.info("Getting top {} results for run: {}", limit, runId);
        List<ResultResp> response = screenerResultService.getTopResults(runId, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets results by minimum score.
     */
    @GetMapping("/{runId}/results/score")
    @Operation(summary = "Get results by minimum score", description = "Gets results above a minimum score threshold")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Results retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ResultResp>> getResultsByMinScore(
            @Parameter(description = "Run ID") @PathVariable Long runId,
            @Parameter(description = "Minimum score") @RequestParam BigDecimal minScore) {
        log.info("Getting results for run: {} with min score: {}", runId, minScore);
        List<ResultResp> response = screenerResultService.getResultsByMinScore(runId, minScore);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets result statistics for a run.
     */
    @GetMapping("/{runId}/stats")
    @Operation(summary = "Get result statistics", description = "Gets result statistics for a screener run")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerResultService.ResultStats> getResultStats(
            @Parameter(description = "Run ID") @PathVariable Long runId) {
        log.info("Getting result stats for run: {}", runId);
        ScreenerResultService.ResultStats response = screenerResultService.getResultStats(runId);
        return ResponseEntity.ok(response);
    }
}
