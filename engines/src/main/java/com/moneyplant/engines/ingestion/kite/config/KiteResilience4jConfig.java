package com.moneyplant.engines.ingestion.kite.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@Slf4j
public class KiteResilience4jConfig {
    
    private final KiteIngestionConfig kiteConfig;
    
    public KiteResilience4jConfig(KiteIngestionConfig kiteConfig) {
        this.kiteConfig = kiteConfig;
    }
    
    @Bean
    public RetryConfig kiteApiRetryConfig() {
        var retrySettings = kiteConfig.getIngestion().getRetry();
        
        return RetryConfig.custom()
            .maxAttempts(retrySettings.getMaxAttempts())
            .waitDuration(Duration.ofMillis(retrySettings.getInitialDelayMs()))
            .waitDuration(Duration.ofMillis(retrySettings.getInitialDelayMs()))
            .retryExceptions(
                java.io.IOException.class,
                java.util.concurrent.TimeoutException.class,
                com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException.class
            )
            .ignoreExceptions(
                com.moneyplant.engines.ingestion.kite.exception.KiteAuthenticationException.class
            )
            .build();
    }
    
    @Bean
    public Retry kiteApiRetry() {
        return Retry.of("kiteApi", kiteApiRetryConfig());
    }
    
    @Bean
    public RateLimiterConfig kiteApiRateLimiterConfig() {
        var rateLimitSettings = kiteConfig.getIngestion().getRateLimit();
        
        return RateLimiterConfig.custom()
            .limitForPeriod(rateLimitSettings.getRequestsPerSecond())
            .limitRefreshPeriod(Duration.ofSeconds(1))
            .timeoutDuration(Duration.ofSeconds(10))
            .build();
    }
    
    @Bean
    public RateLimiter kiteApiRateLimiter() {
        return RateLimiter.of("kiteApi", kiteApiRateLimiterConfig());
    }
    
    @Bean
    public CircuitBreakerConfig kiteApiCircuitBreakerConfig() {
        var circuitBreakerSettings = kiteConfig.getIngestion().getCircuitBreaker();
        
        return CircuitBreakerConfig.custom()
            .failureRateThreshold(circuitBreakerSettings.getFailureRateThreshold())
            .waitDurationInOpenState(Duration.ofSeconds(circuitBreakerSettings.getWaitDurationSeconds()))
            .slidingWindowSize(circuitBreakerSettings.getSlidingWindowSize())
            .minimumNumberOfCalls(5)
            .build();
    }
    
    @Bean
    public CircuitBreaker kiteApiCircuitBreaker() {
        CircuitBreaker circuitBreaker = CircuitBreaker.of("kiteApi", kiteApiCircuitBreakerConfig());
        
        circuitBreaker.getEventPublisher()
            .onStateTransition(event -> 
                log.info("Circuit breaker state transition: {} -> {}", 
                    event.getStateTransition().getFromState(),
                    event.getStateTransition().getToState())
            )
            .onFailureRateExceeded(event -> 
                log.warn("Circuit breaker failure rate exceeded: {}%", 
                    event.getFailureRate())
            );
        
        return circuitBreaker;
    }
}
