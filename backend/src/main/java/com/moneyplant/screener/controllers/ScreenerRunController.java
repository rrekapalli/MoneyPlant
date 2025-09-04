package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.PageResp;
import com.moneyplant.screener.dtos.RunCreateReq;
import com.moneyplant.screener.dtos.RunResp;
import com.moneyplant.screener.services.ScreenerRunService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for screener run management.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screener Runs", description = "Screener run management operations")
public class ScreenerRunController {

    private final ScreenerRunService screenerRunService;

    /**
     * Creates a new screener run.
     */
    @PostMapping("/screeners/{id}/runs")
    @Operation(summary = "Create screener run", description = "Creates and executes a new screener run")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Screener run created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<RunResp> createRun(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Valid @RequestBody RunCreateReq request) {
        log.info("Creating run for screener: {}", id);
        RunResp response = screenerRunService.createRun(id, request);
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
}
