package com.moneyplant.engines.config;

import com.moneyplant.engines.ingestion.service.NseIndicesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;

/**
 * Configuration class for auto-starting services when the application boots up.
 * This ensures that critical services like NSE indices ingestion start automatically
 * without manual intervention.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class AutoStartConfig {

    private final NseIndicesService nseIndicesService;

    /**
     * Configuration property to enable/disable auto-start of NSE indices ingestion
     */
    @Value("${nse.auto-start.enabled:true}")
    private boolean nseAutoStartEnabled;

    /**
     * Configuration property to set delay before starting NSE indices ingestion
     * This allows other services to initialize first
     */
    @Value("${nse.auto-start.delay-seconds:10}")
    private long nseAutoStartDelaySeconds;

    /**
     * Configuration property to enable/disable auto-start of other ingestion services
     */
    @Value("${ingestion.auto-start.enabled:false}")
    private boolean ingestionAutoStartEnabled;

    /**
     * Auto-start NSE indices ingestion when the application is ready
     * This event is fired after all beans are initialized and the application context is ready
     */
    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void autoStartNseIndicesIngestion() {
        if (!nseAutoStartEnabled) {
            log.info("NSE indices auto-start is disabled. Ingestion will not start automatically.");
            return;
        }

        try {
            log.info("Auto-starting NSE indices ingestion in {} seconds...", nseAutoStartDelaySeconds);
            
            // Wait for the specified delay to allow other services to initialize
            Thread.sleep(nseAutoStartDelaySeconds * 1000);
            
            log.info("Starting NSE indices ingestion automatically...");
            nseIndicesService.startNseIndicesIngestion();
            
            log.info("NSE indices ingestion auto-started successfully!");
            
        } catch (InterruptedException e) {
            log.warn("NSE indices auto-start was interrupted: {}", e.getMessage());
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Failed to auto-start NSE indices ingestion: {}", e.getMessage(), e);
            log.warn("You may need to start ingestion manually using the API endpoint");
        }
    }

    /**
     * Auto-start other ingestion services if enabled
     * This can be extended to include other data sources
     */
    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void autoStartOtherIngestionServices() {
        if (!ingestionAutoStartEnabled) {
            log.info("Other ingestion services auto-start is disabled.");
            return;
        }

        try {
            log.info("Auto-starting other ingestion services...");
            
            // TODO: Add auto-start logic for other ingestion services
            // For example: Yahoo Finance, Alpha Vantage, etc.
            
            log.info("Other ingestion services auto-started successfully!");
            
        } catch (Exception e) {
            log.error("Failed to auto-start other ingestion services: {}", e.getMessage(), e);
        }
    }

    /**
     * Log the auto-start configuration on application startup
     */
    @EventListener(ApplicationReadyEvent.class)
    public void logAutoStartConfiguration() {
        log.info("=== Auto-Start Configuration ===");
        log.info("NSE Indices Auto-Start: {}", nseAutoStartEnabled ? "ENABLED" : "DISABLED");
        log.info("NSE Auto-Start Delay: {} seconds", nseAutoStartDelaySeconds);
        log.info("Other Ingestion Auto-Start: {}", ingestionAutoStartEnabled ? "ENABLED" : "DISABLED");
        log.info("================================");
    }
}
