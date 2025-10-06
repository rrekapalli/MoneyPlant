package com.moneyplant.screener.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Service for auditing criteria-related operations.
 * Integrates with existing screener audit logging infrastructure.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CriteriaAuditService {

    private final CurrentUserService currentUserService;

    /**
     * Logs criteria validation events.
     */
    public void logValidationEvent(String dslHash, boolean isValid, int errorCount, int warningCount) {
        try {
            Long userId = currentUserService.getCurrentUserId();
            log.info("CRITERIA_VALIDATION - User: {}, DSL Hash: {}, Valid: {}, Errors: {}, Warnings: {}, Timestamp: {}", 
                userId, dslHash, isValid, errorCount, warningCount, Instant.now());
        } catch (Exception e) {
            log.warn("Failed to log criteria validation event", e);
        }
    }

    /**
     * Logs criteria SQL generation events.
     */
    public void logSqlGenerationEvent(String dslHash, boolean success, String errorMessage) {
        try {
            Long userId = currentUserService.getCurrentUserId();
            log.info("CRITERIA_SQL_GENERATION - User: {}, DSL Hash: {}, Success: {}, Error: {}, Timestamp: {}", 
                userId, dslHash, success, errorMessage, Instant.now());
        } catch (Exception e) {
            log.warn("Failed to log criteria SQL generation event", e);
        }
    }

    /**
     * Logs field metadata access events.
     */
    public void logFieldAccessEvent(String fieldId, String action) {
        try {
            Long userId = currentUserService.getCurrentUserId();
            log.info("CRITERIA_FIELD_ACCESS - User: {}, Field: {}, Action: {}, Timestamp: {}", 
                userId, fieldId, action, Instant.now());
        } catch (Exception e) {
            log.warn("Failed to log field access event", e);
        }
    }

    /**
     * Logs function metadata access events.
     */
    public void logFunctionAccessEvent(String functionId, String action) {
        try {
            Long userId = currentUserService.getCurrentUserId();
            log.info("CRITERIA_FUNCTION_ACCESS - User: {}, Function: {}, Action: {}, Timestamp: {}", 
                userId, functionId, action, Instant.now());
        } catch (Exception e) {
            log.warn("Failed to log function access event", e);
        }
    }

    /**
     * Logs criteria execution events.
     */
    public void logCriteriaExecutionEvent(String dslHash, Long screenerId, boolean success, String errorMessage) {
        try {
            Long userId = currentUserService.getCurrentUserId();
            log.info("CRITERIA_EXECUTION - User: {}, Screener: {}, DSL Hash: {}, Success: {}, Error: {}, Timestamp: {}", 
                userId, screenerId, dslHash, success, errorMessage, Instant.now());
        } catch (Exception e) {
            log.warn("Failed to log criteria execution event", e);
        }
    }

    /**
     * Logs security-related events.
     */
    public void logSecurityEvent(String eventType, String details) {
        try {
            Long userId = currentUserService.getCurrentUserId();
            log.warn("CRITERIA_SECURITY_EVENT - User: {}, Event: {}, Details: {}, Timestamp: {}", 
                userId, eventType, details, Instant.now());
        } catch (Exception e) {
            log.error("Failed to log security event", e);
        }
    }
}