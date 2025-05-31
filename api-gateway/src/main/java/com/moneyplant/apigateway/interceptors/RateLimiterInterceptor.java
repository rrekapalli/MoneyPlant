package com.moneyplant.apigateway.interceptors;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A simple in-memory rate limiter interceptor that implements the token bucket algorithm.
 * This implementation does not use Redis and stores all rate limiting data in memory.
 */
@Component
public class RateLimiterInterceptor implements HandlerInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(RateLimiterInterceptor.class);

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

    public RateLimiterInterceptor() {
        logger.info("Initializing in-memory RateLimiterInterceptor");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Skip rate limiting if disabled
        if (!rateLimiterEnabled) {
            logger.debug("Rate limiting is disabled, skipping");
            return true;
        }

        String clientId = getClientId(request);

        // Skip rate limiting for certain paths if needed
        String path = request.getRequestURI();
        if (path.contains("/swagger-ui") || path.contains("/api-docs") || path.contains("/actuator")) {
            return true;
        }

        // Get or create token bucket for this client
        TokenBucket bucket = buckets.computeIfAbsent(clientId, k -> 
            new TokenBucket(burstCapacity, replenishRate));

        // Try to consume tokens
        if (bucket.tryConsume(requestedTokens)) {
            // Request is allowed
            return true;
        } else {
            // Rate limit exceeded
            logger.debug("Rate limit exceeded for client: {}", clientId);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Rate limit exceeded. Please try again later.");
            return false;
        }
    }

    private String getClientId(HttpServletRequest request) {
        // You can use IP address, user ID, API key, etc.
        // For simplicity, we'll use the IP address
        String clientIp = request.getRemoteAddr();
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = "unknown";
        }
        return "rate-limit:" + clientIp;
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
