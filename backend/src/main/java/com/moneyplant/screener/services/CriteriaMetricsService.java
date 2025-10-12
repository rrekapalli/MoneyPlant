package com.moneyplant.screener.services;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for collecting and managing criteria-related metrics.
 * Integrates with existing screener monitoring infrastructure using Micrometer.
 */
@Service
@Slf4j
public class CriteriaMetricsService {

    private final MeterRegistry meterRegistry;
    
    // Metrics for criteria validation
    private final Counter criteriaValidationSuccessCounter;
    private final Counter criteriaValidationFailureCounter;
    private final Timer criteriaValidationTimer;
    
    // Metrics for SQL generation
    private final Counter sqlGenerationSuccessCounter;
    private final Counter sqlGenerationFailureCounter;
    private final Timer sqlGenerationTimer;
    
    // Metrics for criteria execution
    private final Counter criteriaExecutionSuccessCounter;
    private final Counter criteriaExecutionFailureCounter;
    private final Timer criteriaExecutionTimer;
    
    // Cache for performance tracking
    private final Map<String, Long> operationStartTimes = new ConcurrentHashMap<>();

    public CriteriaMetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // Initialize validation metrics
        this.criteriaValidationSuccessCounter = Counter.builder("screener.criteria.validation.success")
                .description("Number of successful criteria validations")
                .tag("component", "screener")
                .tag("operation", "validation")
                .register(meterRegistry);
                
        this.criteriaValidationFailureCounter = Counter.builder("screener.criteria.validation.failure")
                .description("Number of failed criteria validations")
                .tag("component", "screener")
                .tag("operation", "validation")
                .register(meterRegistry);
                
        this.criteriaValidationTimer = Timer.builder("screener.criteria.validation.duration")
                .description("Duration of criteria validation operations")
                .tag("component", "screener")
                .tag("operation", "validation")
                .register(meterRegistry);
        
        // Initialize SQL generation metrics
        this.sqlGenerationSuccessCounter = Counter.builder("screener.criteria.sql.generation.success")
                .description("Number of successful SQL generations")
                .tag("component", "screener")
                .tag("operation", "sql_generation")
                .register(meterRegistry);
                
        this.sqlGenerationFailureCounter = Counter.builder("screener.criteria.sql.generation.failure")
                .description("Number of failed SQL generations")
                .tag("component", "screener")
                .tag("operation", "sql_generation")
                .register(meterRegistry);
                
        this.sqlGenerationTimer = Timer.builder("screener.criteria.sql.generation.duration")
                .description("Duration of SQL generation operations")
                .tag("component", "screener")
                .tag("operation", "sql_generation")
                .register(meterRegistry);
        
        // Initialize execution metrics
        this.criteriaExecutionSuccessCounter = Counter.builder("screener.criteria.execution.success")
                .description("Number of successful criteria executions")
                .tag("component", "screener")
                .tag("operation", "execution")
                .register(meterRegistry);
                
        this.criteriaExecutionFailureCounter = Counter.builder("screener.criteria.execution.failure")
                .description("Number of failed criteria executions")
                .tag("component", "screener")
                .tag("operation", "execution")
                .register(meterRegistry);
                
