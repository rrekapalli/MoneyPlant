package com.moneyplant.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter for adding security headers to API responses.
 * These headers help protect against common web vulnerabilities like XSS, clickjacking, etc.
 */
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(SecurityHeadersFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Content-Security-Policy: Helps prevent XSS attacks
        response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'");

        // X-Content-Type-Options: Prevents MIME type sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");

        // X-Frame-Options: Prevents clickjacking
        response.setHeader("X-Frame-Options", "DENY");

        // X-XSS-Protection: Enables XSS filtering in browsers
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Strict-Transport-Security: Enforces HTTPS
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        // Referrer-Policy: Controls information in the Referer header
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Cache-Control: Prevents caching of sensitive information
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        // Feature-Policy: Restricts which browser features can be used
        response.setHeader("Feature-Policy", "camera 'none'; microphone 'none'; geolocation 'none'");

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }
}
