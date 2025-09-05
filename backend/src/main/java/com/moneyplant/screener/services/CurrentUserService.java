package com.moneyplant.screener.services;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service to get current user information from security context.
 */
@Service
public class CurrentUserService {

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
        
        // The principal should be the user ID (Long) for screener requests
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long) {
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
