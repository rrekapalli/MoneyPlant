package com.moneyplant.screener.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Service for auditing criteria-related operations.
 * Integrates with existing screener audit logging infrastructure.
 * Leverages existing screener security and logging patterns.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@ConfigurationProperties(prefix = "screener.security.audit")
public class CriteriaAuditService {

    private final CurrentUserService currentUserService;

    // Configuration properties
    private boolean enabled = true;
    private boolean logValidationEvents = true;
    private boolean logSqlGenerationEvents = true;
    private boolean logFieldAccessEvents = true;
    private boolean logFunctionAccessEvents = true;
    private boolean logExecutionEvents = true;
    private boolean logSecurityEvents = true;

    /**
     * Logs criteria validation events.
     * Integrates with existing screener audit logging infrastructure.
     */
    public void logValidationEvent(String dslHash, boolean isValid, int errorCount, int warningCount) {
        if (!enabled || !logValidationEvents) {
            return;
        }
        
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
     * Integrates with existing screener audit logging infrastructure.
     */
    public void logSqlGenerationEvent(String dslHash, boolean success, String errorMessage) {
        if (!enabled || !logSqlGenerationEvents) {
            return;
        }
        
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
     * Integrates with existing screener audit logging infrastructure.
     */
    public void logFieldAccessEvent(String fieldId, String action) {
        if (!enabled || !logFieldAccessEvents) {
            return;
        }
        
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
     * Integrates with existing screener audit logging infrastructure.
     */
    public void logFunctionAccessEvent(String functionId, String action) {
        if (!enabled || !logFunctionAccessEvents) {
            return;
        }
        
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
     * Integrates with existing screener audit logging infrastructure.
     */
    public void logCriteriaExecutionEvent(String dslHash, Long screenerId, boolean success, String errorMessage) {
        if (!enabled || !logExecutionEvents) {
            return;
        }
        
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
     * Integrates with existing screener audit logging infrastructure.
     */
    public void logSecurityEvent(String eventType, String details) {
        if (!enabled || !logSecurityEvents) {
            return;
        }
        
        try {
            Long userId = currentUserService.getCurrentUserId();
            log.warn("CRITERIA_SECURITY_EVENT - User: {}, Event: {}, Details: {}, Timestamp: {}", 
                userId, eventType, details, Instant.now());
        } catch (Exception e) {
            log.error("Failed to log security event", e);
        }
    }

    // Configuration property getters and setters
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isLogValidationEvents() {
        return logValidationEvents;
    }

    public void setLogValidationEvents(boolean logValidationEvents) {
        this.logValidationEvents = logValidationEvents;
    }

    public boolean isLogSqlGenerationEvents() {
        return logSqlGenerationEvents;
    }

    public void setLogSqlGenerationEvents(boolean logSqlGenerationEvents) {
        this.logSqlGenerationEvents = logSqlGenerationEvents;
    }

    public boolean isLogFieldAccessEvents() {
        return logFieldAccessEvents;
    }

    public void setLogFieldAccessEvents(boolean logFieldAccessEvents) {
        this.logFieldAccessEvents = logFieldAccessEvents;
    }

    public boolean isLogFunctionAccessEvents() {
        return logFunctionAccessEvents;
    }

    public void setLogFunctionAccessEvents(boolean logFunctionAccessEvents) {
        this.logFunctionAccessEvents = logFunctionAccessEvents;
    }

    public boolean isLogExecutionEvents() {
        return logExecutionEvents;
    }

    public void setLogExecutionEvents(boolean logExecutionEvents) {
        this.logExecutionEvents = logExecutionEvents;
    }

    public boolean isLogSecurityEvents() {
        return logSecurityEvents;
    }

    public void setLogSecurityEvents(boolean logSecurityEvents) {
        this.logSecurityEvents = logSecurityEvents;
    }
}