package com.moneyplant.core.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class FrontendController {

    /**
     * Serve the frontend application for all frontend routes.
     * This serves the static index.html for all frontend routes.
     */
    @GetMapping({"/", "/portfolios", "/portfolios/**", 
                 "/holdings", "/holdings/**", "/positions", "/positions/**",  "/screener", "/screener/**",
                 "/market", "/market/**", "/strategies", "/strategies/**",
                 "/watchlists", "/watchlists/**", "/dashboard", "/dashboard/**",
                 "/login", "/not-found"})
    public ResponseEntity<String> serveFrontend(HttpServletRequest request) {
        // Skip API requests - let them be handled by API controllers
        String requestUri = request.getRequestURI();
        if (requestUri.startsWith("/api/") || requestUri.startsWith("/actuator/")) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // Read the index.html file from static resources
            ClassPathResource resource = new ClassPathResource("static/index.html");
            String content = new String(resource.getInputStream().readAllBytes());
            
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html")
                    .body(content);
        } catch (Exception e) {
            log.error("Error serving frontend: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
