package com.moneyplant.engines.ingestion.kite.config;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Configuration
@ConfigurationProperties(prefix = "kite")
@Validated
@Data
public class KiteIngestionConfig {
    
    private ApiConfig api = new ApiConfig();
    private IngestionConfig ingestion = new IngestionConfig();
    
    @Data
    public static class ApiConfig {
        @NotBlank
        private String key;
        
        @NotBlank
        private String secret;
        
        @NotBlank
        private String accessToken;
        
        private String baseUrl = "https://api.kite.trade";
    }
    
    @Data
    public static class IngestionConfig {
        @Min(100)
        @Max(10000)
        private int batchSize = 1000;
        
        @Min(1)
        @Max(20)
        private int parallelRequests = 5;
        
        private RateLimitConfig rateLimit = new RateLimitConfig();
        private RetryConfig retry = new RetryConfig();
        private CircuitBreakerConfig circuitBreaker = new CircuitBreakerConfig();
    }
    
    @Data
    public static class RateLimitConfig {
        @Min(1)
        private int requestsPerSecond = 3;
        
        @Min(1)
        private int burstCapacity = 10;
    }
    
    @Data
    public static class RetryConfig {
        @Min(1)
        @Max(10)
        private int maxAttempts = 3;
        
        @Min(100)
        private long initialDelayMs = 1000;
        
        @Min(1)
        private double multiplier = 2.0;
    }
    
    @Data
    public static class CircuitBreakerConfig {
        @Min(1)
        @Max(100)
        private int failureRateThreshold = 50;
        
        @Min(1)
        private long waitDurationSeconds = 60;
        
        @Min(1)
        private int slidingWindowSize = 10;
    }
}
