package com.moneyplant.engines.ingestion.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Configuration for WebClient used by data providers.
 * Configures timeouts, connection pooling, and retry behavior.
 */
@Configuration
public class WebClientConfig {

    /**
     * Creates a WebClient bean with optimized settings for data provider APIs.
     * 
     * @return Configured WebClient instance
     */
    @Bean
    public WebClient webClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 15000)
                .responseTimeout(Duration.ofSeconds(15))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(15, TimeUnit.SECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(15, TimeUnit.SECONDS)));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024)) // 16MB buffer
                .build();
    }

    /**
     * Creates a WebClient bean specifically for NSE API calls.
     * Includes NSE-specific headers and configuration.
     * 
     * @return Configured WebClient for NSE
     */
    @Bean("nseWebClient")
    public WebClient nseWebClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 15000)
                .responseTimeout(Duration.ofSeconds(15))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(15, TimeUnit.SECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(15, TimeUnit.SECONDS)));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Accept-Language", "en-US,en;q=0.9")
                .defaultHeader("Accept-Encoding", "gzip, deflate, br")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024))
                .build();
    }

    /**
     * Creates a WebClient bean specifically for Yahoo Finance API calls.
     * 
     * @return Configured WebClient for Yahoo Finance
     */
    @Bean("yahooWebClient")
    public WebClient yahooWebClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000)
                .responseTimeout(Duration.ofSeconds(10))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(10, TimeUnit.SECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(10, TimeUnit.SECONDS)));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024))
                .build();
    }
}
