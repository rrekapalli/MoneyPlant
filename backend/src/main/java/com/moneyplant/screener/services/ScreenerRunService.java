package com.moneyplant.screener.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.screener.dtos.*;
import com.moneyplant.screener.entities.ScreenerRun;
import com.moneyplant.screener.entities.ScreenerVersion;
import com.moneyplant.screener.exceptions.CriteriaValidationException;
import com.moneyplant.screener.mappers.RunMapper;
import com.moneyplant.screener.repositories.ScreenerRunRepository;
import com.moneyplant.screener.repositories.ScreenerVersionRepository;
import com.moneyplant.screener.repositories.ScreenerParamsetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing screener runs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerRunService {

    private final ScreenerRunRepository screenerRunRepository;
    private final ScreenerVersionRepository screenerVersionRepository;
    private final ScreenerParamsetRepository screenerParamsetRepository;
    private final RunMapper runMapper;
    private final CurrentUserService currentUserService;
    private final CriteriaValidationService criteriaValidationService;
    private final ObjectMapper objectMapper;
    private final CriteriaAuditService auditService;
    
    @Qualifier("noopRunExecutor")
    private final RunExecutor runExecutor;

    /**
     * Creates a new screener run.
     */
    public RunResp createRun(Long screenerId, RunCreateReq request) {
        log.info("Creating run for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        
        // Validate screener version
        var version = screenerVersionRepository.findById(request.getScreenerVersionId())
                .orElseThrow(() -> new RuntimeException("Screener version not found: " + request.getScreenerVersionId()));
        
        if (!version.getScreener().getScreenerId().equals(screenerId)) {
            throw new RuntimeException("Screener version does not belong to screener: " + screenerId);
        }
        
        // Validate criteria DSL if present
        validateCriteriaBeforeRun(version, currentUserId);
        
        // Validate paramset if provided
        if (request.getParamsetId() != null) {
            var paramset = screenerParamsetRepository.findById(request.getParamsetId())
                    .orElseThrow(() -> new RuntimeException("Parameter set not found: " + request.getParamsetId()));
            
            if (!paramset.getScreenerVersion().getScreenerVersionId().equals(request.getScreenerVersionId())) {
                throw new RuntimeException("Parameter set does not belong to screener version: " + request.getScreenerVersionId());
            }
        }
        
        // Create run entity
        ScreenerRun run = ScreenerRun.builder()
                .screener(version.getScreener())
                .screenerVersion(version)
                .triggeredByUserId(currentUserId)
                .paramset(request.getParamsetId() != null ? 
                    screenerParamsetRepository.findById(request.getParamsetId()).orElse(null) : null)
                .paramsJson(request.getParamsJson())
                .universeSnapshot(request.getUniverseSymbolIds())
                .runForTradingDay(request.getRunForTradingDay() != null ? 
                    request.getRunForTradingDay() : LocalDate.now())
                .status("running")
                .build();
        
        ScreenerRun savedRun = screenerRunRepository.save(run);
        
        // Execute run asynchronously (for now, synchronously)
        try {
            runExecutor.executeRun(savedRun);
            screenerRunRepository.save(savedRun);
        } catch (Exception e) {
            log.error("Error executing run: {}", e.getMessage(), e);
            savedRun.setStatus("failed");
            savedRun.setErrorMessage(e.getMessage());
            screenerRunRepository.save(savedRun);
        }
        
        log.info("Created run: {}", savedRun.getScreenerRunId());
        return runMapper.toResponse(savedRun);
    }

    /**
     * Gets a run by ID.
     */
    @Transactional(readOnly = true)
    public RunResp getRun(Long runId) {
        log.info("Getting run: {}", runId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerRun run = screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        return runMapper.toResponse(run);
    }

    /**
     * Lists runs for a screener.
     */
    @Transactional(readOnly = true)
    public PageResp<RunResp> listRuns(Long screenerId, int page, int size) {
        log.info("Listing runs for screener: {}, page: {}, size: {}", screenerId, page, size);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        // Check if user has access to screener - using currentUserId for future access control
        log.debug("Listing runs for user: {}", currentUserId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startedAt"));
        Page<ScreenerRun> runs = screenerRunRepository.findByScreenerScreenerIdOrderByStartedAtDesc(screenerId, pageable);
        
        List<RunResp> content = runs.getContent().stream()
                .map(runMapper::toResponse)
                .toList();
        
        return PageResp.<RunResp>builder()
                .content(content)
                .page(runs.getNumber())
                .size(runs.getSize())
                .totalElements(runs.getTotalElements())
                .totalPages(runs.getTotalPages())
                .sort("startedAt,desc")
                .build();
    }

    /**
     * Retries a failed run.
     */
    public RunResp retryRun(Long runId) {
        log.info("Retrying run: {}", runId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerRun run = screenerRunRepository.findByIdAndScreenerOwner(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found or access denied: " + runId));
        
        if (!"failed".equals(run.getStatus())) {
            throw new RuntimeException("Can only retry failed runs");
        }
        
        // Reset run status
        run.setStatus("running");
        run.setFinishedAt(null);
        run.setErrorMessage(null);
        run.setTotalCandidates(null);
        run.setTotalMatches(null);
        
        ScreenerRun savedRun = screenerRunRepository.save(run);
        
        // Execute run
        try {
            runExecutor.executeRun(savedRun);
            screenerRunRepository.save(savedRun);
        } catch (Exception e) {
            log.error("Error retrying run: {}", e.getMessage(), e);
            savedRun.setStatus("failed");
            savedRun.setErrorMessage(e.getMessage());
            screenerRunRepository.save(savedRun);
        }
        
        log.info("Retried run: {}", runId);
        return runMapper.toResponse(savedRun);
    }

    /**
     * Gets the latest successful run for a screener.
     */
    @Transactional(readOnly = true)
    public Optional<RunResp> getLatestSuccessfulRun(Long screenerId) {
        log.info("Getting latest successful run for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        // Check if user has access to screener - using currentUserId for future access control
        log.debug("Getting latest successful run for user: {}", currentUserId);
        
        return screenerRunRepository.findLatestSuccessfulRun(screenerId)
                .map(runMapper::toResponse);
    }

    /**
     * Gets runs by status.
     */
    @Transactional(readOnly = true)
    public List<RunResp> getRunsByStatus(String status) {
        log.info("Getting runs by status: {}", status);
        
        List<ScreenerRun> runs = screenerRunRepository.findByStatusOrderByStartedAtDesc(status);
        
        return runs.stream()
                .map(runMapper::toResponse)
                .toList();
    }

    /**
     * Gets runs by user.
     */
    @Transactional(readOnly = true)
    public List<RunResp> getRunsByUser(Long userId) {
        log.info("Getting runs by user: {}", userId);
        
        List<ScreenerRun> runs = screenerRunRepository.findByTriggeredByUserIdOrderByStartedAtDesc(userId);
        
        return runs.stream()
                .map(runMapper::toResponse)
                .toList();
    }

    /**
     * Validates criteria DSL before run execution.
     * Integrates criteria validation with existing screener run workflow.
     */
    private void validateCriteriaBeforeRun(ScreenerVersion version, Long userId) {
        if (version.getDslJson() == null) {
            // No criteria DSL to validate
            return;
        }

        try {
            CriteriaDSL dsl = objectMapper.convertValue(version.getDslJson(), CriteriaDSL.class);
            
            // Re-validate DSL server-side before execution
            ValidationResult validation = criteriaValidationService.validateDSL(dsl, userId);
            
            if (!validation.isValid()) {
                log.warn("Invalid criteria DSL for version {}: {} errors", 
                    version.getScreenerVersionId(), validation.getErrors().size());
                
                // Audit log the validation failure
                auditService.logCriteriaExecutionEvent(
                    calculateDslHash(dsl), 
                    version.getScreener().getScreenerId(), 
                    false, 
                    "Criteria validation failed: " + validation.getErrors().size() + " errors"
                );
                
                throw new CriteriaValidationException("Criteria DSL validation failed before execution", validation.getErrors());
            }
            
            log.info("Criteria DSL validation passed for version {}", version.getScreenerVersionId());
            
            // Audit log successful validation
            auditService.logCriteriaExecutionEvent(
                calculateDslHash(dsl), 
                version.getScreener().getScreenerId(), 
                true, 
                null
            );
            
        } catch (CriteriaValidationException e) {
            // Re-throw validation exceptions as-is
            throw e;
        } catch (Exception e) {
            log.error("Failed to validate criteria DSL for version {}: {}", 
                version.getScreenerVersionId(), e.getMessage(), e);
            
            auditService.logCriteriaExecutionEvent(
                "unknown", 
                version.getScreener().getScreenerId(), 
                false, 
                "DSL parsing failed: " + e.getMessage()
            );
            
            throw new RuntimeException("Failed to validate criteria DSL: " + e.getMessage(), e);
        }
    }

    /**
     * Creates a run with criteria DSL validation and enhanced error handling.
     * This method provides additional criteria-specific functionality.
     */
    public RunResp createRunWithCriteriaValidation(Long screenerId, RunCreateReq request) {
        log.info("Creating run with criteria validation for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        
        // Validate screener version
        ScreenerVersion version = screenerVersionRepository.findById(request.getScreenerVersionId())
                .orElseThrow(() -> new RuntimeException("Screener version not found: " + request.getScreenerVersionId()));
        
        if (!version.getScreener().getScreenerId().equals(screenerId)) {
            throw new RuntimeException("Screener version does not belong to screener: " + screenerId);
        }

        // Enhanced criteria validation with detailed error reporting
        if (version.getDslJson() != null) {
            try {
                CriteriaDSL dsl = objectMapper.convertValue(version.getDslJson(), CriteriaDSL.class);
                
                ValidationResult validation = criteriaValidationService.validateDSL(dsl, currentUserId);
                
                if (!validation.isValid()) {
                    log.warn("Criteria validation failed for screener {} version {}: {} errors, {} warnings", 
                        screenerId, version.getVersionNumber(), 
                        validation.getErrors().size(), validation.getWarnings().size());
                    
                    // Create detailed error message
                    StringBuilder errorMsg = new StringBuilder("Criteria validation failed:\n");
                    validation.getErrors().forEach(error -> 
                        errorMsg.append("- ").append(error.getMessage()).append(" (").append(error.getPath()).append(")\n"));
                    
                    throw new CriteriaValidationException(errorMsg.toString(), validation.getErrors());
                }
                
                // Log warnings if any
                if (!validation.getWarnings().isEmpty()) {
                    log.warn("Criteria validation warnings for screener {} version {}: {} warnings", 
                        screenerId, version.getVersionNumber(), validation.getWarnings().size());
                    validation.getWarnings().forEach(warning -> 
                        log.warn("Warning: {} ({})", warning.getMessage(), warning.getPath()));
                }
                
            } catch (Exception e) {
                log.error("Failed to parse or validate criteria DSL for screener {} version {}: {}", 
                    screenerId, version.getVersionNumber(), e.getMessage(), e);
                throw new RuntimeException("Criteria DSL validation failed: " + e.getMessage(), e);
            }
        }
        
        // Proceed with standard run creation
        return createRun(screenerId, request);
    }

    /**
     * Gets runs with criteria DSL for performance monitoring.
     * Integrates with existing screener performance monitoring.
     */
    @Transactional(readOnly = true)
    public List<RunResp> getCriteriaRuns(Long screenerId, int limit) {
        log.info("Getting criteria runs for screener: {}, limit: {}", screenerId, limit);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        log.debug("Getting criteria runs for user: {}", currentUserId);
        
        Pageable pageable = PageRequest.of(0, limit);
        List<ScreenerRun> runs = screenerRunRepository.findCriteriaRunsByScreenerId(screenerId, pageable);
        
        return runs.stream()
                .map(runMapper::toResponse)
                .toList();
    }

    /**
     * Gets performance metrics for criteria-based runs.
     * Extends existing screener metrics collection for criteria execution performance.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCriteriaPerformanceMetrics(Long screenerId) {
        log.info("Getting criteria performance metrics for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        log.debug("Getting performance metrics for user: {}", currentUserId);
        
        Map<String, Object> metrics = new HashMap<>();
        
        // Get criteria run statistics
        Pageable pageable = PageRequest.of(0, 100);
        List<ScreenerRun> criteriaRuns = screenerRunRepository.findCriteriaRunsByScreenerId(screenerId, pageable);
        
        if (!criteriaRuns.isEmpty()) {
            // Calculate average execution time for criteria runs
            double avgExecutionTime = criteriaRuns.stream()
                .filter(run -> run.getStartedAt() != null && run.getFinishedAt() != null)
                .mapToLong(run -> java.time.Duration.between(run.getStartedAt(), run.getFinishedAt()).toMillis())
                .average()
                .orElse(0.0);
            
            // Calculate success rate
            long successfulRuns = criteriaRuns.stream()
                .filter(run -> "completed".equals(run.getStatus()))
                .count();
            double successRate = (double) successfulRuns / criteriaRuns.size() * 100;
            
            // Calculate average result count
            double avgResultCount = criteriaRuns.stream()
                .filter(run -> run.getTotalMatches() != null)
                .mapToInt(ScreenerRun::getTotalMatches)
                .average()
                .orElse(0.0);
            
            metrics.put("totalCriteriaRuns", criteriaRuns.size());
            metrics.put("avgExecutionTimeMs", avgExecutionTime);
            metrics.put("successRate", successRate);
            metrics.put("avgResultCount", avgResultCount);
            metrics.put("lastRunAt", criteriaRuns.get(0).getStartedAt());
        } else {
            metrics.put("totalCriteriaRuns", 0);
            metrics.put("avgExecutionTimeMs", 0.0);
            metrics.put("successRate", 0.0);
            metrics.put("avgResultCount", 0.0);
            metrics.put("lastRunAt", null);
        }
        
        return metrics;
    }

    /**
     * Validates and executes a run with enhanced criteria monitoring.
     * Leverages existing screener timeout, pagination, and result storage mechanisms.
     */
    public RunResp executeRunWithCriteriaMonitoring(Long screenerId, RunCreateReq request) {
        log.info("Executing run with criteria monitoring for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        
        // Get screener version
        ScreenerVersion version = screenerVersionRepository.findById(request.getScreenerVersionId())
                .orElseThrow(() -> new RuntimeException("Screener version not found: " + request.getScreenerVersionId()));
        
        // Enhanced monitoring for criteria-based runs
        if (version.getDslJson() != null) {
            try {
                CriteriaDSL dsl = objectMapper.convertValue(version.getDslJson(), CriteriaDSL.class);
                
                // Log criteria execution start
                String dslHash = calculateDslHash(dsl);
                log.info("Starting criteria execution for screener {} with DSL hash: {}", screenerId, dslHash);
                
                // Validate DSL with performance tracking
                long validationStart = System.currentTimeMillis();
                ValidationResult validation = criteriaValidationService.validateDSL(dsl, currentUserId);
                long validationTime = System.currentTimeMillis() - validationStart;
                
                if (!validation.isValid()) {
                    log.warn("Criteria validation failed in {}ms for screener {}: {} errors", 
                        validationTime, screenerId, validation.getErrors().size());
                    
                    auditService.logCriteriaExecutionEvent(dslHash, screenerId, false, 
                        "Validation failed in " + validationTime + "ms: " + validation.getErrors().size() + " errors");
                    
                    throw new CriteriaValidationException("Criteria validation failed", validation.getErrors());
                }
                
                log.info("Criteria validation completed in {}ms for screener {}", validationTime, screenerId);
                
                // Audit successful validation with timing
                auditService.logCriteriaExecutionEvent(dslHash, screenerId, true, 
                    "Validation completed in " + validationTime + "ms");
                
            } catch (Exception e) {
                log.error("Failed to validate criteria for screener {}: {}", screenerId, e.getMessage(), e);
                throw new RuntimeException("Criteria validation failed: " + e.getMessage(), e);
            }
        }
        
        // Proceed with standard run creation with enhanced monitoring
        return createRun(screenerId, request);
    }

    /**
     * Calculates hash of DSL for audit logging.
     */
    private String calculateDslHash(CriteriaDSL dsl) {
        try {
            String dslJson = objectMapper.writeValueAsString(dsl);
            return Integer.toHexString(dslJson.hashCode());
        } catch (Exception e) {
            log.warn("Failed to calculate DSL hash: {}", e.getMessage());
            return "unknown-" + System.currentTimeMillis();
        }
    }
}
