package com.moneyplant.apigateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Hooks;
import reactor.core.scheduler.Schedulers;

/**
 * Configuration class for reactive components.
 * This class is responsible for managing reactive components lifecycle,
 * including proper cleanup to prevent memory leaks.
 */
@Configuration
public class ReactiveConfig implements InitializingBean, DisposableBean {
    private static final Logger logger = LoggerFactory.getLogger(ReactiveConfig.class);

    /**
     * Initializes the Reactor schedulers and hooks.
     * This method is called after the bean properties have been set.
     */
    @Override
    public void afterPropertiesSet() throws Exception {
        logger.info("Initializing Reactor schedulers and hooks");

        // Configure Schedulers to dispose executors on JVM shutdown
        Schedulers.enableMetrics();

        // Add a JVM shutdown hook to dispose of Schedulers
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.info("JVM shutdown hook triggered, disposing Schedulers");
            Schedulers.shutdownNow();
        }));

        // Configure Reactor to properly clean up resources
        // Use debug mode only in development environments
        if (logger.isDebugEnabled()) {
            Hooks.onOperatorDebug();
        }
    }

    /**
     * Cleanup method that runs when the application is shutting down.
     * This method ensures that all reactive resources are properly disposed of,
     * preventing memory leaks.
     */
    @Override
    public void destroy() throws Exception {
        logger.info("Cleaning up reactive resources");

        // Reset Reactor hooks to prevent memory leaks
        Hooks.resetOnOperatorDebug();

        // Dispose all Schedulers to prevent thread leaks
        try {
            logger.info("Disposing Reactor schedulers");
            Schedulers.shutdownNow();
        } catch (Exception e) {
            logger.warn("Error disposing Reactor schedulers: {}", e.getMessage());
        }
    }
}
