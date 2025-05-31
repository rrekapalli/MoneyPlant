package com.moneyplant.apigateway.filters;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.HandlerFilterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A simple in-memory rate limiter filter that implements the token bucket algorithm.
 * This implementation does not use Redis and stores all rate limiting data in memory.
 */
@Component
public class RateLimiterFilter {
    private static final Logger logger = LoggerFactory.getLogger(RateLimiterFilter.class);

    // Store rate limiting data in memory
    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Value("${spring.cloud.gateway.rate-limiter.replenish-rate:10}")
    private int replenishRate;

    @Value("${spring.cloud.gateway.rate-limiter.burst-capacity:20}")
    private int burstCapacity;

    @Value("${spring.cloud.gateway.rate-limiter.requested-tokens:1}")
    private int requestedTokens;

    @Value("${rate-limiter.enabled:true}")
    private boolean rateLimiterEnabled;

    public HandlerFilterFunction<ServerResponse, ServerResponse> apply() {
        return (request, next) -> {
            // Skip rate limiting if disabled
            if (!rateLimiterEnabled) {
                logger.debug("Rate limiting is disabled, skipping");
                return next.handle(request);
            }

            String key = getKey(request);

            // Get or create token bucket for this key
            TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket(burstCapacity, replenishRate));

            // Try to consume tokens
            if (bucket.tryConsume(requestedTokens)) {
                // Request is allowed
                return next.handle(request);
            } else {
                // Rate limit exceeded
                logger.debug("Rate limit exceeded for key: {}", key);
                return ServerResponse.status(429).body("Too Many Requests");
            }
        };
    }

    private String getKey(ServerRequest request) {
        // You can customize the key based on client IP, user ID, etc.
        return "rate-limit:" + request.remoteAddress().orElse(null);
    }

    /**
     * Simple token bucket implementation for rate limiting.
     */
    private static class TokenBucket {
        private final int capacity;
        private final double refillRate;
        private double tokens;
        private Instant lastRefillTimestamp;

        public TokenBucket(int capacity, double refillRate) {
            this.capacity = capacity;
            this.refillRate = refillRate;
            this.tokens = capacity;
            this.lastRefillTimestamp = Instant.now();
        }

        public synchronized boolean tryConsume(int tokensToConsume) {
            refill();

            if (tokens < tokensToConsume) {
                return false;
            }

            tokens -= tokensToConsume;
            return true;
        }

        private void refill() {
            Instant now = Instant.now();
            Duration timeSinceLastRefill = Duration.between(lastRefillTimestamp, now);
            double tokensToAdd = timeSinceLastRefill.toMillis() * refillRate / 1000.0;

            if (tokensToAdd > 0) {
                tokens = Math.min(capacity, tokens + tokensToAdd);
                lastRefillTimestamp = now;
            }
        }
    }
}
