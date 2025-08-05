package com.moneyplant.core.security;

import com.moneyplant.core.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", "test-secret-key-that-is-long-enough-for-testing");
        ReflectionTestUtils.setField(tokenProvider, "jwtExpiration", 3600000L); // 1 hour
        ReflectionTestUtils.setField(tokenProvider, "jwtRefreshExpiration", 86400000L); // 24 hours
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        // Given
        String username = "test@example.com";

        // When
        String token = tokenProvider.generateToken(username);

        // Then
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(username, tokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateTokenFromUser_ShouldCreateValidToken() {
        // Given
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .provider(User.AuthProvider.GOOGLE)
                .build();

        // When
        String token = tokenProvider.generateTokenFromUser(user);

        // Then
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(user.getEmail(), tokenProvider.getUsernameFromToken(token));
        assertEquals(user.getId(), tokenProvider.getUserIdFromToken(token));
    }

    @Test
    void generateToken_WithAuthentication_ShouldCreateValidToken() {
        // Given
        var authorities = Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));
        var authentication = new UsernamePasswordAuthenticationToken("test@example.com", null, authorities);

        // When
        String token = tokenProvider.generateToken(authentication);

        // Then
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("test@example.com", tokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateToken_WithOAuth2User_ShouldCreateValidToken() {
        // Given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("email", "test@example.com");
        attributes.put("name", "Test User");
        attributes.put("sub", "test-sub-id");
        
        var authorities = Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));
        var oauth2User = new DefaultOAuth2User(authorities, attributes, "email");
        var authentication = new OAuth2AuthenticationToken(oauth2User, authorities, "microsoft");

        // When
        String token = tokenProvider.generateToken(authentication);

        // Then
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("test@example.com", tokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateToken_WithOAuth2UserNoEmail_ShouldUseName() {
        // Given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("name", "Test User");
        attributes.put("sub", "test-sub-id");
        
        var authorities = Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));
        var oauth2User = new DefaultOAuth2User(authorities, attributes, "sub");
        var authentication = new OAuth2AuthenticationToken(oauth2User, authorities, "microsoft");

        // When
        String token = tokenProvider.generateToken(authentication);

        // Then
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("test-sub-id", tokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateRefreshToken_ShouldCreateValidToken() {
        // Given
        String username = "test@example.com";

        // When
        String token = tokenProvider.generateRefreshToken(username);

        // Then
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(username, tokenProvider.getUsernameFromToken(token));
    }

    @Test
    void validateToken_WithInvalidToken_ShouldReturnFalse() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        boolean isValid = tokenProvider.validateToken(invalidToken);

        // Then
        assertFalse(isValid);
    }

    @Test
    void validateToken_WithExpiredToken_ShouldReturnFalse() {
        // Given
        ReflectionTestUtils.setField(tokenProvider, "jwtExpiration", -1000L); // Negative expiration
        String token = tokenProvider.generateToken("test@example.com");

        // When
        boolean isValid = tokenProvider.validateToken(token);

        // Then
        assertFalse(isValid);
    }

    @Test
    void getExpirationDateFromToken_ShouldReturnCorrectDate() {
        // Given
        String token = tokenProvider.generateToken("test@example.com");

        // When
        Date expiration = tokenProvider.getExpirationDateFromToken(token);

        // Then
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void isTokenExpired_WithValidToken_ShouldReturnFalse() {
        // Given
        String token = tokenProvider.generateToken("test@example.com");

        // When
        boolean isExpired = tokenProvider.isTokenExpired(token);

        // Then
        assertFalse(isExpired);
    }
} 