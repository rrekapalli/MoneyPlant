package com.moneyplant.engines.ingestion.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Main configuration class for the Ingestion Engine.
 * Loads configuration from application.yml under the 'ingestion' prefix.
 */
@Configuration
@ConfigurationProperties(prefix = "ingestion")
public class IngestionConfig {

    private AutoStart autoStart = new AutoStart();
    private Providers providers = new Providers();
    private Storage storage = new Storage();
    private Performance performance = new Performance();

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
        private NseProvider nse = new NseProvider();
        private YahooProvider yahoo = new YahooProvider();

        public static class NseProvider {
            private boolean enabled = true;
            private String apiUrl = "https://www.nseindia.com/api";
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

        public static class YahooProvider {
            private boolean enabled = true;
            private String apiUrl = "https://query1.finance.yahoo.com";
            private int rateLimitPerHour = 2000;
            private int timeoutSec = 10;
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

        public NseProvider getNse() {
            return nse;
        }

        public void setNse(NseProvider nse) {
            this.nse = nse;
        }

        public YahooProvider getYahoo() {
            return yahoo;
        }

        public void setYahoo(YahooProvider yahoo) {
            this.yahoo = yahoo;
        }
    }

    public static class Storage {
        private int batchSize = 1000;
        private int flushIntervalMs = 5000;

        public int getBatchSize() {
            return batchSize;
        }

        public void setBatchSize(int batchSize) {
            this.batchSize = batchSize;
        }

        public int getFlushIntervalMs() {
            return flushIntervalMs;
        }

        public void setFlushIntervalMs(int flushIntervalMs) {
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
}
