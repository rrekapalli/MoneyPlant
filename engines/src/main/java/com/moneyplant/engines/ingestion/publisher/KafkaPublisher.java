package com.moneyplant.engines.ingestion.publisher;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import lombok.extern.slf4j.Slf4j;
import org.apache.avro.generic.GenericRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;

/**
 * Service for publishing market data to Kafka topics with Avro serialization.
 * Implements circuit breaker pattern for fault tolerance and backpressure handling.
 * 
 * Requirements: 3.1, 3.2, 3.6
 */
@Service
@Slf4j
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "spring.kafka.enabled",
    havingValue = "true",
    matchIfMissing = false
)
public class KafkaPublisher {

    private final KafkaTemplate<String, Object> avroKafkaTemplate;
    private final AvroSerializer avroSerializer;
    private final PartitionStrategy partitionStrategy;
    private final CircuitBreaker circuitBreaker;
    private final KafkaErrorHandler errorHandler;

    @Value("${kafka.topics.market-data-ticks:market-data-ticks}")
    private String ticksTopic;

    @Value("${kafka.topics.market-data-candles:market-data-candles}")
    private String candlesTopic;

    @Value("${kafka.topics.data-quality-alerts:data-quality-alerts}")
    private String alertsTopic;

    @Autowired
    public KafkaPublisher(
            @Qualifier("avroKafkaTemplate") KafkaTemplate<String, Object> avroKafkaTemplate,
            AvroSerializer avroSerializer,
            PartitionStrategy partitionStrategy,
            KafkaErrorHandler errorHandler) {
        this.avroKafkaTemplate = avroKafkaTemplate;
        this.avroSerializer = avroSerializer;
        this.partitionStrategy = partitionStrategy;
        this.errorHandler = errorHandler;
        
        // Configure circuit breaker for Kafka failures
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50) // Open circuit if 50% of requests fail
                .waitDurationInOpenState(Duration.ofSeconds(10)) // Wait 10 seconds before trying again
                .slidingWindowSize(10) // Consider last 10 requests
                .permittedNumberOfCallsInHalfOpenState(3) // Allow 3 test calls in half-open state
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .build();
        
        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(config);
        this.circuitBreaker = registry.circuitBreaker("kafka-publisher");
        
        // Log circuit breaker state changes
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> 
                    log.warn("Circuit breaker state changed: {} -> {}", 
                        event.getStateTransition().getFromState(),
                        event.getStateTransition().getToState()))
                .onError(event -> 
                    log.error("Circuit breaker recorded error: {}", event.getThrowable().getMessage()));
    }

    /**
     * Publishes tick data to the market-data-ticks topic.
     * Uses symbol-based partitioning for ordered processing.
     * Includes retry logic with exponential backoff.
     * 
     * @param tickData the tick data to publish
     * @return Mono that completes when message is sent
     */
    public Mono<SendResult<String, Object>> publishTick(TickData tickData) {
        Mono<SendResult<String, Object>> publishOperation = Mono.fromCallable(() -> {
            // Serialize to Avro
            GenericRecord avroRecord = avroSerializer.serializeTickData(tickData);
            
            // Determine partition key
            String partitionKey = partitionStrategy.getPartitionKey(tickData.getSymbol());
            
            // Send to Kafka
            CompletableFuture<SendResult<String, Object>> future = 
                avroKafkaTemplate.send(ticksTopic, partitionKey, avroRecord);
            
            log.trace("Publishing tick for symbol {} to topic {}", tickData.getSymbol(), ticksTopic);
            
            return future.get(); // Block until send completes
        })
        .subscribeOn(Schedulers.boundedElastic())
        .transformDeferred(CircuitBreakerOperator.of(circuitBreaker));
        
        // Apply retry logic
        return errorHandler.withRetry(publishOperation)
                .doOnSuccess(result -> {
                    errorHandler.handlePublishSuccess(result, "tick", tickData.getSymbol());
                })
                .doOnError(error -> {
                    errorHandler.handleTickPublishFailure(tickData, error);
                });
    }

    /**
     * Publishes OHLCV candle data to the market-data-candles topic.
     * Uses symbol-based partitioning for ordered processing.
     * Includes retry logic with exponential backoff.
     * 
     * @param ohlcvData the OHLCV data to publish
     * @return Mono that completes when message is sent
     */
    public Mono<SendResult<String, Object>> publishCandle(OhlcvData ohlcvData) {
        Mono<SendResult<String, Object>> publishOperation = Mono.fromCallable(() -> {
            // Serialize to Avro
            GenericRecord avroRecord = avroSerializer.serializeOhlcvData(ohlcvData);
            
            // Determine partition key
            String partitionKey = partitionStrategy.getPartitionKey(ohlcvData.getSymbol());
            
            // Send to Kafka
            CompletableFuture<SendResult<String, Object>> future = 
                avroKafkaTemplate.send(candlesTopic, partitionKey, avroRecord);
            
            log.trace("Publishing candle for symbol {} ({}) to topic {}", 
                ohlcvData.getSymbol(), ohlcvData.getTimeframe(), candlesTopic);
            
            return future.get(); // Block until send completes
        })
        .subscribeOn(Schedulers.boundedElastic())
        .transformDeferred(CircuitBreakerOperator.of(circuitBreaker));
        
        // Apply retry logic
        return errorHandler.withRetry(publishOperation)
                .doOnSuccess(result -> {
                    errorHandler.handlePublishSuccess(result, "candle", ohlcvData.getSymbol());
                })
                .doOnError(error -> {
                    errorHandler.handleCandlePublishFailure(ohlcvData, error);
                });
    }

    /**
     * Publishes a data quality alert to the data-quality-alerts topic.
     * 
     * @param alert the alert message
     * @param symbol the symbol associated with the alert
     * @return Mono that completes when message is sent
     */
    public Mono<SendResult<String, Object>> publishAlert(String alert, String symbol) {
        return Mono.fromCallable(() -> {
            String partitionKey = partitionStrategy.getPartitionKey(symbol);
            
            CompletableFuture<SendResult<String, Object>> future = 
                avroKafkaTemplate.send(alertsTopic, partitionKey, alert);
            
            log.debug("Publishing alert for symbol {} to topic {}", symbol, alertsTopic);
            
            return future.get();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
        .doOnSuccess(result -> {
            log.info("Successfully published alert for symbol {}", symbol);
        })
        .doOnError(error -> {
            log.error("Failed to publish alert for symbol {}: {}", symbol, error.getMessage());
        });
    }

    /**
     * Gets the current state of the circuit breaker.
     * 
     * @return circuit breaker state (CLOSED, OPEN, HALF_OPEN)
     */
    public String getCircuitBreakerState() {
        return circuitBreaker.getState().toString();
    }

    /**
     * Gets circuit breaker metrics.
     * 
     * @return metrics as string
     */
    public String getCircuitBreakerMetrics() {
        var metrics = circuitBreaker.getMetrics();
        return String.format(
            "CircuitBreaker Metrics - State: %s, Failure Rate: %.2f%%, Slow Call Rate: %.2f%%, " +
            "Successful Calls: %d, Failed Calls: %d, Slow Calls: %d",
            circuitBreaker.getState(),
            metrics.getFailureRate(),
            metrics.getSlowCallRate(),
            metrics.getNumberOfSuccessfulCalls(),
            metrics.getNumberOfFailedCalls(),
            metrics.getNumberOfSlowCalls()
        );
    }
}
