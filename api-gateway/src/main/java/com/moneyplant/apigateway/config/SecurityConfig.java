package com.moneyplant.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize
                // Public endpoints
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/actuator/**", "/login/**", "/oauth2/**", "/success/**", "/css/**", "/js/**", "/images/**", "/webjars/**", "/favicon.ico").permitAll()
                // Secured endpoints
                .requestMatchers("/api/v1/portfolio/**").hasRole("USER")
                .requestMatchers("/api/v1/stock/**").hasRole("USER")
                .requestMatchers("/api/v1/transaction/**").hasRole("USER")
                .requestMatchers("/api/v1/watchlist/**").hasRole("USER")
                // Admin endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oauth2UserService())
                    .oidcUserService(oidcUserService())
                )
                .defaultSuccessUrl("/success", true)
                .loginPage("/login")
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        return userRequest -> {
            OAuth2User oauth2User = delegate.loadUser(userRequest);

            // Extract user details and map to appropriate roles
            Set<GrantedAuthority> mappedAuthorities = new HashSet<>();
            mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_USER"));

            // You can add custom logic here to assign additional roles based on user attributes

            return new CustomOAuth2User(oauth2User, mappedAuthorities);
        };
    }

    @Bean
    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        OidcUserService delegate = new OidcUserService();
        return userRequest -> {
            OidcUser oidcUser = delegate.loadUser(userRequest);

            // Extract user details and map to appropriate roles
            Set<GrantedAuthority> mappedAuthorities = new HashSet<>();
            mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_USER"));

            // You can add custom logic here to assign additional roles based on user attributes

            return new CustomOidcUser(oidcUser, mappedAuthorities);
        };
    }

    // Custom OAuth2User wrapper to add custom authorities
    private static class CustomOAuth2User implements OAuth2User {
        private final OAuth2User delegate;
        private final Set<GrantedAuthority> authorities;

        public CustomOAuth2User(OAuth2User delegate, Set<GrantedAuthority> authorities) {
            this.delegate = delegate;
            this.authorities = authorities;
        }

        @Override
        public Map<String, Object> getAttributes() {
            return delegate.getAttributes();
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public String getName() {
            return delegate.getName();
        }
    }

    // Custom OidcUser wrapper to add custom authorities
    private static class CustomOidcUser extends CustomOAuth2User implements OidcUser {
        private final OidcUser delegate;

        public CustomOidcUser(OidcUser delegate, Set<GrantedAuthority> authorities) {
            super(delegate, authorities);
            this.delegate = delegate;
        }

        @Override
        public Map<String, Object> getClaims() {
            return delegate.getClaims();
        }

        @Override
        public org.springframework.security.oauth2.core.oidc.OidcIdToken getIdToken() {
            return delegate.getIdToken();
        }

        @Override
        public org.springframework.security.oauth2.core.oidc.OidcUserInfo getUserInfo() {
            return delegate.getUserInfo();
        }
    }
}
