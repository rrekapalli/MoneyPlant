package com.moneyplant.engines.ingestion.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Configuration for Resilience4j circuit breakers and rate limiters.
 * Provides fault tolerance and rate limiting for external API calls.
 */
@Configuration
public class Resilience4jConfig {

    /**
     * Creates a CircuitBreakerRegistry with default configuration.
     * 
     * @return CircuitBreakerRegistry instance
     */
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50) // Open circuit if 50% of calls fail
                .waitDurationInOpenState(Duration.ofSeconds(30)) // Wait 30s before trying again
                .slidingWindowSize(10) // Consider last 10 calls
                .minimumNumberOfCalls(5) // Need at least 5 calls before calculating failure rate
                .permittedNumberOfCallsInHalfOpenState(3) // Allow 3 test calls in half-open state
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .build();

        return CircuitBreakerRegistry.of(config);
    }

    /**
     * Creates a circuit breaker for Kafka operations.
     * 
     * @param registry CircuitBreakerRegistry
     * @return CircuitBreaker for Kafka
     */
    @Bean("kafkaCircuitBreaker")
    public CircuitBreaker kafkaCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(60)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .slidingWindowSize(20)
                .minimumNumberOfCalls(10)
                .build();

        return registry.circuitBreaker("kafka", config);
    }

    /**
     * Creates a circuit breaker for NSE API operations.
     * 
     * @param registry CircuitBreakerRegistry
     * @return CircuitBreaker for NSE
     */
    @Bean("nseCircuitBreaker")
    public CircuitBreaker nseCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(60))
                .slidingWindowSize(10)
                .minimumNumberOfCalls(5)
                .build();

        return registry.circuitBreaker("nse", config);
    }

    /**
     * Creates a circuit breaker for Yahoo Finance API operations.
     * 
     * @param registry CircuitBreakerRegistry
     * @return CircuitBreaker for Yahoo Finance
     */
    @Bean("yahooCircuitBreaker")
    public CircuitBreaker yahooCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .slidingWindowSize(10)
                .minimumNumberOfCalls(5)
                .build();

        return registry.circuitBreaker("yahoo", config);
    }

    /**
     * Creates a RateLimiterRegistry with default configuration.
     * 
     * @return RateLimiterRegistry instance
     */
    @Bean
    public RateLimiterRegistry rateLimiterRegistry() {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(100)
                .limitRefreshPeriod(Duration.ofSeconds(1))
                .timeoutDuration(Duration.ofSeconds(5))
                .build();

        return RateLimiterRegistry.of(config);
    }

    /**
     * Creates a rate limiter for NSE API (1000 requests per hour).
     * 
     * @param registry RateLimiterRegistry
     * @return RateLimiter for NSE
     */
    @Bean("nseRateLimiter")
    public RateLimiter nseRateLimiter(RateLimiterRegistry registry) {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(1000)
                .limitRefreshPeriod(Duration.ofHours(1))
                .timeoutDuration(Duration.ofSeconds(10))
                .build();

        return registry.rateLimiter("nse", config);
    }

    /**
     * Creates a rate limiter for Yahoo Finance API (2000 requests per hour).
     * 
     * @param registry RateLimiterRegistry
     * @return RateLimiter for Yahoo Finance
     */
    @Bean("yahooRateLimiter")
    public RateLimiter yahooRateLimiter(RateLimiterRegistry registry) {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(2000)
                .limitRefreshPeriod(Duration.ofHours(1))
                .timeoutDuration(Duration.ofSeconds(10))
                .build();

        return registry.rateLimiter("yahoo", config);
    }
}
