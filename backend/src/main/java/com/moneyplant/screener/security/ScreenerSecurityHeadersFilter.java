package com.moneyplant.screener.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Security headers filter for screener endpoints.
 * Applies security headers specifically for screener API endpoints.
 */
@Component
@Slf4j
@ConfigurationProperties(prefix = "screener.security.headers")
public class ScreenerSecurityHeadersFilter extends OncePerRequestFilter {

    // Configuration properties for security headers
    private boolean enabled = true;
    private boolean strictTransportSecurity = true;
    private boolean contentTypeOptions = true;
    private boolean frameOptions = true;
    private boolean xssProtection = true;
    private boolean contentSecurityPolicy = false; // Disabled by default for API endpoints
    private String cspDirectives = "default-src 'self'";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (enabled) {
            applySecurityHeaders(response);
        }

        filterChain.doFilter(request, response);
    }

    private void applySecurityHeaders(HttpServletResponse response) {
        // Strict Transport Security (HSTS)
        if (strictTransportSecurity) {
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        // Prevent MIME type sniffing
        if (contentTypeOptions) {
            response.setHeader("X-Content-Type-Options", "nosniff");
        }

        // Prevent clickjacking
        if (frameOptions) {
            response.setHeader("X-Frame-Options", "DENY");
        }

        // XSS Protection
        if (xssProtection) {
            response.setHeader("X-XSS-Protection", "1; mode=block");
        }

        // Content Security Policy (optional for API endpoints)
        if (contentSecurityPolicy && cspDirectives != null && !cspDirectives.isEmpty()) {
            response.setHeader("Content-Security-Policy", cspDirectives);
        }

        // API-specific headers
        response.setHeader("X-API-Version", "1.0");
        response.setHeader("X-Screener-API", "true");
        
        // Cache control for API responses
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        log.debug("Applied security headers to screener API response");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Only apply to screener API endpoints
        String path = request.getRequestURI();
        return !path.startsWith("/api/screeners/");
    }

    // Configuration property getters and setters
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isStrictTransportSecurity() {
        return strictTransportSecurity;
    }

    public void setStrictTransportSecurity(boolean strictTransportSecurity) {
        this.strictTransportSecurity = strictTransportSecurity;
    }

    public boolean isContentTypeOptions() {
        return contentTypeOptions;
    }

    public void setContentTypeOptions(boolean contentTypeOptions) {
        this.contentTypeOptions = contentTypeOptions;
    }

    public boolean isFrameOptions() {
        return frameOptions;
    }

    public void setFrameOptions(boolean frameOptions) {
        this.frameOptions = frameOptions;
    }

    public boolean isXssProtection() {
        return xssProtection;
    }

    public void setXssProtection(boolean xssProtection) {
        this.xssProtection = xssProtection;
    }

    public boolean isContentSecurityPolicy() {
        return contentSecurityPolicy;
    }

    public void setContentSecurityPolicy(boolean contentSecurityPolicy) {
        this.contentSecurityPolicy = contentSecurityPolicy;
    }

    public String getCspDirectives() {
        return cspDirectives;
    }

    public void setCspDirectives(String cspDirectives) {
        this.cspDirectives = cspDirectives;
    }
}