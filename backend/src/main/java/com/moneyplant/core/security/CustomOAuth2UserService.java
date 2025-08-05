package com.moneyplant.core.security;

import com.moneyplant.core.entity.User;
import com.moneyplant.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new InternalAuthenticationServiceException("Error processing OAuth2 user", ex);
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerUserId = oAuth2User.getName();
        String email = getEmail(oAuth2User, provider);
        String name = getName(oAuth2User, provider);
        String pictureUrl = getPictureUrl(oAuth2User, provider);

        User.AuthProvider authProvider = User.AuthProvider.valueOf(provider.toUpperCase());

        User user = userRepository.findByProviderUserIdAndProvider(providerUserId, authProvider)
                .orElseGet(() -> {
                    // Check if user exists with same email but different provider
                    User existingUser = userRepository.findByEmail(email).orElse(null);
                    if (existingUser != null) {
                        log.warn("User with email {} already exists with provider {}", email, existingUser.getProvider());
                        return existingUser;
                    }

                    // Create new user
                    return createNewUser(providerUserId, email, name, pictureUrl, authProvider);
                });

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                oAuth2User.getAttributes(),
                "email"
        );
    }

    private User createNewUser(String providerUserId, String email, String name, String pictureUrl, User.AuthProvider provider) {
        String[] nameParts = name.split(" ", 2);
        String firstName = nameParts.length > 0 ? nameParts[0] : "";
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        User user = User.builder()
                .providerUserId(providerUserId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .fullName(name)
                .profilePictureUrl(pictureUrl)
                .provider(provider)
                .isEnabled(true)
                .lastLogin(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    private String getEmail(OAuth2User oAuth2User, String provider) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        if ("google".equals(provider)) {
            return (String) attributes.get("email");
        } else if ("microsoft".equals(provider)) {
            return (String) attributes.get("email");
        }
        
        throw new IllegalArgumentException("Unsupported provider: " + provider);
    }

    private String getName(OAuth2User oAuth2User, String provider) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        if ("google".equals(provider)) {
            return (String) attributes.get("name");
        } else if ("microsoft".equals(provider)) {
            return (String) attributes.get("name");
        }
        
        throw new IllegalArgumentException("Unsupported provider: " + provider);
    }

    private String getPictureUrl(OAuth2User oAuth2User, String provider) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        if ("google".equals(provider)) {
            return (String) attributes.get("picture");
        } else if ("microsoft".equals(provider)) {
            return null; // Microsoft doesn't provide profile picture in basic userinfo
        }
        
        return null;
    }
} 