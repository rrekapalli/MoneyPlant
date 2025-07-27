package com.moneyplant.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the MoneyPlant application.
 * This configuration allows direct access to the Angular frontend and Swagger UI endpoints.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                // Swagger UI endpoints
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v1/api-docs/**").permitAll()
                // Angular frontend static resources
                .requestMatchers("/", "/index.html", "/*.js", "/chunk-*.js", "/*.css", "/*.ico", "/assets/**", "/*.woff2", "/*.woff", "/*.ttf").permitAll()
                // API endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                // Allow all other requests to access the Angular frontend
                .anyRequest().permitAll()
            )
            .csrf(csrf -> csrf.disable())
            .httpBasic(httpBasic -> {});

        return http.build();
    }
}
