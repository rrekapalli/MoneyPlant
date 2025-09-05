package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.ParamsetCreateReq;
import com.moneyplant.screener.dtos.ParamsetResp;
import com.moneyplant.screener.services.ScreenerParamsetService;
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
 * REST controller for screener parameter set management.
 */
@RestController
@RequestMapping("/api/versions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screener Parameter Sets", description = "Screener parameter set management operations")
public class ScreenerParamsetController {

    private final ScreenerParamsetService screenerParamsetService;

    /**
     * Creates a new parameter set.
     */
    @PostMapping("/{versionId}/paramsets")
    @Operation(summary = "Create parameter set", description = "Creates a new parameter set for a screener version")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Parameter set created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener version not found"),
            @ApiResponse(responseCode = "409", description = "Parameter set name already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ParamsetResp> createParamset(
            @Parameter(description = "Version ID") @PathVariable Long versionId,
            @Valid @RequestBody ParamsetCreateReq request) {
        log.info("Creating paramset for version: {}", versionId);
        ParamsetResp response = screenerParamsetService.createParamset(versionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lists parameter sets for a version.
     */
    @GetMapping("/{versionId}/paramsets")
    @Operation(summary = "List parameter sets", description = "Lists all parameter sets for a screener version")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Parameter sets retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener version not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ParamsetResp>> listParamsets(
            @Parameter(description = "Version ID") @PathVariable Long versionId) {
        log.info("Listing paramsets for version: {}", versionId);
        List<ParamsetResp> response = screenerParamsetService.listParamsets(versionId);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets a parameter set by ID.
     */
    @GetMapping("/paramsets/{paramsetId}")
    @Operation(summary = "Get parameter set", description = "Gets a parameter set by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Parameter set retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Parameter set not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ParamsetResp> getParamset(
            @Parameter(description = "Parameter set ID") @PathVariable Long paramsetId) {
        log.info("Getting paramset: {}", paramsetId);
        ParamsetResp response = screenerParamsetService.getParamset(paramsetId);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates a parameter set.
     */
    @PatchMapping("/paramsets/{paramsetId}")
    @Operation(summary = "Update parameter set", description = "Updates a parameter set (owner only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Parameter set updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Parameter set not found"),
            @ApiResponse(responseCode = "409", description = "Parameter set name already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ParamsetResp> updateParamset(
            @Parameter(description = "Parameter set ID") @PathVariable Long paramsetId,
            @Valid @RequestBody ParamsetCreateReq request) {
        log.info("Updating paramset: {}", paramsetId);
        ParamsetResp response = screenerParamsetService.updateParamset(paramsetId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a parameter set.
     */
    @DeleteMapping("/paramsets/{paramsetId}")
    @Operation(summary = "Delete parameter set", description = "Deletes a parameter set (owner only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Parameter set deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Parameter set not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteParamset(
            @Parameter(description = "Parameter set ID") @PathVariable Long paramsetId) {
        log.info("Deleting paramset: {}", paramsetId);
        screenerParamsetService.deleteParamset(paramsetId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Gets parameter sets created by current user.
     */
    @GetMapping("/my-paramsets")
    @Operation(summary = "Get my parameter sets", description = "Gets parameter sets created by current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Parameter sets retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ParamsetResp>> getMyParamsets() {
        log.info("Getting my paramsets");
        List<ParamsetResp> response = screenerParamsetService.getMyParamsets();
        return ResponseEntity.ok(response);
    }
}
