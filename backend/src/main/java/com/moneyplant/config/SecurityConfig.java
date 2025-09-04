package com.moneyplant.config;

// import com.moneyplant.core.security.CustomOAuth2UserService;
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
    // private final CustomOAuth2UserService customOAuth2UserService;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll() // TEMPORARY: Allow all requests for testing
            );
            // OAuth2 login temporarily disabled
            // .oauth2Login(oauth2 -> oauth2
            //     .userInfoEndpoint(userInfo -> userInfo
            //         .userService(customOAuth2UserService)
            //     )
            //     .successHandler((request, response, authentication) -> {
            //         String token = tokenProvider.generateToken(authentication);
            //         String redirectUrl = request.getParameter("redirect_uri");
            //         if (redirectUrl == null || redirectUrl.isBlank()) {
            //             redirectUrl = "http://localhost:4200"; // default frontend
            //         }
            //         // Append token as query param; frontend should store it
            //         String sep = redirectUrl.contains("?") ? "&" : "?";
            //         response.sendRedirect(redirectUrl + sep + "token=" + token);
            //     })
            //     .failureHandler((request, response, exception) -> {
            //         String redirectUrl = request.getParameter("redirect_uri");
            //         if (redirectUrl == null || redirectUrl.isBlank()) {
            //             redirectUrl = "http://localhost:4200/login";
            //         }
            //         String sep = redirectUrl.contains("?") ? "&" : "?";
            //         response.sendRedirect(redirectUrl + sep + "error=" + java.net.URLEncoder.encode(exception.getMessage(), java.nio.charset.StandardCharsets.UTF_8));
            //     })
            // )
            // .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, userDetailsService);
    }



} 