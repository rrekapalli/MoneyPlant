package com.moneyplant.stock.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration class for WebClient beans used in stock services.
 * Provides configured WebClient instances for external API calls.
 */
@Configuration
public class WebClientConfig {

    /**
     * Creates a WebClient bean for making HTTP requests to external APIs.
     * Configured with appropriate settings for NSE India API calls.
     * 
     * @return Configured WebClient instance
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(1024 * 1024)) // 1MB buffer size
                .build();
    }
}