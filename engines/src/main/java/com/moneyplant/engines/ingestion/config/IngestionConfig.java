package com.moneyplant.engines.ingestion.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration class for the Ingestion Engine.
 * 
 * This class configures:
 * - Thread pools for async processing
 * - Scheduling for periodic tasks
 * - Ingestion-specific properties
 * 
 * @author MoneyPlant Team
 */
@Configuration
@EnableAsync
@EnableScheduling
public class IngestionConfig {

    /**
     * Thread pool executor for async data processing tasks.
     * Used for parallel symbol fetching and data processing.
     * 
     * Configuration:
     * - Core pool size: 10 threads
     * - Max pool size: 50 threads
     * - Queue capacity: 1000 tasks
     * - Thread name prefix: "ingestion-async-"
     * 
     * @return configured thread pool executor
     */
    @Bean(name = "ingestionTaskExecutor")
    public Executor ingestionTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("ingestion-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }

    /**
     * Thread pool executor for scheduled tasks.
     * Used for periodic jobs like symbol master refresh and end-of-day archival.
     * 
     * Configuration:
     * - Core pool size: 5 threads
     * - Max pool size: 10 threads
     * - Queue capacity: 100 tasks
     * - Thread name prefix: "ingestion-scheduler-"
     * 
     * @return configured thread pool executor for scheduled tasks
     */
    @Bean(name = "ingestionSchedulerExecutor")
    public Executor ingestionSchedulerExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ingestion-scheduler-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    /**
     * Configuration properties for ingestion providers.
     * Binds to 'ingestion' prefix in application.yml.
     * 
     * @return ingestion properties
     */
    @Bean
    @ConfigurationProperties(prefix = "ingestion")
    public IngestionProperties ingestionProperties() {
        return new IngestionProperties();
    }

    /**
     * Properties class for ingestion configuration.
     * Maps to YAML configuration under 'ingestion' key.
     */
    public static class IngestionProperties {
        private AutoStart autoStart = new AutoStart();
        private Providers providers = new Providers();
        private Storage storage = new Storage();
        private Performance performance = new Performance();

        public AutoStart getAutoStart() {
            return autoStart;
        }

        public void setAutoStart(AutoStart autoStart) {
            this.autoStart = autoStart;
        }

        public Providers getProviders() {
            return providers;
        }

        public void setProviders(Providers providers) {
            this.providers = providers;
        }

        public Storage getStorage() {
            return storage;
        }

        public void setStorage(Storage storage) {
            this.storage = storage;
        }

        public Performance getPerformance() {
            return performance;
        }

        public void setPerformance(Performance performance) {
            this.performance = performance;
        }

        public static class AutoStart {
            private boolean enabled = false;
            private int delaySeconds = 10;

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }

            public int getDelaySeconds() {
                return delaySeconds;
            }

            public void setDelaySeconds(int delaySeconds) {
                this.delaySeconds = delaySeconds;
            }
        }

        public static class Providers {
            private ProviderConfig nse = new ProviderConfig();
            private ProviderConfig yahoo = new ProviderConfig();

            public ProviderConfig getNse() {
                return nse;
            }

            public void setNse(ProviderConfig nse) {
                this.nse = nse;
            }

            public ProviderConfig getYahoo() {
                return yahoo;
            }

            public void setYahoo(ProviderConfig yahoo) {
                this.yahoo = yahoo;
            }
        }

        public static class ProviderConfig {
            private boolean enabled = true;
            private String apiUrl;
            private int rateLimitPerHour = 1000;
            private int timeoutSec = 15;
            private int retryAttempts = 3;

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }

            public String getApiUrl() {
                return apiUrl;
            }

            public void setApiUrl(String apiUrl) {
                this.apiUrl = apiUrl;
            }

            public int getRateLimitPerHour() {
                return rateLimitPerHour;
            }

            public void setRateLimitPerHour(int rateLimitPerHour) {
                this.rateLimitPerHour = rateLimitPerHour;
            }

            public int getTimeoutSec() {
                return timeoutSec;
            }

            public void setTimeoutSec(int timeoutSec) {
                this.timeoutSec = timeoutSec;
            }

            public int getRetryAttempts() {
                return retryAttempts;
            }

            public void setRetryAttempts(int retryAttempts) {
                this.retryAttempts = retryAttempts;
            }
        }

        public static class Storage {
            private int batchSize = 1000;
            private long flushIntervalMs = 5000;

            public int getBatchSize() {
                return batchSize;
            }

            public void setBatchSize(int batchSize) {
                this.batchSize = batchSize;
            }

            public long getFlushIntervalMs() {
                return flushIntervalMs;
            }

            public void setFlushIntervalMs(long flushIntervalMs) {
                this.flushIntervalMs = flushIntervalMs;
            }
        }

        public static class Performance {
            private int parallelism = 10;
            private int bufferSize = 10000;

            public int getParallelism() {
                return parallelism;
            }

            public void setParallelism(int parallelism) {
                this.parallelism = parallelism;
            }

            public int getBufferSize() {
                return bufferSize;
            }

            public void setBufferSize(int bufferSize) {
                this.bufferSize = bufferSize;
            }
        }
    }
}
