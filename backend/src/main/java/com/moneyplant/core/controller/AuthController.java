package com.moneyplant.core.controller;

import com.moneyplant.core.entity.User;
import com.moneyplant.core.repository.UserRepository;
import com.moneyplant.core.security.JwtTokenProvider;
import com.moneyplant.index.dtos.IndexResponseDto;
import com.moneyplant.index.services.IndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final IndexService indexService;

    @GetMapping("/public/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "MoneyPlant API is running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/test-email-login")
    public ResponseEntity<Map<String, Object>> testEmailLogin() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test endpoint working");
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in test endpoint: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Test failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/public/indices")
    public ResponseEntity<List<IndexResponseDto>> getPublicIndices() {
        try {
            List<IndexResponseDto> indices = indexService.getAllIndices();
            return ResponseEntity.ok(indices);
        } catch (Exception e) {
            log.error("Error retrieving public indices: ", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/public/oauth2/authorization/{provider}")
    public ResponseEntity<Map<String, String>> getOAuth2AuthorizationUrl(@PathVariable String provider) {
        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", "/oauth2/authorization/" + provider);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth/validate")
    public ResponseEntity<User> validateToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElse(null);
            if (user != null) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/auth/email-login")
    public ResponseEntity<Map<String, Object>> emailLogin(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Email is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Find or create user
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .email(email)
                                .firstName(email.split("@")[0]) // Use email prefix as first name
                                .fullName(email.split("@")[0]) // Use email prefix as full name
                                .provider(User.AuthProvider.GOOGLE) // Default provider
                                .providerUserId(email) // Use email as provider user ID
                                .isEnabled(true)
                                .build();
                        return userRepository.save(newUser);
                    });

            // Generate token
            String token = tokenProvider.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("user", user);
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in email login: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null || token.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Token is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validate existing token
            if (tokenProvider.validateToken(token)) {
                String email = tokenProvider.getUsernameFromToken(token);
                User user = userRepository.findByEmail(email).orElse(null);
                
                if (user != null) {
                    // Generate new token
                    String newToken = tokenProvider.generateToken(email);

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("token", newToken);
                    response.put("user", user);
                    response.put("message", "Token refreshed successfully");

                    return ResponseEntity.ok(response);
                }
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Invalid token");
            return ResponseEntity.status(401).body(errorResponse);
        } catch (Exception e) {
            log.error("Error in token refresh: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Token refresh failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
} 