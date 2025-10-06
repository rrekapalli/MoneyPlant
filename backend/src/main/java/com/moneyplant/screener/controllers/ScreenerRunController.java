package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.PageResp;
import com.moneyplant.screener.dtos.RunCreateReq;
import com.moneyplant.screener.dtos.RunResp;
import com.moneyplant.screener.services.CurrentUserService;
import com.moneyplant.screener.services.ScreenerRunService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for screener run management.
 * Integrates with existing screener security infrastructure including JWT authentication,
 * rate limiting, and audit logging.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screener Runs", description = "Screener run management operations")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Screener Runs", description = "Screener run management operations")
public class ScreenerRunController {

    private final ScreenerRunService screenerRunService;
    private final CurrentUserService currentUserService;

    /**
     * Creates a new screener run with criteria DSL support.
     */
    @PostMapping("/screeners/{id}/runs")
    @Operation(summary = "Create screener run with criteria", description = "Creates and executes a new screener run with criteria DSL re-validation and enhanced monitoring")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Screener run created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data or criteria validation failed"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<RunResp> createRun(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Valid @RequestBody RunCreateReq request) {
        log.info("Creating run for screener: {}", id);
        
        // Use enhanced criteria validation and monitoring
        RunResp response = screenerRunService.executeRunWithCriteriaMonitoring(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lists runs for a screener.
     */
    @GetMapping("/screeners/{id}/runs")
    @Operation(summary = "List screener runs", description = "Lists runs for a screener with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Runs retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PageResp<RunResp>> listRuns(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size) {
        log.info("Listing runs for screener: {}, page: {}, size: {}", id, page, size);
        PageResp<RunResp> response = screenerRunService.listRuns(id, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets a run by ID.
     */
    @GetMapping("/runs/{runId}")
    @Operation(summary = "Get screener run", description = "Gets a screener run by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Run retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<RunResp> getRun(
            @Parameter(description = "Run ID") @PathVariable Long runId) {
        log.info("Getting run: {}", runId);
        RunResp response = screenerRunService.getRun(runId);
        return ResponseEntity.ok(response);
    }

    /**
     * Retries a failed run.
     */
    @PostMapping("/runs/{runId}/retry")
    @Operation(summary = "Retry screener run", description = "Retries a failed screener run")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Run retried successfully"),
            @ApiResponse(responseCode = "400", description = "Run cannot be retried"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Run not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<RunResp> retryRun(
            @Parameter(description = "Run ID") @PathVariable Long runId) {
        log.info("Retrying run: {}", runId);
        RunResp response = screenerRunService.retryRun(runId);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets the latest successful run for a screener.
     */
    @GetMapping("/screeners/{id}/last-run")
    @Operation(summary = "Get last successful run", description = "Gets the latest successful run for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Last run retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "No successful run found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<RunResp> getLatestSuccessfulRun(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Getting latest successful run for screener: {}", id);
        Optional<RunResp> response = screenerRunService.getLatestSuccessfulRun(id);
        return response.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Gets runs by status.
     */
    @GetMapping("/runs/status/{status}")
    @Operation(summary = "Get runs by status", description = "Gets runs filtered by status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Runs retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<RunResp>> getRunsByStatus(
            @Parameter(description = "Run status") @PathVariable String status) {
        log.info("Getting runs by status: {}", status);
        List<RunResp> response = screenerRunService.getRunsByStatus(status);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets runs by user.
     */
    @GetMapping("/runs/user/{userId}")
    @Operation(summary = "Get runs by user", description = "Gets runs triggered by a specific user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Runs retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<RunResp>> getRunsByUser(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        log.info("Getting runs by user: {}", userId);
        List<RunResp> response = screenerRunService.getRunsByUser(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets criteria-based runs for a screener with enhanced monitoring.
     */
    @GetMapping("/screeners/{id}/criteria-runs")
    @Operation(summary = "Get criteria runs", description = "Gets criteria-based runs for a screener with performance monitoring")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Criteria runs retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<RunResp>> getCriteriaRuns(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Parameter(description = "Maximum number of runs to return") @RequestParam(defaultValue = "50") int limit) {
        log.info("Getting criteria runs for screener: {}, limit: {}", id, limit);
        List<RunResp> response = screenerRunService.getCriteriaRuns(id, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets performance metrics for criteria-based runs.
     */
    @GetMapping("/screeners/{id}/criteria-metrics")
    @Operation(summary = "Get criteria performance metrics", description = "Gets performance metrics for criteria-based runs with execution statistics")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Criteria metrics retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getCriteriaPerformanceMetrics(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Getting criteria performance metrics for screener: {}", id);
        Map<String, Object> response = screenerRunService.getCriteriaPerformanceMetrics(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Creates a run with enhanced criteria validation and detailed error reporting.
     */
    @PostMapping("/screeners/{id}/runs/validate")
    @Operation(summary = "Create run with validation", description = "Creates a screener run with enhanced criteria validation and detailed error reporting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Screener run created successfully"),
            @ApiResponse(responseCode = "400", description = "Criteria validation failed with detailed errors"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<RunResp> createRunWithValidation(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Valid @RequestBody RunCreateReq request) {
        log.info("Creating run with enhanced validation for screener: {}", id);
        RunResp response = screenerRunService.createRunWithCriteriaValidation(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
