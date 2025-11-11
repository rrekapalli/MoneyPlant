package com.moneyplant.engines.ingestion.publisher;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

/**
 * Error handler for Kafka publishing failures.
 * Implements retry logic with exponential backoff and comprehensive error logging.
 * 
 * Requirements: 3.7
 */
@Component
@Slf4j
public class KafkaErrorHandler {

    private final Retry kafkaRetry;

    public KafkaErrorHandler() {
        // Configure retry policy: 3 attempts with exponential backoff
        RetryConfig retryConfig = RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(100))
                .retryExceptions(
                    org.apache.kafka.common.errors.TimeoutException.class,
                    org.apache.kafka.common.errors.NetworkException.class,
                    org.apache.kafka.common.errors.RetriableException.class,
                    TimeoutException.class
                )
                .ignoreExceptions(
                    org.apache.kafka.common.errors.RecordTooLargeException.class,
                    org.apache.kafka.common.errors.InvalidTopicException.class,
                    org.apache.kafka.common.errors.UnknownTopicOrPartitionException.class
                )
                .build();

        RetryRegistry retryRegistry = RetryRegistry.of(retryConfig);
        this.kafkaRetry = retryRegistry.retry("kafka-publisher");

        // Log retry events
        kafkaRetry.getEventPublisher()
                .onRetry(event -> 
                    log.warn("Retry attempt {} for Kafka publish: {}", 
                        event.getNumberOfRetryAttempts(), 
                        event.getLastThrowable().getMessage()))
                .onSuccess(event -> 
                    log.debug("Kafka publish succeeded after {} attempts", 
                        event.getNumberOfRetryAttempts()))
                .onError(event -> 
                    log.error("Kafka publish failed after {} attempts: {}", 
                        event.getNumberOfRetryAttempts(), 
                        event.getLastThrowable().getMessage()));
    }

    /**
     * Wraps a Kafka publish operation with retry logic.
     * 
     * @param publishOperation the publish operation to retry
     * @return Mono with retry logic applied
     */
    public <T> Mono<T> withRetry(Mono<T> publishOperation) {
        return publishOperation
                .retryWhen(reactor.util.retry.Retry.backoff(3, Duration.ofMillis(100))
                        .maxBackoff(Duration.ofSeconds(2))
                        .filter(this::isRetriableException)
                        .doBeforeRetry(signal -> 
                            log.warn("Retrying Kafka publish (attempt {}): {}", 
                                signal.totalRetries() + 1, 
                                signal.failure().getMessage()))
                );
    }

    /**
     * Handles tick data publishing failure.
     * Logs detailed error information for troubleshooting.
     * 
     * @param tickData the tick data that failed to publish
     * @param error the error that occurred
     */
    public void handleTickPublishFailure(TickData tickData, Throwable error) {
        log.error("Failed to publish tick data after all retry attempts - " +
                "Symbol: {}, Timestamp: {}, Price: {}, Volume: {}, Error: {}",
                tickData.getSymbol(),
                tickData.getTimestamp(),
                tickData.getPrice(),
                tickData.getVolume(),
                error.getMessage(),
                error);

        // Log to metrics/monitoring system
        logFailureMetrics("tick", tickData.getSymbol(), error);
    }

    /**
     * Handles candle data publishing failure.
     * Logs detailed error information for troubleshooting.
     * 
     * @param ohlcvData the OHLCV data that failed to publish
     * @param error the error that occurred
     */
    public void handleCandlePublishFailure(OhlcvData ohlcvData, Throwable error) {
        log.error("Failed to publish candle data after all retry attempts - " +
                "Symbol: {}, Timeframe: {}, Timestamp: {}, OHLC: [{}, {}, {}, {}], Volume: {}, Error: {}",
                ohlcvData.getSymbol(),
                ohlcvData.getTimeframe(),
                ohlcvData.getTimestamp(),
                ohlcvData.getOpen(),
                ohlcvData.getHigh(),
                ohlcvData.getLow(),
                ohlcvData.getClose(),
                ohlcvData.getVolume(),
                error.getMessage(),
                error);

        // Log to metrics/monitoring system
        logFailureMetrics("candle", ohlcvData.getSymbol(), error);
    }

    /**
     * Handles successful publish after retry.
     * 
     * @param result the send result
     * @param dataType the type of data (tick or candle)
     * @param symbol the symbol
     */
    public void handlePublishSuccess(SendResult<String, Object> result, String dataType, String symbol) {
        log.debug("Successfully published {} for symbol {} to partition {} at offset {}",
                dataType,
                symbol,
                result.getRecordMetadata().partition(),
                result.getRecordMetadata().offset());
    }

    /**
     * Determines if an exception is retriable.
     * 
     * @param throwable the exception to check
     * @return true if the exception is retriable
     */
    private boolean isRetriableException(Throwable throwable) {
        return throwable instanceof org.apache.kafka.common.errors.TimeoutException
                || throwable instanceof org.apache.kafka.common.errors.NetworkException
                || throwable instanceof org.apache.kafka.common.errors.RetriableException
                || throwable instanceof TimeoutException
                || throwable.getCause() instanceof org.apache.kafka.common.errors.RetriableException;
    }

    /**
     * Logs failure metrics for monitoring.
     * 
     * @param dataType the type of data (tick or candle)
     * @param symbol the symbol
     * @param error the error that occurred
     */
    private void logFailureMetrics(String dataType, String symbol, Throwable error) {
        // This would integrate with Prometheus/Micrometer metrics
        log.error("METRIC: kafka_publish_failure{{type={}, symbol={}, error_type={}}}",
                dataType,
                symbol,
                error.getClass().getSimpleName());
    }

    /**
     * Gets the retry configuration.
     * 
     * @return retry instance
     */
    public Retry getRetry() {
        return kafkaRetry;
    }

    /**
     * Gets retry metrics as a formatted string.
     * 
     * @return retry metrics
     */
    public String getRetryMetrics() {
        var metrics = kafkaRetry.getMetrics();
        return String.format(
            "Retry Metrics - Successful calls without retry: %d, " +
            "Successful calls with retry: %d, Failed calls with retry: %d, Failed calls without retry: %d",
            metrics.getNumberOfSuccessfulCallsWithoutRetryAttempt(),
            metrics.getNumberOfSuccessfulCallsWithRetryAttempt(),
            metrics.getNumberOfFailedCallsWithRetryAttempt(),
            metrics.getNumberOfFailedCallsWithoutRetryAttempt()
        );
    }
}
