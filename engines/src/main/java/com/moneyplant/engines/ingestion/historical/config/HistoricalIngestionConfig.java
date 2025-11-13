package com.moneyplant.engines.ingestion.historical.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Configuration properties for NSE Historical Data Ingestion.
 * Maps to 'ingestion.providers.nse.historical' in application.yml.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
@Configuration
@ConfigurationProperties(prefix = "ingestion.providers.nse.historical")
@Data
@Validated
@Slf4j
public class HistoricalIngestionConfig {
    
    /**
     * Base URL for NSE website.
     * Default: https://www.nseindia.com
     * Requirement: 7.1
     */
    @NotBlank(message = "Base URL must not be blank")
    private String baseUrl = "https://www.nseindia.com";
    
    /**
     * Delay between consecutive downloads in milliseconds.
     * Used to avoid rate limiting by NSE.
     * Default: 300ms
     * Requirement: 7.2
     */
    @Min(value = 0, message = "Download delay must be non-negative")
    private int downloadDelayMs = 300;
    
    /**
     * Maximum number of retry attempts for failed downloads.
     * Default: 6
     * Requirement: 7.3
     */
    @Min(value = 1, message = "Max retries must be at least 1")
    private int maxRetries = 6;
    
    /**
     * Backoff multiplier for exponential retry.
     * Each retry will wait: baseDelay * (multiplier ^ attemptNumber)
     * Default: 2.0
     * Requirement: 7.4
     */
    @Min(value = 1, message = "Retry backoff multiplier must be at least 1.0")
    private double retryBackoffMultiplier = 2.0;
    
    /**
     * Job timeout in hours.
     * Jobs exceeding this duration will be marked as TIMEOUT.
     * Default: 6 hours
     * Requirement: 7.5
     */
    @Min(value = 1, message = "Job timeout must be at least 1 hour")
    private int jobTimeoutHours = 6;
    
    /**
     * Staging directory for temporary CSV files.
     * Each job creates a subdirectory: {stagingDirectory}/{jobId}/
     * Default: /tmp/bhav_staging
     * Requirement: 7.6
     */
    @NotBlank(message = "Staging directory must not be blank")
    private String stagingDirectory = "/tmp/bhav_staging";
    
    /**
     * Default start date for full ingestion when no existing data is found.
     * Format: yyyy-MM-dd
     * Default: 1998-01-01 (NSE historical data availability)
     * Requirement: 7.6
     */
    @NotNull(message = "Default start date must not be null")
    private LocalDate defaultStartDate = LocalDate.of(1998, 1, 1);
    
    /**
     * Validate configuration on startup and log settings.
     * Requirement: 7.9
     */
    @PostConstruct
    public void init() {
        log.info("=== NSE Historical Ingestion Configuration ===");
        log.info("Base URL: {}", baseUrl);
        log.info("Download Delay: {}ms", downloadDelayMs);
        log.info("Max Retries: {}", maxRetries);
        log.info("Retry Backoff Multiplier: {}", retryBackoffMultiplier);
        log.info("Job Timeout: {} hours", jobTimeoutHours);
        log.info("Staging Directory: {}", stagingDirectory);
        log.info("Default Start Date: {}", defaultStartDate);
        log.info("==============================================");
        
        // Validate configuration
        validateConfiguration();
    }
    
    /**
     * Validate configuration values.
     * Fails fast if configuration is invalid.
     * Requirement: 7.9
     */
    private void validateConfiguration() {
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            throw new IllegalStateException("Base URL must be configured");
        }
        
        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
            throw new IllegalStateException("Base URL must start with http:// or https://");
        }
        
        if (downloadDelayMs < 0) {
            throw new IllegalStateException("Download delay must be non-negative");
        }
        
        if (maxRetries < 1) {
            throw new IllegalStateException("Max retries must be at least 1");
        }
        
        if (retryBackoffMultiplier < 1.0) {
            throw new IllegalStateException("Retry backoff multiplier must be at least 1.0");
        }
        
        if (jobTimeoutHours < 1) {
            throw new IllegalStateException("Job timeout must be at least 1 hour");
        }
        
        if (stagingDirectory == null || stagingDirectory.trim().isEmpty()) {
            throw new IllegalStateException("Staging directory must be configured");
        }
        
        if (defaultStartDate == null) {
            throw new IllegalStateException("Default start date must be configured");
        }
        
        if (defaultStartDate.isAfter(LocalDate.now())) {
            throw new IllegalStateException("Default start date cannot be in the future");
        }
        
        log.info("Configuration validation passed");
    }
    
    /**
     * Get the full URL for bhavcopy download.
     * Format: {baseUrl}/content/historical/EQUITIES/{year}/{month}/cm{DDMMMYYYY}bhav.csv.zip
     * 
     * @param date The date for which to download bhavcopy
     * @return Full URL for bhavcopy download
     */
    public String getBhavCopyUrl(LocalDate date) {
        String year = String.valueOf(date.getYear());
        String month = date.getMonth().toString().substring(0, 3); // JAN, FEB, etc.
        String dayMonthYear = String.format("%02d%s%d", 
            date.getDayOfMonth(), 
            month, 
            date.getYear());
        
        return String.format("%s/content/historical/EQUITIES/%s/%s/cm%sbhav.csv.zip",
            baseUrl, year, month, dayMonthYear.toUpperCase());
    }
}