        this.criteriaExecutionTimer = Timer.builder("screener.criteria.execution.duration")
                .description("Duration of criteria execution operations")
                .tag("component", "screener")
                .tag("operation", "execution")
                .register(meterRegistry);
    }

    /**
     * Records the start of a criteria validation operation.
     */
    public void startValidationTimer(String operationId) {
        operationStartTimes.put("validation_" + operationId, System.nanoTime());
        log.debug("Started validation timer for operation: {}", operationId);
    }

    /**
     * Records a successful criteria validation operation.
     */
    public void recordValidationSuccess(String operationId) {
        criteriaValidationSuccessCounter.increment();
        recordValidationDuration(operationId);
        log.debug("Recorded validation success for operation: {}", operationId);
    }

    /**
     * Records a failed criteria validation operation.
     */
    public void recordValidationFailure(String operationId, String errorType) {
        Counter.builder("screener.criteria.validation.failure")
                .description("Number of failed criteria validations")
                .tag("component", "screener")
                .tag("operation", "validation")
                .tag("error_type", errorType != null ? errorType : "unknown")
                .register(meterRegistry)
                .increment();
        recordValidationDuration(operationId);
        log.debug("Recorded validation failure for operation: {} with error type: {}", operationId, errorType);
    }

    /**
     * Records the duration of a validation operation.
     */
    private void recordValidationDuration(String operationId) {
        String key = "validation_" + operationId;
        Long startTime = operationStartTimes.remove(key);
        if (startTime != null) {
            Duration duration = Duration.ofNanos(System.nanoTime() - startTime);
            criteriaValidationTimer.record(duration);
        }
    }

    /**
     * Records the start of a SQL generation operation.
     */
    public void startSqlGenerationTimer(String operationId) {
        operationStartTimes.put("sql_" + operationId, System.nanoTime());
        log.debug("Started SQL generation timer for operation: {}", operationId);
    }

    /**
     * Records a successful SQL generation operation.
     */
    public void recordSqlGenerationSuccess(String operationId, int parameterCount, int complexityScore) {
        Counter.builder("screener.criteria.sql.generation.success")
                .description("Number of successful SQL generations")
                .tag("component", "screener")
                .tag("operation", "sql_generation")
                .tag("parameter_count_range", getParameterCountRange(parameterCount))
                .tag("complexity_range", getComplexityRange(complexityScore))
                .register(meterRegistry)
                .increment();
        recordSqlGenerationDuration(operationId);
        log.debug("Recorded SQL generation success for operation: {} with {} parameters and complexity {}", 
                 operationId, parameterCount, complexityScore);
    }

    /**
     * Records a failed SQL generation operation.
     */
    public void recordSqlGenerationFailure(String operationId, String errorType) {
        Counter.builder("screener.criteria.sql.generation.failure")
                .description("Number of failed SQL generations")
                .tag("component", "screener")
                .tag("operation", "sql_generation")
                .tag("error_type", errorType != null ? errorType : "unknown")
                .register(meterRegistry)
                .increment();
        recordSqlGenerationDuration(operationId);
        log.debug("Recorded SQL generation failure for operation: {} with error type: {}", operationId, errorType);
    }

    /**
     * Records the duration of a SQL generation operation.
     */
    private void recordSqlGenerationDuration(String operationId) {
        String key = "sql_" + operationId;
        Long startTime = operationStartTimes.remove(key);
        if (startTime != null) {
            Duration duration = Duration.ofNanos(System.nanoTime() - startTime);
            sqlGenerationTimer.record(duration);
        }
    }

    /**
     * Records the start of a criteria execution operation.
     */
    public void startExecutionTimer(String operationId) {
        operationStartTimes.put("execution_" + operationId, System.nanoTime());
        log.debug("Started execution timer for operation: {}", operationId);
    }

    /**
     * Records a successful criteria execution operation.
     */
    public void recordExecutionSuccess(String operationId, int resultCount, long executionTimeMs) {
        Counter.builder("screener.criteria.execution.success")
                .description("Number of successful criteria executions")
                .tag("component", "screener")
                .tag("operation", "execution")
                .tag("result_count_range", getResultCountRange(resultCount))
                .tag("execution_time_range", getExecutionTimeRange(executionTimeMs))
                .register(meterRegistry)
                .increment();
        recordExecutionDuration(operationId);
        log.debug("Recorded execution success for operation: {} with {} results in {}ms", 
                 operationId, resultCount, executionTimeMs);
    }

    /**
     * Records a failed criteria execution operation.
     */
    public void recordExecutionFailure(String operationId, String errorType) {
        Counter.builder("screener.criteria.execution.failure")
                .description("Number of failed criteria executions")
                .tag("component", "screener")
                .tag("operation", "execution")
                .tag("error_type", errorType != null ? errorType : "unknown")
                .register(meterRegistry)
                .increment();
        recordExecutionDuration(operationId);
        log.debug("Recorded execution failure for operation: {} with error type: {}", operationId, errorType);
    }

    /**
     * Records the duration of an execution operation.
     */
    private void recordExecutionDuration(String operationId) {
        String key = "execution_" + operationId;
        Long startTime = operationStartTimes.remove(key);
        if (startTime != null) {
            Duration duration = Duration.ofNanos(System.nanoTime() - startTime);
            criteriaExecutionTimer.record(duration);
        }
    }

    /**
     * Records field access metrics for security monitoring.
     */
    public void recordFieldAccess(String fieldId, String userId, boolean authorized) {
        Counter.builder("screener.criteria.field.access")
                .description("Field access attempts in criteria operations")
                .tag("component", "screener")
                .tag("operation", "field_access")
                .tag("authorized", String.valueOf(authorized))
                .register(meterRegistry)
                .increment();
        
        if (!authorized) {
            log.warn("Unauthorized field access attempt: field={}, user={}", fieldId, userId);
        }
    }

    /**
     * Records function access metrics for security monitoring.
     */
    public void recordFunctionAccess(String functionId, String userId, boolean authorized) {
        Counter.builder("screener.criteria.function.access")
                .description("Function access attempts in criteria operations")
                .tag("component", "screener")
                .tag("operation", "function_access")
                .tag("authorized", String.valueOf(authorized))
                .register(meterRegistry)
                .increment();
        
        if (!authorized) {
            log.warn("Unauthorized function access attempt: function={}, user={}", functionId, userId);
        }
    }

    /**
     * Records cache hit/miss metrics for performance monitoring.
     */
    public void recordCacheEvent(String cacheType, boolean hit) {
        Counter.builder("screener.criteria.cache.events")
                .description("Cache events in criteria operations")
                .tag("component", "screener")
                .tag("cache_type", cacheType)
                .tag("event", hit ? "hit" : "miss")
                .register(meterRegistry)
                .increment();
    }

    /**
     * Gets parameter count range for metrics tagging.
     */
    private String getParameterCountRange(int count) {
        if (count <= 5) return "0-5";
        if (count <= 10) return "6-10";
        if (count <= 20) return "11-20";
        return "20+";
    }

    /**
     * Gets complexity range for metrics tagging.
     */
    private String getComplexityRange(int score) {
        if (score <= 10) return "low";
        if (score <= 50) return "medium";
        if (score <= 100) return "high";
        return "very_high";
    }

    /**
     * Gets result count range for metrics tagging.
     */
    private String getResultCountRange(int count) {
        if (count == 0) return "empty";
        if (count <= 100) return "small";
        if (count <= 1000) return "medium";
        if (count <= 10000) return "large";
        return "very_large";
    }

    /**
     * Gets execution time range for metrics tagging.
     */
    private String getExecutionTimeRange(long timeMs) {
        if (timeMs <= 100) return "fast";
        if (timeMs <= 1000) return "normal";
        if (timeMs <= 5000) return "slow";
        return "very_slow";
    }

    /**
     * Gets current metrics summary for health checks and monitoring dashboards.
     */
    public Map<String, Object> getMetricsSummary() {
        return Map.of(
            "validation", Map.of(
                "success_count", criteriaValidationSuccessCounter.count(),
                "failure_count", criteriaValidationFailureCounter.count(),
                "avg_duration_ms", criteriaValidationTimer.mean(java.util.concurrent.TimeUnit.MILLISECONDS)
            ),
            "sql_generation", Map.of(
                "success_count", sqlGenerationSuccessCounter.count(),
                "failure_count", sqlGenerationFailureCounter.count(),
                "avg_duration_ms", sqlGenerationTimer.mean(java.util.concurrent.TimeUnit.MILLISECONDS)
            ),
            "execution", Map.of(
                "success_count", criteriaExecutionSuccessCounter.count(),
                "failure_count", criteriaExecutionFailureCounter.count(),
                "avg_duration_ms", criteriaExecutionTimer.mean(java.util.concurrent.TimeUnit.MILLISECONDS)
            )
        );
    }
}