package com.moneyplant.screener.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.screener.dtos.*;
import com.moneyplant.screener.exceptions.CriteriaValidationException;
import com.moneyplant.screener.services.CriteriaSqlService;
import com.moneyplant.screener.services.CriteriaValidationService;
import com.moneyplant.screener.services.CurrentUserService;
import com.moneyplant.screener.services.ScreenerVersionService;
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

/**
 * REST controller for screener version management.
 * Integrates with existing screener security infrastructure including JWT authentication,
 * rate limiting, and audit logging.
 */
@RestController
@RequestMapping("/api/screeners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Screener Versions", description = "Screener version management operations")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Screener Versions", description = "Screener version management operations")
public class ScreenerVersionController {

    private final ScreenerVersionService screenerVersionService;
    private final CriteriaValidationService criteriaValidationService;
    private final CriteriaSqlService criteriaSqlService;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    /**
     * Creates a new screener version with criteria DSL support.
     */
    @PostMapping("/{id}/versions")
    @Operation(summary = "Create screener version with criteria", description = "Creates a new version for a screener with optional criteria DSL validation and SQL generation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Screener version created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data or criteria validation failed"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Screener not found"),
            @ApiResponse(responseCode = "409", description = "Version number already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerVersionResp> createVersion(
            @Parameter(description = "Screener ID") @PathVariable Long id,
            @Valid @RequestBody ScreenerVersionCreateReq request) {
        log.info("Creating version for screener: {}", id);
        
        Long userId = currentUserService.getCurrentUserId();
        
        // If request contains criteria DSL, validate and generate SQL
        if (request.getDslJson() != null) {
            try {
                log.info("Processing criteria DSL for screener version creation");
                
                // Convert dslJson to CriteriaDSL object
                CriteriaDSL dsl = objectMapper.convertValue(request.getDslJson(), CriteriaDSL.class);
                
                // Validate the DSL
                ValidationResult validation = criteriaValidationService.validateDSL(dsl, userId);
                if (!validation.isValid()) {
                    log.warn("Criteria DSL validation failed for user {}: {}", userId, validation.getErrors());
                    throw new CriteriaValidationException("Invalid criteria DSL", validation.getErrors());
                }
                
                // Generate SQL from validated DSL
                SqlGenerationResult sqlResult = criteriaSqlService.generateSql(dsl, userId);
                
                // Set the generated SQL and parameters in the request
                request.setCompiledSql(sqlResult.getSql());
                request.setParamsSchemaJson(sqlResult.getParameters());
                
                log.info("Successfully validated criteria DSL and generated SQL for user {}", userId);
                
            } catch (CriteriaValidationException e) {
                // Re-throw criteria validation exceptions as-is
                throw e;
            } catch (Exception e) {
                log.error("Error processing criteria DSL for user {}: {}", userId, e.getMessage(), e);
                throw new CriteriaValidationException("Failed to process criteria DSL: " + e.getMessage());
            }
        }
        
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
     * Updates a screener version with criteria DSL support.
     */
    @PatchMapping("/versions/{versionId}")
    @Operation(summary = "Update screener version with criteria", description = "Updates a screener version with optional criteria DSL validation and SQL generation (owner only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Version updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data or criteria validation failed"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Version not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ScreenerVersionResp> updateVersion(
            @Parameter(description = "Version ID") @PathVariable Long versionId,
            @Valid @RequestBody ScreenerVersionCreateReq request) {
        log.info("Updating screener version: {}", versionId);
        
        Long userId = currentUserService.getCurrentUserId();
        
        // If request contains criteria DSL, validate and generate SQL
        if (request.getDslJson() != null) {
            try {
                log.info("Processing criteria DSL for screener version update");
                
                // Convert dslJson to CriteriaDSL object
                CriteriaDSL dsl = objectMapper.convertValue(request.getDslJson(), CriteriaDSL.class);
                
                // Validate the DSL
                ValidationResult validation = criteriaValidationService.validateDSL(dsl, userId);
                if (!validation.isValid()) {
                    log.warn("Criteria DSL validation failed for user {}: {}", userId, validation.getErrors());
                    throw new CriteriaValidationException("Invalid criteria DSL", validation.getErrors());
                }
                
                // Generate SQL from validated DSL
                SqlGenerationResult sqlResult = criteriaSqlService.generateSql(dsl, userId);
                
                // Set the generated SQL and parameters in the request
                request.setCompiledSql(sqlResult.getSql());
                request.setParamsSchemaJson(sqlResult.getParameters());
                
                log.info("Successfully validated criteria DSL and generated SQL for user {}", userId);
                
            } catch (CriteriaValidationException e) {
                // Re-throw criteria validation exceptions as-is
                throw e;
            } catch (Exception e) {
                log.error("Error processing criteria DSL for user {}: {}", userId, e.getMessage(), e);
                throw new CriteriaValidationException("Failed to process criteria DSL: " + e.getMessage());
            }
        }
        
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
