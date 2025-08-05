package com.moneyplant.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.core.entity.User;
import com.moneyplant.core.repository.UserRepository;
import com.moneyplant.core.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtTokenProvider tokenProvider;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void health_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/public/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.message").value("MoneyPlant API is running"));
    }

    @Test
    void initiateOAuth2Login_ShouldReturnRedirectInfo() throws Exception {
        mockMvc.perform(get("/api/public/oauth2/authorization/google"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Redirecting to google OAuth2 login"))
                .andExpect(jsonPath("$.redirectUrl").value("/oauth2/authorization/google"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getCurrentUser_ShouldReturnUserInfo() throws Exception {
        User user = createTestUser();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.provider").value("GOOGLE"));
    }

    @Test
    void refreshToken_WithValidToken_ShouldReturnNewToken() throws Exception {
        String validToken = "valid.jwt.token";
        String newToken = "new.jwt.token";
        
        when(tokenProvider.validateToken(validToken)).thenReturn(true);
        when(tokenProvider.getUsernameFromToken(validToken)).thenReturn("test@example.com");
        when(tokenProvider.generateToken("test@example.com")).thenReturn(newToken);

        mockMvc.perform(post("/api/auth/refresh")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(newToken))
                .andExpect(jsonPath("$.type").value("Bearer"));
    }

    @Test
    void refreshToken_WithInvalidToken_ShouldReturnBadRequest() throws Exception {
        String invalidToken = "invalid.jwt.token";
        
        when(tokenProvider.validateToken(invalidToken)).thenReturn(false);

        mockMvc.perform(post("/api/auth/refresh")
                        .header("Authorization", "Bearer " + invalidToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid token"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void logout_ShouldReturnSuccessMessage() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getUserInfo_ShouldReturnDetailedUserInfo() throws Exception {
        User user = createTestUser();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/protected/user-info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.provider").value("GOOGLE"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAllUsers_WithAdminRole_ShouldReturnUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk());
    }

    private User createTestUser() {
        return User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .fullName("Test User")
                .profilePictureUrl("https://example.com/picture.jpg")
                .provider(User.AuthProvider.GOOGLE)
                .providerUserId("123456789")
                .isEnabled(true)
                .lastLogin(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
} 