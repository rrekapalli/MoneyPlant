package com.moneyplant.screener.config;

import com.moneyplant.screener.security.ScreenerJwtAuthenticationFilter;
import com.moneyplant.screener.security.ScreenerRateLimitingFilter;
import com.moneyplant.screener.security.ScreenerSecurityHeadersFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security configuration specifically for screener endpoints.
 * Integrates with existing screener security infrastructure including JWT authentication,
 * CORS configuration, and audit logging.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@Slf4j
@ConfigurationProperties(prefix = "screener.security")
public class ScreenerSecurityConfig {

    private final ScreenerJwtAuthenticationFilter screenerJwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ScreenerRateLimitingFilter screenerRateLimitingFilter;

    // Configuration properties for screener security
    private boolean rateLimitingEnabled = true;
    private int maxRequestsPerMinute = 100;
    private int maxRequestsPerHour = 1000;
    private boolean auditLoggingEnabled = true;
    private boolean corsEnabled = true;

    /**
     * Security filter chain specifically for screener and criteria endpoints.
     * This configuration has higher precedence than the main security config for screener paths.
     */
    @Bean
    @Order(1) // Higher precedence than main security config
    public SecurityFilterChain screenerSecurityFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring screener security filter chain with JWT authentication, CORS, and rate limiting");
        
        http
            // Apply to screener endpoints only
            .securityMatcher("/api/screeners/**")
            
            // Disable CSRF for API endpoints
            .csrf(AbstractHttpConfigurer::disable)
            
            // Apply existing CORS configuration
            .cors(cors -> {
                if (corsEnabled) {
                    cors.configurationSource(corsConfigurationSource);
                    log.debug("CORS enabled for screener endpoints using existing configuration");
                } else {
                    cors.disable();
                    log.debug("CORS disabled for screener endpoints");
                }
            })
            
            // Stateless session management for API
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Authorization rules for screener endpoints
            .authorizeHttpRequests(authz -> authz
                // All screener endpoints require authentication
                .requestMatchers("/api/screeners/**").authenticated()
                
                .anyRequest().denyAll()
            )
            
            // Add screener-specific JWT authentication filter
            .addFilterBefore(screenerJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Add rate limiting filter if enabled
            .addFilterAfter(screenerRateLimitingFilter, ScreenerJwtAuthenticationFilter.class);

        log.info("Screener security configuration completed - JWT: enabled, CORS: {}, Rate Limiting: {}", 
            corsEnabled, rateLimitingEnabled);
        
        return http.build();
    }

    /**
     * Configuration for screener security headers.
     * Applies security headers specifically for screener endpoints.
     */
    @Bean
    public ScreenerSecurityHeadersFilter screenerSecurityHeadersFilter() {
        return new ScreenerSecurityHeadersFilter();
    }

    // Getters and setters for configuration properties
    public boolean isRateLimitingEnabled() {
        return rateLimitingEnabled;
    }

    public void setRateLimitingEnabled(boolean rateLimitingEnabled) {
        this.rateLimitingEnabled = rateLimitingEnabled;
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

    public boolean isAuditLoggingEnabled() {
        return auditLoggingEnabled;
    }

    public void setAuditLoggingEnabled(boolean auditLoggingEnabled) {
        this.auditLoggingEnabled = auditLoggingEnabled;
    }

    public boolean isCorsEnabled() {
        return corsEnabled;
    }

    public void setCorsEnabled(boolean corsEnabled) {
        this.corsEnabled = corsEnabled;
    }
}