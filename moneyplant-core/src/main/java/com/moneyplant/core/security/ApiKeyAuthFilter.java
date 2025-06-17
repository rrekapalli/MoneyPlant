package com.moneyplant.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Filter for API key validation.
 * This filter checks for the presence of a valid API key in the request header.
 * If a valid API key is found, it sets the authentication in the security context.
 */
@Slf4j
@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(ApiKeyAuthFilter.class);
    private static final String API_KEY_HEADER = "X-API-KEY";

    @Value("${api.key:}")
    private String apiKey;

    @Value("${api.key.enabled:false}")
    private boolean apiKeyEnabled;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip API key validation if it's not enabled
        if (!apiKeyEnabled) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get API key from request header
        String requestApiKey = request.getHeader(API_KEY_HEADER);

        // Validate API key
        if (requestApiKey != null && requestApiKey.equals(apiKey)) {
            // Create authentication with API_USER role
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_API_USER"));
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken("api-user", null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
