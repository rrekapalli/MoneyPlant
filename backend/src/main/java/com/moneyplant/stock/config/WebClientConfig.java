package com.moneyplant.stock.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.http.client.HttpClientRequest;
import reactor.netty.http.client.HttpClientResponse;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Configuration class for WebClient beans used in stock services.
 * Provides configured WebClient instances for external API calls.
 */
@Configuration
public class WebClientConfig {

    /**
     * Creates a WebClient bean for making HTTP requests to external APIs.
     * Configured with appropriate settings for NSE India API calls including
     * compression handling, timeouts, and proper HTTP client configuration.
     * 
     * @return Configured WebClient instance
     */
    @Bean
    public WebClient webClient() {
        // Configure HttpClient with compression support and timeouts
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000)
                .responseTimeout(Duration.ofSeconds(30))
                .doOnConnected(conn -> 
                    conn.addHandlerLast(new ReadTimeoutHandler(30, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(30, TimeUnit.SECONDS)))
                // Enable automatic decompression of gzip, deflate responses
                .compress(true);

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(2 * 1024 * 1024)) // 2MB buffer size for larger responses
                .build();
    }
}