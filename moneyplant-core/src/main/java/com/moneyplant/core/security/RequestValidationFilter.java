package com.moneyplant.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;
import java.util.regex.Pattern;

/**
 * Filter for validating and sanitizing request parameters and headers to prevent injection attacks.
 * This filter runs before other filters to ensure all requests are validated.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestValidationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestValidationFilter.class);

    // Pattern for detecting common SQL injection patterns
    private static final Pattern SQL_INJECTION_PATTERN = 
        Pattern.compile("('(''|[^'])*')|(--)|(\\b(SELECT|UPDATE|INSERT|DELETE|FROM|WHERE|DROP|ALTER|EXEC|UNION|CREATE|TABLE|DECLARE|CAST|SCRIPT)\\b)", 
                        Pattern.CASE_INSENSITIVE);

    // Pattern for detecting common XSS patterns
    private static final Pattern XSS_PATTERN = 
        Pattern.compile("<script>(.*?)</script>|<.*?javascript:.*?>|<.*?\\s+on.*?>", 
                        Pattern.CASE_INSENSITIVE);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Validate request parameters
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String[] paramValues = request.getParameterValues(paramName);

            if (paramValues != null) {
                for (String paramValue : paramValues) {
                    if (isInvalidInput(paramValue)) {
                        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid request parameter detected");
                        return;
                    }
                }
            }
        }

        // Validate request headers
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);

            if (headerValue != null && isInvalidInput(headerValue)) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid request header detected");
                return;
            }
        }

        // Continue with the filter chain if validation passes
        filterChain.doFilter(request, response);
    }

    /**
     * Checks if the input contains potential injection patterns.
     * 
     * @param input The input to validate
     * @return true if the input contains potential injection patterns, false otherwise
     */
    private boolean isInvalidInput(String input) {
        if (input == null || input.isEmpty()) {
            return false;
        }

        // Check for SQL injection patterns
        if (SQL_INJECTION_PATTERN.matcher(input).find()) {
            return true;
        }

        // Check for XSS patterns
        if (XSS_PATTERN.matcher(input).find()) {
            return true;
        }

        return false;
    }
}
