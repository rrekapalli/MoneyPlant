package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.SavedViewCreateReq;
import com.moneyplant.screener.dtos.SavedViewResp;
import com.moneyplant.screener.services.ScreenerSavedViewService;
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
import java.util.Map;

/**
 * REST controller for screener saved view management.
 */
@RestController
@RequestMapping("/api/screeners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screener Saved Views", description = "Screener saved view management operations")
public class ScreenerSavedViewController {

    private final ScreenerSavedViewService screenerSavedViewService;

    /**
     * Creates a new saved view.
     */
    @PostMapping("/{id}/saved-views")
    @Operation(summary = "Create saved view", description = "Creates a new saved view for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Saved view created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "409", description = "Saved view name already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<SavedViewResp> createSavedView(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Valid @RequestBody SavedViewCreateReq request) {
        log.info("Creating saved view for screener: {}", id);
        SavedViewResp response = screenerSavedViewService.createSavedView(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lists saved views for a screener.
     */
    @GetMapping("/{id}/saved-views")
    @Operation(summary = "List saved views", description = "Lists saved views for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Saved views retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<SavedViewResp>> listSavedViews(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Listing saved views for screener: {}", id);
        List<SavedViewResp> response = screenerSavedViewService.listSavedViews(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets a saved view by ID.
     */
    @GetMapping("/saved-views/{savedViewId}")
    @Operation(summary = "Get saved view", description = "Gets a saved view by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Saved view retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Saved view not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<SavedViewResp> getSavedView(
            @Parameter(description = "Saved view ID") @PathVariable Long savedViewId) {
        log.info("Getting saved view: {}", savedViewId);
        SavedViewResp response = screenerSavedViewService.getSavedView(savedViewId);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates a saved view.
     */
    @PatchMapping("/saved-views/{savedViewId}")
    @Operation(summary = "Update saved view", description = "Updates a saved view")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Saved view updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "404", description = "Saved view not found"),
            @ApiResponse(responseCode = "409", description = "Saved view name already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<SavedViewResp> updateSavedView(
            @Parameter(description = "Saved view ID") @PathVariable Long savedViewId,
            @Valid @RequestBody SavedViewCreateReq request) {
        log.info("Updating saved view: {}", savedViewId);
        SavedViewResp response = screenerSavedViewService.updateSavedView(savedViewId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a saved view.
     */
    @DeleteMapping("/saved-views/{savedViewId}")
    @Operation(summary = "Delete saved view", description = "Deletes a saved view")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Saved view deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Saved view not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteSavedView(
            @Parameter(description = "Saved view ID") @PathVariable Long savedViewId) {
        log.info("Deleting saved view: {}", savedViewId);
        screenerSavedViewService.deleteSavedView(savedViewId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lists all saved views for current user.
     */
    @GetMapping("/my/saved-views")
    @Operation(summary = "Get my saved views", description = "Gets all saved views for current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Saved views retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<SavedViewResp>> listMySavedViews() {
        log.info("Listing my saved views");
        List<SavedViewResp> response = screenerSavedViewService.listMySavedViews();
        return ResponseEntity.ok(response);
    }

    /**
     * Gets saved view count for current user.
     */
    @GetMapping("/my/saved-view-count")
    @Operation(summary = "Get my saved view count", description = "Gets the number of saved views for current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getMySavedViewCount() {
        log.info("Getting my saved view count");
        long count = screenerSavedViewService.getMySavedViewCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Gets saved view count for a screener.
     */
    @GetMapping("/{id}/saved-view-count")
    @Operation(summary = "Get screener saved view count", description = "Gets the number of saved views for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getSavedViewCount(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Getting saved view count for screener: {}", id);
        long count = screenerSavedViewService.getSavedViewCount(id);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
