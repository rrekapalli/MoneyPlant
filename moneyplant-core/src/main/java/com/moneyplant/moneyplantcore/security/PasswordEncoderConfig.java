package com.moneyplant.moneyplantcore.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Common configuration for password encryption across all services.
 * This ensures consistent password hashing and verification.
 */
@Configuration
public class PasswordEncoderConfig {

    /**
     * Creates a BCrypt password encoder bean with a strength of 12.
     * BCrypt is a secure password hashing function designed by Niels Provos and David Mazières.
     * It incorporates a salt to protect against rainbow table attacks.
     * 
     * @return A BCryptPasswordEncoder instance with strength 12
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}