package com.moneyplant.config;

import com.moneyplant.core.security.CustomOAuth2UserService;
import com.moneyplant.core.security.CustomUserDetailsService;
import com.moneyplant.core.security.JwtAuthenticationFilter;
import com.moneyplant.core.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableJpaAuditing
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CorsConfigurationSource corsConfigurationSource;
    private final com.moneyplant.core.repository.UserRepository userRepository;
    
    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        // Build Microsoft registration only if env vars are available; otherwise, return empty repo
        String clientId = System.getenv("MICROSOFT_CLIENT_ID");
        String clientSecret = System.getenv("MICROSOFT_CLIENT_SECRET");
        if (clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank()) {
            return new InMemoryClientRegistrationRepository(this.microsoftClientRegistration(clientId, clientSecret));
        }
        // Fallback: empty repository to avoid failing application context in tests/local without OAuth configured.
        return new InMemoryClientRegistrationRepository(java.util.List.of());
    }

    private ClientRegistration microsoftClientRegistration(String clientId, String clientSecret) {
        return ClientRegistration.withRegistrationId("microsoft")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "profile", "email")
                .authorizationUri("https://login.microsoftonline.com/common/oauth2/v2.0/authorize")
                .tokenUri("https://login.microsoftonline.com/common/oauth2/v2.0/token")
                .userInfoUri("https://graph.microsoft.com/oidc/userinfo")
                .jwkSetUri("https://login.microsoftonline.com/common/discovery/v2.0/keys")
                .userNameAttributeName(IdTokenClaimNames.SUB)
                .clientName("Microsoft")
                .build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Exclude screener endpoints from this security filter chain
            .securityMatcher(request -> !request.getRequestURI().startsWith("/api/screeners"))
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/public/**", "/oauth2/**", "/login/**", "/swagger-ui/**", "/v3/api-docs/**", "/actuator/**").permitAll()
                .anyRequest().authenticated()
            );

        http.oauth2Login(oauth2 -> oauth2
            .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService)
            )
            .successHandler((request, response, authentication) -> {
                // Get email from OAuth2User attributes instead of using authentication.getName()
                final String email;
                if (authentication.getPrincipal() instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
                    org.springframework.security.oauth2.core.user.OAuth2User oauth2User = 
                        (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();
                    java.util.Map<String, Object> attrs = oauth2User.getAttributes();
                    String tmp = attrs == null ? null : (String) attrs.get("email");
                    if (tmp == null || tmp.isBlank()) {
                        Object emails = attrs == null ? null : attrs.get("emails");
                        if (emails instanceof java.util.List<?> list && !list.isEmpty()) {
                            Object first = list.get(0);
                            if (first instanceof String s) {
                                tmp = s;
                            } else if (first instanceof java.util.Map<?, ?> m) {
                                Object addr = m.get("value");
                                if (addr instanceof String s2) tmp = s2;
                            }
                        }
                    }
                    if (tmp == null || tmp.isBlank()) tmp = (String) attrs.get("preferred_username");
                    if (tmp == null || tmp.isBlank()) tmp = (String) attrs.get("upn");
                    if (tmp == null || tmp.isBlank()) tmp = (String) attrs.get("unique_name");
                    if (tmp == null || tmp.isBlank()) tmp = (String) attrs.get("sub");
                    email = tmp;
                    System.out.println("OAuth2 Success - Email (resolved): " + email);
                } else {
                    email = null;
                }
                
                // Generate token with user information if email is available
                String token;
                if (email != null) {
                    // Load user from database to get user ID
                    try {
                        com.moneyplant.core.entity.User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
                        token = tokenProvider.generateTokenFromUser(user);
                        System.out.println("OAuth2 Success - Generated token for user ID: " + user.getId());
                    } catch (Exception e) {
                        System.out.println("OAuth2 Success - Error loading user, falling back to email token: " + e.getMessage());
                        token = tokenProvider.generateToken(email);
                    }
                } else {
                    token = tokenProvider.generateToken(authentication);
                }
                
                String redirectUrl = request.getParameter("redirect_uri");
                System.out.println("OAuth2 Success - Redirect URL: " + redirectUrl);
                System.out.println("OAuth2 Success - Authentication: " + authentication.getName());
                if (redirectUrl == null || redirectUrl.isBlank()) {
                    redirectUrl = "http://localhost:4200/login"; // default to login page
                }
                // Append token as query param; frontend should store it
                String sep = redirectUrl.contains("?") ? "&" : "?";
                String finalUrl = redirectUrl + sep + "token=" + token;
                System.out.println("OAuth2 Success - Final redirect URL: " + finalUrl);
                response.sendRedirect(finalUrl);
            })
            .failureHandler((request, response, exception) -> {
                String redirectUrl = request.getParameter("redirect_uri");
                System.out.println("OAuth2 Failure - Redirect URL: " + redirectUrl);
                System.out.println("OAuth2 Failure - Exception: " + exception.getMessage());
                if (redirectUrl == null || redirectUrl.isBlank()) {
                    redirectUrl = "http://localhost:4200/login";
                }
                String sep = redirectUrl.contains("?") ? "&" : "?";
                String finalUrl = redirectUrl + sep + "error=" + java.net.URLEncoder.encode(exception.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
                System.out.println("OAuth2 Failure - Final redirect URL: " + finalUrl);
                response.sendRedirect(finalUrl);
            })
        );

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, userDetailsService);
    }



} 