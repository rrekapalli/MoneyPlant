package com.moneyplant.engines.ingestion.historical.config;

import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

/**
 * Configuration for Resilience4j retry policies.
 * 
 * Provides retry configurations for:
 * - NSE bhav copy downloads (6 retries with exponential backoff)
 * - Database operations (3 retries with fixed delay)
 * 
 * Requirements: 6.1, 6.4
 */
@Configuration
@Slf4j
public class RetryConfig {
    
    @Value("${ingestion.providers.nse.historical.max-retries:6}")
    private int maxDownloadRetries;
    
    @Value("${ingestion.providers.nse.historical.retry-backoff-multiplier:2.0}")
    private double retryBackoffMultiplier;
    
    @Value("${ingestion.providers.nse.historical.db-max-retries:3}")
    private int maxDbRetries;
    
    /**
     * Creates a retry configuration for NSE bhav copy downloads.
     * 
     * Configuration:
     * - Max attempts: 6 (configurable)
     * - Initial interval: 1 second
     * - Exponential backoff multiplier: 2.0 (configurable)
     * - Max interval: 32 seconds
     * - Retry on: All exceptions except 404 Not Found
     * 
     * Requirements: 6.1
     * 
     * @return Retry instance for downloads
     */
    @Bean(name = "downloadRetry")
    public Retry downloadRetry() {
        RetryConfig config = RetryConfig.custom()
            .maxAttempts(maxDownloadRetries)
            .waitDuration(Duration.ofSeconds(1))
            .intervalFunction(attempt -> {
                // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s
                long backoffSeconds = (long) Math.pow(retryBackoffMultiplier, attempt - 1);
                long cappedBackoff = Math.min(backoffSeconds, 32);
                return Duration.ofSeconds(cappedBackoff).toMillis();
            })
            .retryOnException(throwable -> {
                // Don't retry on 404 (missing data for weekend/holiday)
                if (throwable instanceof WebClientResponseException.NotFound) {
                    log.debug("Not retrying on 404 Not Found (expected for weekends/holidays)");
                    return false;
                }
                // Retry on all other exceptions
                log.warn("Retrying on exception: {}", throwable.getClass().getSimpleName());
                return true;
            })
            .build();
        
        RetryRegistry registry = RetryRegistry.of(config);
        Retry retry = registry.retry("downloadRetry");
        
        // Add event listeners for logging
        retry.getEventPublisher()
            .onRetry(event -> 
                log.warn("Download retry attempt {}/{}: {}", 
                    event.getNumberOfRetryAttempts(), 
                    maxDownloadRetries,
                    event.getLastThrowable().getMessage()))
            .onSuccess(event -> 
                log.debug("Download succeeded after {} attempts", 
                    event.getNumberOfRetryAttempts()))
            .onError(event -> 
                log.error("Download failed after {} attempts: {}", 
                    event.getNumberOfRetryAttempts(),
                    event.getLastThrowable().getMessage()));
        
        log.info("Configured download retry: maxAttempts={}, backoffMultiplier={}", 
            maxDownloadRetries, retryBackoffMultiplier);
        
        return retry;
    }
    
    /**
     * Creates a retry configuration for database operations.
     * 
     * Configuration:
     * - Max attempts: 3 (configurable)
     * - Wait duration: 2 seconds (fixed)
     * - Retry on: Connection failures, transient errors
     * 
     * Requirements: 6.4
     * 
     * @return Retry instance for database operations
     */
    @Bean(name = "databaseRetry")
    public Retry databaseRetry() {
        RetryConfig config = RetryConfig.custom()
            .maxAttempts(maxDbRetries)
            .waitDuration(Duration.ofSeconds(2))
            .retryOnException(throwable -> {
                // Retry on connection failures and transient errors
                String message = throwable.getMessage();
                if (message == null) {
                    return false;
                }
                
                // Check for common transient database errors
                boolean shouldRetry = message.contains("connection") 
                    || message.contains("timeout")
                    || message.contains("deadlock")
                    || message.contains("lock")
                    || message.contains("temporary");
                
                if (shouldRetry) {
                    log.warn("Retrying database operation on transient error: {}", 
                        throwable.getMessage());
                } else {
                    log.error("Not retrying database operation on non-transient error: {}", 
                        throwable.getMessage());
                }
                
                return shouldRetry;
            })
            .build();
        
        RetryRegistry registry = RetryRegistry.of(config);
        Retry retry = registry.retry("databaseRetry");
        
        // Add event listeners for logging
        retry.getEventPublisher()
            .onRetry(event -> 
                log.warn("Database retry attempt {}/{}: {}", 
                    event.getNumberOfRetryAttempts(), 
                    maxDbRetries,
                    event.getLastThrowable().getMessage()))
            .onSuccess(event -> 
                log.debug("Database operation succeeded after {} attempts", 
                    event.getNumberOfRetryAttempts()))
            .onError(event -> 
                log.error("Database operation failed after {} attempts: {}", 
                    event.getNumberOfRetryAttempts(),
                    event.getLastThrowable().getMessage()));
        
        log.info("Configured database retry: maxAttempts={}, waitDuration=2s", maxDbRetries);
        
        return retry;
    }
}
