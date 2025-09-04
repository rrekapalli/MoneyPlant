package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.StarToggleReq;
import com.moneyplant.screener.services.ScreenerStarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for screener star management.
 */
@RestController
@RequestMapping("/api/screeners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screener Stars", description = "Screener star management operations")
public class ScreenerStarController {

    private final ScreenerStarService screenerStarService;

    /**
     * Toggles star status for a screener.
     */
    @PutMapping("/{id}/star")
    @Operation(summary = "Toggle screener star", description = "Toggles star status for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Star status toggled successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> toggleStar(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Valid @RequestBody StarToggleReq request) {
        log.info("Toggling star for screener: {}, starred: {}", id, request.getStarred());
        boolean starred = screenerStarService.toggleStar(id, request.getStarred());
        return ResponseEntity.ok(Map.of("starred", starred));
    }

    /**
     * Checks if user has starred a screener.
     */
    @GetMapping("/{id}/star")
    @Operation(summary = "Check screener star status", description = "Checks if current user has starred a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Star status retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> isStarred(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Checking star status for screener: {}", id);
        boolean starred = screenerStarService.isStarred(id);
        return ResponseEntity.ok(Map.of("starred", starred));
    }

    /**
     * Gets users who starred a screener (owner only).
     */
    @GetMapping("/{id}/stars")
    @Operation(summary = "Get starred users", description = "Gets users who starred a screener (owner only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Starred users retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<Long>> getStarredUsers(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Getting starred users for screener: {}", id);
        List<Long> response = screenerStarService.getStarredUsers(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets starred screeners for current user.
     */
    @GetMapping("/my/starred")
    @Operation(summary = "Get my starred screeners", description = "Gets screeners starred by current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Starred screeners retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<Object>> getStarredScreeners() {
        log.info("Getting starred screeners for current user");
        List<Object> response = screenerStarService.getStarredScreeners().stream()
                .map(screener -> Map.of(
                        "screenerId", screener.getScreenerId(),
                        "name", screener.getName(),
                        "description", screener.getDescription(),
                        "isPublic", screener.getIsPublic()
                ))
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Gets star count for a screener.
     */
    @GetMapping("/{id}/star-count")
    @Operation(summary = "Get screener star count", description = "Gets the number of stars for a screener")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Star count retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getStarCount(
            @Parameter(description = "Screener ID") @PathVariable Long id) {
        log.info("Getting star count for screener: {}", id);
        long count = screenerStarService.getStarCount(id);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Gets star count for current user.
     */
    @GetMapping("/my/star-count")
    @Operation(summary = "Get my star count", description = "Gets the number of screeners starred by current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Star count retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getMyStarCount() {
        log.info("Getting my star count");
        long count = screenerStarService.getMyStarCount();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
