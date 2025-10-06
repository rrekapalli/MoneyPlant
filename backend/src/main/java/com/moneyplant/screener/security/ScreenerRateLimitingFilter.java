package com.moneyplant.screener.security;

import com.moneyplant.screener.services.CriteriaAuditService;
import com.moneyplant.screener.services.CurrentUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting filter for screener endpoints.
 * Integrates with existing screener audit logging infrastructure.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConfigurationProperties(prefix = "screener.security.rate-limit")
public class ScreenerRateLimitingFilter extends OncePerRequestFilter {

    private final CriteriaAuditService auditService;
    private final CurrentUserService currentUserService;

    // Configuration properties
    private boolean enabled = true;
    private int maxRequestsPerMinute = 100;
    private int maxRequestsPerHour = 1000;
    private int windowSizeMinutes = 1;
    private int windowSizeHours = 60;

    // In-memory rate limiting storage (in production, consider Redis)
    private final ConcurrentHashMap<String, UserRateLimit> userRateLimits = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Get user ID from security context (set by ScreenerJwtAuthenticationFilter)
            Long userId = currentUserService.getCurrentUserId();
            if (userId == null) {
                // No authenticated user, skip rate limiting
                filterChain.doFilter(request, response);
                return;
            }

            String userKey = userId.toString();
            String clientIp = getClientIpAddress(request);
            String endpoint = request.getRequestURI();

            // Check rate limits
            if (isRateLimited(userKey, clientIp, endpoint)) {
                // Rate limit exceeded
                auditService.logSecurityEvent("RATE_LIMIT_EXCEEDED", 
                    String.format("User %s from IP %s exceeded rate limit for endpoint %s", 
                        userId, clientIp, endpoint));

                response.setStatus(429); // HTTP 429 Too Many Requests
                response.setHeader("X-RateLimit-Limit-Minute", String.valueOf(maxRequestsPerMinute));
                response.setHeader("X-RateLimit-Limit-Hour", String.valueOf(maxRequestsPerHour));
                response.setHeader("X-RateLimit-Remaining", "0");
                response.setHeader("X-RateLimit-Reset", String.valueOf(getNextResetTime()));
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Rate limit exceeded\",\"code\":\"RATE_LIMIT_EXCEEDED\"}");
                
                log.warn("Rate limit exceeded for user {} from IP {} on endpoint {}", userId, clientIp, endpoint);
                return;
            }

            // Record the request
            recordRequest(userKey);

            // Add rate limit headers to response
            UserRateLimit rateLimit = userRateLimits.get(userKey);
            if (rateLimit != null) {
                response.setHeader("X-RateLimit-Limit-Minute", String.valueOf(maxRequestsPerMinute));
                response.setHeader("X-RateLimit-Limit-Hour", String.valueOf(maxRequestsPerHour));
                response.setHeader("X-RateLimit-Remaining-Minute", 
                    String.valueOf(Math.max(0, maxRequestsPerMinute - rateLimit.getMinuteCount())));
                response.setHeader("X-RateLimit-Remaining-Hour", 
                    String.valueOf(Math.max(0, maxRequestsPerHour - rateLimit.getHourCount())));
                response.setHeader("X-RateLimit-Reset", String.valueOf(getNextResetTime()));
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("Error in rate limiting filter", e);
            // Don't block requests due to rate limiting errors
            filterChain.doFilter(request, response);
        }
    }

    private boolean isRateLimited(String userKey, String clientIp, String endpoint) {
        UserRateLimit rateLimit = userRateLimits.computeIfAbsent(userKey, k -> new UserRateLimit());
        
        Instant now = Instant.now();
        
        // Clean up old entries
        rateLimit.cleanupOldEntries(now);
        
        // Check minute limit
        if (rateLimit.getMinuteCount() >= maxRequestsPerMinute) {
            log.debug("Minute rate limit exceeded for user {}: {} >= {}", 
                userKey, rateLimit.getMinuteCount(), maxRequestsPerMinute);
            return true;
        }
        
        // Check hour limit
        if (rateLimit.getHourCount() >= maxRequestsPerHour) {
            log.debug("Hour rate limit exceeded for user {}: {} >= {}", 
                userKey, rateLimit.getHourCount(), maxRequestsPerHour);
            return true;
        }
        
        return false;
    }

    private void recordRequest(String userKey) {
        UserRateLimit rateLimit = userRateLimits.get(userKey);
        if (rateLimit != null) {
            rateLimit.recordRequest(Instant.now());
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private long getNextResetTime() {
        return Instant.now().plus(1, ChronoUnit.MINUTES).getEpochSecond();
    }

    /**
     * Inner class to track rate limits per user
     */
    private static class UserRateLimit {
        private final ConcurrentHashMap<Long, AtomicInteger> minuteWindows = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<Long, AtomicInteger> hourWindows = new ConcurrentHashMap<>();

        public void recordRequest(Instant now) {
            long minuteWindow = now.truncatedTo(ChronoUnit.MINUTES).getEpochSecond();
            long hourWindow = now.truncatedTo(ChronoUnit.HOURS).getEpochSecond();
            
            minuteWindows.computeIfAbsent(minuteWindow, k -> new AtomicInteger(0)).incrementAndGet();
            hourWindows.computeIfAbsent(hourWindow, k -> new AtomicInteger(0)).incrementAndGet();
        }

        public int getMinuteCount() {
            long currentMinute = Instant.now().truncatedTo(ChronoUnit.MINUTES).getEpochSecond();
            AtomicInteger count = minuteWindows.get(currentMinute);
            return count != null ? count.get() : 0;
        }

        public int getHourCount() {
            long currentHour = Instant.now().truncatedTo(ChronoUnit.HOURS).getEpochSecond();
            AtomicInteger count = hourWindows.get(currentHour);
            return count != null ? count.get() : 0;
        }

        public void cleanupOldEntries(Instant now) {
            long cutoffMinute = now.minus(2, ChronoUnit.MINUTES).truncatedTo(ChronoUnit.MINUTES).getEpochSecond();
            long cutoffHour = now.minus(2, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS).getEpochSecond();
            
            minuteWindows.entrySet().removeIf(entry -> entry.getKey() < cutoffMinute);
            hourWindows.entrySet().removeIf(entry -> entry.getKey() < cutoffHour);
        }
    }

    // Configuration property getters and setters
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getMaxRequestsPerMinute() {
        return maxRequestsPerMinute;
    }

    public void setMaxRequestsPerMinute(int maxRequestsPerMinute) {
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }

    public int getMaxRequestsPerHour() {
        return maxRequestsPerHour;
    }

    public void setMaxRequestsPerHour(int maxRequestsPerHour) {
        this.maxRequestsPerHour = maxRequestsPerHour;
    }

    public int getWindowSizeMinutes() {
        return windowSizeMinutes;
    }

    public void setWindowSizeMinutes(int windowSizeMinutes) {
        this.windowSizeMinutes = windowSizeMinutes;
    }

    public int getWindowSizeHours() {
        return windowSizeHours;
    }

    public void setWindowSizeHours(int windowSizeHours) {
        this.windowSizeHours = windowSizeHours;
    }
}