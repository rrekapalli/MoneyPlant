package com.moneyplant.core.controller;

import com.moneyplant.core.entity.User;
import com.moneyplant.core.repository.UserRepository;
import com.moneyplant.core.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    @GetMapping("/public/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "MoneyPlant API is running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/oauth2/authorization/{provider}")
    public ResponseEntity<Map<String, String>> initiateOAuth2Login(@PathVariable String provider) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Redirecting to " + provider + " OAuth2 login");
        response.put("redirectUrl", "/oauth2/authorization/" + provider);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        userInfo.put("firstName", user.getFirstName());
        userInfo.put("lastName", user.getLastName());
        userInfo.put("fullName", user.getFullName());
        userInfo.put("profilePictureUrl", user.getProfilePictureUrl());
        userInfo.put("provider", user.getProvider());
        userInfo.put("lastLogin", user.getLastLogin());

        return ResponseEntity.ok(userInfo);
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            if (tokenProvider.validateToken(token)) {
                String username = tokenProvider.getUsernameFromToken(token);
                String newToken = tokenProvider.generateToken(username);
                
                Map<String, String> response = new HashMap<>();
                response.put("token", newToken);
                response.put("type", "Bearer");
                return ResponseEntity.ok(response);
            }
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // In a stateless JWT setup, logout is handled client-side
        // You might want to implement a token blacklist for additional security
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/protected/user-info")
    public ResponseEntity<Map<String, Object>> getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        userInfo.put("firstName", user.getFirstName());
        userInfo.put("lastName", user.getLastName());
        userInfo.put("fullName", user.getFullName());
        userInfo.put("profilePictureUrl", user.getProfilePictureUrl());
        userInfo.put("provider", user.getProvider());
        userInfo.put("lastLogin", user.getLastLogin());
        userInfo.put("createdAt", user.getCreatedAt());
        userInfo.put("updatedAt", user.getUpdatedAt());

        return ResponseEntity.ok(userInfo);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<Iterable<User>> getAllUsers() {
        // This endpoint requires ADMIN role
        return ResponseEntity.ok(userRepository.findAll());
    }
} 