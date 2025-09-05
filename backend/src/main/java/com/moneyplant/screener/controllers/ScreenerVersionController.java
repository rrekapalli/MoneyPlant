package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.ScreenerVersionCreateReq;
import com.moneyplant.screener.dtos.ScreenerVersionResp;
import com.moneyplant.screener.services.ScreenerVersionService;
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
 * REST controller for screener version management.
 */
@RestController
@RequestMapping("/api/screeners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screener Versions", description = "Screener version management operations")
public class ScreenerVersionController {

    private final ScreenerVersionService screenerVersionService;

    /**
     * Creates a new screener version.
     */
    @PostMapping("/{id}/versions")
    @Operation(summary = "Create screener version", description = "Creates a new version for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Screener version created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "409", description = "Version number already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerVersionResp> createVersion(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Valid @RequestBody ScreenerVersionCreateReq request) {
        log.info("Creating version for screener: {}", id);
        ScreenerVersionResp response = screenerVersionService.createVersion(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lists versions for a screener.
     */
    @GetMapping("/{id}/versions")
    @Operation(summary = "List screener versions", description = "Lists all versions for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Versions retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ScreenerVersionResp>> listVersions(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Listing versions for screener: {}", id);
        List<ScreenerVersionResp> response = screenerVersionService.listVersions(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets a screener version by ID.
     */
    @GetMapping("/versions/{versionId}")
    @Operation(summary = "Get screener version", description = "Gets a screener version by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Version retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Version not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerVersionResp> getVersion(
            @Parameter(description = "Version ID") @PathVariable Long versionId) {
        log.info("Getting screener version: {}", versionId);
        ScreenerVersionResp response = screenerVersionService.getVersion(versionId);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates a screener version.
     */
    @PatchMapping("/versions/{versionId}")
    @Operation(summary = "Update screener version", description = "Updates a screener version (owner only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Version updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Version not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerVersionResp> updateVersion(
            @Parameter(description = "Version ID") @PathVariable Long versionId,
            @Valid @RequestBody ScreenerVersionCreateReq request) {
        log.info("Updating screener version: {}", versionId);
        ScreenerVersionResp response = screenerVersionService.updateVersion(versionId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Archives a screener version.
     */
    @PostMapping("/versions/{versionId}/archive")
    @Operation(summary = "Archive screener version", description = "Archives a screener version")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Version archived successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Version not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> archiveVersion(
            @Parameter(description = "Version ID") @PathVariable Long versionId) {
        log.info("Archiving screener version: {}", versionId);
        screenerVersionService.archiveVersion(versionId);
        return ResponseEntity.ok().build();
    }

    /**
     * Activates a screener version.
     */
    @PostMapping("/versions/{versionId}/activate")
    @Operation(summary = "Activate screener version", description = "Activates a screener version")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Version activated successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Version not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> activateVersion(
            @Parameter(description = "Version ID") @PathVariable Long versionId) {
        log.info("Activating screener version: {}", versionId);
        screenerVersionService.activateVersion(versionId);
        return ResponseEntity.ok().build();
    }
}
