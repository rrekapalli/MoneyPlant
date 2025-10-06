package com.moneyplant.screener.controllers;

import com.moneyplant.screener.dtos.*;
import com.moneyplant.screener.repositories.ScreenerRepository;
import com.moneyplant.screener.services.*;
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
    private final ScreenerRepository screenerRepository;
    
    // Criteria-specific services
    private final FieldMetadataService fieldMetadataService;
    private final FunctionDefinitionService functionDefinitionService;
    private final CriteriaValidationService criteriaValidationService;
    private final CriteriaSqlService criteriaSqlService;
    private final CurrentUserService currentUserService;

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
        try {
            PageResp<ScreenerResp> response = screenerService.listScreeners(q, page, size, sort);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in listScreeners controller: ", e);
            return ResponseEntity.status(500).build();
        }
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
     * Lists starred screeners for current user.
     */
    @GetMapping("/starred")
    @Operation(summary = "List starred screeners", description = "Lists screeners starred by current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Starred screeners retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ScreenerResp>> listStarredScreeners() {
        log.info("Listing starred screeners");
        List<ScreenerResp> response = screenerService.listStarredScreeners();
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

    /**
     * Test endpoint to check basic repository operations.
     */
    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Test basic repository operations")
    public ResponseEntity<String> testEndpoint() {
        log.info("Testing basic repository operations");
        try {
            long count = screenerRepository.count();
            log.info("Total screeners count: {}", count);
            return ResponseEntity.ok("Test successful. Total screeners: " + count);
        } catch (Exception e) {
            log.error("Error in test endpoint: ", e);
            return ResponseEntity.status(500).body("Test failed: " + e.getMessage());
        }
    }

    // ========== CRITERIA BUILDER ENDPOINTS ==========

    /**
     * Gets available fields for criteria building with role-based filtering.
     */
    @GetMapping("/fields")
    @Operation(summary = "Get available fields", description = "Gets field metadata available for criteria building with role-based filtering")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Fields retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<FieldMetaResp>> getAvailableFields() {
        log.info("Getting available fields for criteria building");
        try {
            Long userId = currentUserService.getCurrentUserId();
            List<FieldMetaResp> fields = fieldMetadataService.getFieldsForUser(userId);
            log.info("Retrieved {} fields for user {}", fields.size(), userId);
            return ResponseEntity.ok(fields);
        } catch (Exception e) {
            log.error("Error getting available fields: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Gets available functions for criteria building with user-based access control.
     */
    @GetMapping("/functions")
    @Operation(summary = "Get available functions", description = "Gets function definitions available for criteria building with user-based access and category support")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Functions retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<FunctionMetaResp>> getAvailableFunctions() {
        log.info("Getting available functions for criteria building");
        try {
            Long userId = currentUserService.getCurrentUserId();
            List<FunctionMetaResp> functions = functionDefinitionService.getFunctionsForUser(userId);
            log.info("Retrieved {} functions for user {}", functions.size(), userId);
            return ResponseEntity.ok(functions);
        } catch (Exception e) {
            log.error("Error getting available functions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Validates criteria DSL structure and semantics.
     */
    @PostMapping("/validate-criteria")
    @Operation(summary = "Validate criteria DSL", description = "Validates criteria DSL structure, field references, function calls, and operator compatibility")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Validation completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ValidationResult> validateCriteria(
            @Valid @RequestBody CriteriaValidationReq request) {
        log.info("Validating criteria DSL");
        try {
            Long userId = currentUserService.getCurrentUserId();
            ValidationResult result = criteriaValidationService.validateDSL(request.getDsl(), userId);
            log.info("Validation completed for user {} - valid: {}, errors: {}, warnings: {}", 
                userId, result.isValid(), result.getErrors().size(), result.getWarnings().size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error validating criteria DSL: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generates parameterized SQL from validated criteria DSL.
     */
    @PostMapping("/generate-sql")
    @Operation(summary = "Generate SQL from DSL", description = "Generates parameterized SQL from validated criteria DSL with security checks")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "SQL generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid DSL or validation failed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<SqlGenerationResult> generateSql(
            @Valid @RequestBody CriteriaSqlReq request) {
        log.info("Generating SQL from criteria DSL");
        try {
            Long userId = currentUserService.getCurrentUserId();
            
            // Re-validate DSL server-side for security
            ValidationResult validation = criteriaValidationService.validateDSL(request.getDsl(), userId);
            if (!validation.isValid()) {
                log.warn("SQL generation failed - invalid DSL for user {}: {} errors", userId, validation.getErrors().size());
                return ResponseEntity.badRequest().build();
            }
            
            SqlGenerationResult result = criteriaSqlService.generateSql(request.getDsl(), userId);
            log.info("SQL generated successfully for user {} - {} parameters", userId, result.getParameters().size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error generating SQL from DSL: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== VISUAL INTERFACE SUPPORT ENDPOINTS ==========

    /**
     * Gets compatible operators for a specific field type.
     */
    @GetMapping("/fields/{fieldId}/operators")
    @Operation(summary = "Get field operators", description = "Gets operators compatible with specific field type for visual interface")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Operators retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Field not found or not accessible"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<OperatorInfo>> getFieldOperators(
            @Parameter(description = "Field ID") @PathVariable String fieldId) {
        log.info("Getting compatible operators for field: {}", fieldId);
        try {
            Long userId = currentUserService.getCurrentUserId();
            List<OperatorInfo> operators = fieldMetadataService.getCompatibleOperators(fieldId, userId);
            
            if (operators.isEmpty()) {
                log.warn("No operators found for field {} and user {}", fieldId, userId);
                return ResponseEntity.notFound().build();
            }
            
            log.info("Retrieved {} operators for field {} and user {}", operators.size(), fieldId, userId);
            return ResponseEntity.ok(operators);
        } catch (Exception e) {
            log.error("Error getting operators for field {}: ", fieldId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Gets value suggestions for a field with optional query filtering.
     */
    @GetMapping("/fields/{fieldId}/suggestions")
    @Operation(summary = "Get field suggestions", description = "Gets value suggestions for enum fields or fields with suggestions API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suggestions retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Field not found or not accessible"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ValueSuggestion>> getFieldSuggestions(
            @Parameter(description = "Field ID") @PathVariable String fieldId,
            @Parameter(description = "Query to filter suggestions") @RequestParam(required = false) String query) {
        log.info("Getting value suggestions for field: {} with query: {}", fieldId, query);
        try {
            Long userId = currentUserService.getCurrentUserId();
            List<ValueSuggestion> suggestions = fieldMetadataService.getValueSuggestions(fieldId, query, userId);
            
            log.info("Retrieved {} suggestions for field {} and user {}", suggestions.size(), fieldId, userId);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("Error getting suggestions for field {}: ", fieldId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Validates partial criteria DSL for real-time feedback.
     */
    @PostMapping("/validate-partial-criteria")
    @Operation(summary = "Validate partial criteria", description = "Validates incomplete criteria DSL for real-time feedback during query building")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Partial validation completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PartialValidationResult> validatePartialCriteria(
            @Valid @RequestBody PartialCriteriaValidationReq request) {
        log.info("Validating partial criteria DSL");
        try {
            Long userId = currentUserService.getCurrentUserId();
            PartialValidationResult result = criteriaValidationService.validatePartialDSL(request.getPartialDsl(), userId);
            log.info("Partial validation completed for user {} - valid: {}, suggestions: {}", 
                userId, result.isValid(), result.getSuggestions().size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error validating partial criteria DSL: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Gets detailed function signature information for visual interface dialogs.
     */
    @GetMapping("/functions/{functionId}/signature")
    @Operation(summary = "Get function signature", description = "Gets detailed parameter information for function dialog display")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Function signature retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Function not found or not accessible"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<FunctionSignature> getFunctionSignature(
            @Parameter(description = "Function ID") @PathVariable String functionId) {
        log.info("Getting function signature for: {}", functionId);
        try {
            Long userId = currentUserService.getCurrentUserId();
            FunctionSignature signature = functionDefinitionService.getFunctionSignature(functionId, userId);
            
            if (signature == null) {
                log.warn("Function signature not found for {} and user {}", functionId, userId);
                return ResponseEntity.notFound().build();
            }
            
            log.info("Retrieved function signature for {} and user {}", functionId, userId);
            return ResponseEntity.ok(signature);
        } catch (Exception e) {
            log.error("Error getting function signature for {}: ", functionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Previews criteria with human-readable description and estimates.
     */
    @PostMapping("/preview-criteria")
    @Operation(summary = "Preview criteria", description = "Returns formatted preview text and estimated result count without full execution")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Preview generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid DSL or validation failed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<CriteriaPreview> previewCriteria(
            @Valid @RequestBody CriteriaPreviewReq request) {
        log.info("Generating criteria preview");
        try {
            Long userId = currentUserService.getCurrentUserId();
            CriteriaPreview preview = criteriaValidationService.previewCriteria(request.getDsl(), userId);
            log.info("Preview generated successfully for user {}", userId);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            log.error("Error generating criteria preview: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Gets all available operators with descriptions and compatibility information.
     */
    @GetMapping("/operators")
    @Operation(summary = "Get all operators", description = "Gets all available operators with descriptions and compatibility info for visual interface")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Operators retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<OperatorInfo>> getAllOperators() {
        log.info("Getting all available operators");
        try {
            List<OperatorInfo> operators = criteriaValidationService.getAllOperators();
            log.info("Retrieved {} operators", operators.size());
            return ResponseEntity.ok(operators);
        } catch (Exception e) {
            log.error("Error getting all operators: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
