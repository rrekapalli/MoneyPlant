package com.moneyplant.stock.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time stock data streaming.
 * Enables STOMP messaging protocol over WebSocket for broadcasting stock ticks and indices data.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure message broker options.
     * Sets up a simple in-memory message broker to carry messages back to the client
     * on destinations prefixed with "/topic".
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to carry messages back to the client
        config.enableSimpleBroker("/topic");
        // Set application destination prefix for messages bound for @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Register STOMP endpoints mapping each to a specific URL and enabling SockJS fallback options.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws/stock-ticks" endpoint for WebSocket connections
        registry.addEndpoint("/ws/stock-ticks")
                .setAllowedOriginPatterns("*") // Allow all origins for development
                .withSockJS(); // Enable SockJS fallback options
        
        // Register the "/ws/indices" endpoint for indices WebSocket connections
        registry.addEndpoint("/ws/indices")
                .setAllowedOriginPatterns("*") // Allow all origins for development
                .withSockJS(); // Enable SockJS fallback options
    }
}