package com.moneyplant.core.security;

import com.moneyplant.core.entity.User;
import com.moneyplant.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("CustomUserDetailsService - loadUserByUsername called with username: {}", username);
        
        // Handle both email and user ID cases
        User user;
        if (username.matches("\\d+")) {
            // If username is a number (user ID), find by ID
            Long userId = Long.parseLong(username);
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        } else {
            // If username is an email, find by email
            user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        }

        log.info("CustomUserDetailsService - Found user: id={}, email={}", user.getId(), user.getEmail());

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail()) // Always use email as username
                .password("") // OAuth2 users don't have passwords
                .authorities(Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")))
                .accountExpired(false)
                .accountLocked(!user.getIsEnabled())
                .credentialsExpired(false)
                .disabled(!user.getIsEnabled())
                .build();
                
        log.info("CustomUserDetailsService - Created UserDetails with username: {}", userDetails.getUsername());
        return userDetails;
    }
} 