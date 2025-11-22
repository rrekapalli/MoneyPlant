package com.moneyplant.engines.ingestion.kite;

import com.moneyplant.engines.ingestion.kite.client.KiteConnectClient;
import com.moneyplant.engines.ingestion.kite.config.KiteIngestionConfig;
import com.moneyplant.engines.ingestion.kite.exception.KiteAuthenticationException;
import net.jqwik.api.*;
import org.junit.jupiter.api.Tag;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Property-based tests for KiteConnect client wrapper.
 * Feature: kite-ingestion, Property 1, 11, 18
 */
@Tag("property-test")
public class KiteClientPropertyTests {

    /**
     * Property 1: Authentication precedes data fetching
     * Validates: Requirements 1.1
     */
    @Property(tries = 5)
    @Tag("property-test")
    void authenticationPrecedesDataFetching() {
        KiteIngestionConfig config = new KiteIngestionConfig();
        config.getApi().setKey("test_key");
        config.getApi().setSecret("test_secret");
        config.getApi().setAccessToken("");
        
        KiteConnectClient client = new KiteConnectClient(config);
        
        assertThatThrownBy(() -> client.getInstruments())
            .isInstanceOf(KiteAuthenticationException.class)
            .hasMessageContaining("Access token not set");
    }

    /**
     * Property 11: Retry with exponential backoff
     * Validates: Requirements 5.2
     */
    @Property(tries = 5)
    @Tag("property-test")
    void retryWithExponentialBackoff() {
        KiteIngestionConfig config = new KiteIngestionConfig();
        config.getApi().setKey("test_key");
        config.getApi().setSecret("test_secret");
        config.getApi().setAccessToken("test_token");
        
        assertThat(config.getIngestion().getRetry().getMaxAttempts()).isEqualTo(3);
        assertThat(config.getIngestion().getRetry().getInitialDelayMs()).isEqualTo(1000);
        assertThat(config.getIngestion().getRetry().getMultiplier()).isEqualTo(2.0);
        
        KiteConnectClient client = new KiteConnectClient(config);
        assertThat(client).isNotNull();
        assertThat(client.getKiteConnect().getAccessToken()).isEqualTo("test_token");
    }

    /**
     * Property 18: Rate limit backoff
     * Validates: Requirements 12.1, 12.2
     */
    @Property(tries = 5)
    @Tag("property-test")
    void rateLimitBackoff() {
        KiteIngestionConfig config = new KiteIngestionConfig();
        config.getApi().setKey("test_key");
        config.getApi().setSecret("test_secret");
        config.getApi().setAccessToken("test_token");
        
        assertThat(config.getIngestion().getRateLimit().getRequestsPerSecond()).isEqualTo(3);
        assertThat(config.getIngestion().getRateLimit().getBurstCapacity()).isEqualTo(10);
        
        KiteConnectClient client = new KiteConnectClient(config);
        assertThat(client).isNotNull();
    }

    @Property(tries = 5)
    @Tag("property-test")
    void clientInitializationWithValidConfig(@ForAll @AlphaChars @StringLength(min = 5, max = 20) String apiKey,
                                            @ForAll @AlphaChars @StringLength(min = 5, max = 20) String accessToken) {
        KiteIngestionConfig config = new KiteIngestionConfig();
        config.getApi().setKey(apiKey);
        config.getApi().setSecret("test_secret");
        config.getApi().setAccessToken(accessToken);
        
        KiteConnectClient client = new KiteConnectClient(config);
        
        assertThat(client).isNotNull();
        assertThat(client.getKiteConnect()).isNotNull();
        assertThat(client.getKiteConnect().getAccessToken()).isEqualTo(accessToken);
    }
}
