package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.PageResp;
import com.moneyplant.screener.dtos.ScreenerCreateReq;
import com.moneyplant.screener.dtos.ScreenerResp;
import com.moneyplant.screener.services.ScreenerService;
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

/**
 * REST controller for screener management.
 */
@RestController
@RequestMapping("/api/screeners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screeners", description = "Screener management operations")
public class ScreenerController {

    private final ScreenerService screenerService;

    /**
     * Creates a new screener.
     */
    @PostMapping
    @Operation(summary = "Create screener", description = "Creates a new screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Screener created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerResp> createScreener(@Valid @RequestBody ScreenerCreateReq request) {
        log.info("Creating screener: {}", request.getName());
        ScreenerResp response = screenerService.createScreener(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Gets a screener by ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get screener", description = "Gets a screener by ID (owner or public)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Screener found"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerResp> getScreener(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Getting screener: {}", id);
        ScreenerResp response = screenerService.getScreener(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates a screener.
     */
    @PatchMapping("/{id}")
    @Operation(summary = "Update screener", description = "Updates a screener (owner only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Screener updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerResp> updateScreener(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Valid @RequestBody ScreenerCreateReq request) {
        log.info("Updating screener: {}", id);
        ScreenerResp response = screenerService.updateScreener(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a screener.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete screener", description = "Deletes a screener (owner only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Screener deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteScreener(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Deleting screener: {}", id);
        screenerService.deleteScreener(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lists screeners with search and pagination.
     */
    @GetMapping
    @Operation(summary = "List screeners", description = "Lists screeners (mine + public) with search and pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Screeners retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PageResp<ScreenerResp>> listScreeners(
            @Parameter(description = "Search query") @RequestParam(required = false) String q,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort criteria") @RequestParam(required = false) String sort) {
        log.info("Listing screeners - q: {}, page: {}, size: {}, sort: {}", q, page, size, sort);
        PageResp<ScreenerResp> response = screenerService.listScreeners(q, page, size, sort);
        return ResponseEntity.ok(response);
    }

    /**
     * Lists my screeners.
     */
    @GetMapping("/my")
    @Operation(summary = "List my screeners", description = "Lists screeners owned by current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Screeners retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ScreenerResp>> listMyScreeners() {
        log.info("Listing my screeners");
        List<ScreenerResp> response = screenerService.listMyScreeners();
        return ResponseEntity.ok(response);
    }

    /**
     * Lists public screeners.
     */
    @GetMapping("/public")
    @Operation(summary = "List public screeners", description = "Lists public screeners")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Screeners retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ScreenerResp>> listPublicScreeners() {
        log.info("Listing public screeners");
        List<ScreenerResp> response = screenerService.listPublicScreeners();
        return ResponseEntity.ok(response);
    }


    /**
     * Gets the last results for a screener.
     */
    @GetMapping("/{id}/last-results")
    @Operation(summary = "Get last results", description = "Gets the results of the last run for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Last results retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "No results found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Object> getLastResults(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Getting last results for screener: {}", id);
        // This would be implemented to return last results
        return ResponseEntity.ok().build();
    }
}
