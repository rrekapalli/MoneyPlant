package com.moneyplant.engines.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the Ingestion Engine API.
 * 
 * For now, this provides a minimal security setup that allows all requests.
 * In production, this should be integrated with JWT authentication from the backend module.
 * 
 * Requirements: 12.3
 * 
 * TODO: Integrate with JWT authentication
 * - Add JwtAuthenticationFilter from backend module
 * - Configure JWT token validation
 * - Protect API endpoints based on roles
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    /**
     * Configure security filter chain.
     * 
     * Current configuration:
     * - Disables CSRF (stateless API)
     * - Permits all requests (temporary - should be secured with JWT)
     * - Stateless session management
     * 
     * Production configuration should:
     * - Require JWT authentication for /api/v1/** endpoints
     * - Allow public access to /actuator/health and /actuator/info
     * - Validate JWT tokens using JwtTokenProvider from backend
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/api/*/health").permitAll()
                
                // API endpoints - currently permitAll, should be authenticated in production
                // TODO: Change to .authenticated() and add JWT filter
                .requestMatchers("/api/v1/**").permitAll()
                .requestMatchers("/api/**").permitAll()
                
                // Deny all other requests
                .anyRequest().denyAll()
            );
        
        // TODO: Add JWT authentication filter
        // http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * TODO: Create JWT authentication filter bean
     * 
     * This should:
     * 1. Extract JWT token from Authorization header
     * 2. Validate token using JwtTokenProvider
     * 3. Set authentication in SecurityContext
     * 
     * Example implementation:
     * 
     * @Bean
     * public JwtAuthenticationFilter jwtAuthenticationFilter() {
     *     return new JwtAuthenticationFilter(tokenProvider, userDetailsService);
     * }
     */
}
