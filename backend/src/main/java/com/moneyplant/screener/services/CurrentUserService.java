package com.moneyplant.screener.services;

import com.moneyplant.core.entity.User;
import com.moneyplant.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/**
 * Service to get current user information from security context.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CurrentUserService {

    private final UserRepository userRepository;

    /**
     * Gets the current user ID from the security context.
     * 
     * @return the current user ID
     * @throws IllegalStateException if no user is authenticated
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }
        
        // Handle different principal types based on which authentication filter was used
        Object principal = authentication.getPrincipal();
        log.debug("getCurrentUserId - Principal type: {}, value: {}", principal.getClass().getSimpleName(), principal);
        
        if (principal instanceof Long) {
            // ScreenerJwtAuthenticationFilter sets user ID directly as principal
            return (Long) principal;
        } else if (principal instanceof String) {
            String principalStr = (String) principal;
            // Handle anonymous user case
            if ("anonymousUser".equals(principalStr)) {
                throw new IllegalStateException("Anonymous user not allowed");
            }
            try {
                return Long.parseLong(principalStr);
            } catch (NumberFormatException e) {
                throw new IllegalStateException("Invalid user ID format: " + principal);
            }
        } else if (principal instanceof UserDetails) {
            // Core JwtAuthenticationFilter sets UserDetails as principal
            UserDetails userDetails = (UserDetails) principal;
            String username = userDetails.getUsername();
            try {
                // Try to parse username as user ID first
                return Long.parseLong(username);
            } catch (NumberFormatException e) {
                // Username is not a number, assume it's an email and look up user ID
                log.debug("Looking up user ID for email: {}", username);
                User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new IllegalStateException("User not found with email: " + username));
                log.debug("Found user ID {} for email: {}", user.getId(), username);
                return user.getId();
            }
        } else {
            throw new IllegalStateException("Unexpected principal type: " + principal.getClass());
        }
    }

    /**
     * Checks if a user is currently authenticated.
     * 
     * @return true if user is authenticated, false otherwise
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}
