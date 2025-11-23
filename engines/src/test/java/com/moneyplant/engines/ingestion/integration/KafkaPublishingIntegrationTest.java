package com.moneyplant.engines.ingestion.integration;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import com.moneyplant.engines.ingestion.publisher.KafkaPublisher;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import reactor.test.StepVerifier;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for Kafka publishing using Testcontainers
 */
@SpringBootTest(properties = {
    "spring.kafka.enabled=true",
    "ingestion.auto-start.enabled=false",
    "nse.websocket.enabled=false",
    "nse.auto-start.enabled=false"
})
@ActiveProfiles("test")
@Testcontainers
class KafkaPublishingIntegrationTest {

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"))
            .withEmbeddedZookeeper();

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("spring.kafka.producer.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("spring.kafka.consumer.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired
    private KafkaPublisher kafkaPublisher;

    private KafkaConsumer<String, String> consumer;

    @BeforeEach
    void setUp() {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "test-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        consumer = new KafkaConsumer<>(props);
    }

    @AfterEach
    void tearDown() {
        if (consumer != null) {
            consumer.close();
        }
    }

    @Test
    void testPublishTickData() {
        // Given
        TickData tickData = TickData.builder()
                .symbol("RELIANCE")
                .timestamp(Instant.now())
                .price(new BigDecimal("2450.50"))
                .volume(1000000L)
                .bid(new BigDecimal("2450.00"))
                .ask(new BigDecimal("2451.00"))
                .build();

        consumer.subscribe(Collections.singletonList("market-data-ticks"));

        // When
        StepVerifier.create(kafkaPublisher.publishTick(tickData))
                // Then
                .verifyComplete();

        // Verify message was published
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(10));
        assertThat(records.isEmpty()).isFalse();
        
        ConsumerRecord<String, String> record = records.iterator().next();
        assertThat(record.key()).isEqualTo("RELIANCE");
    }

    @Test
    void testPublishOhlcvData() {
        // Given
        OhlcvData ohlcvData = OhlcvData.builder()
                .symbol("TCS")
                .timestamp(Instant.now())
                .timeframe(Timeframe.ONE_DAY)
                .open(new BigDecimal("3500.00"))
                .high(new BigDecimal("3510.00"))
                .low(new BigDecimal("3495.00"))
                .close(new BigDecimal("3505.00"))
                .volume(5000000L)
                .build();

        consumer.subscribe(Collections.singletonList("market-data-candles"));

        // When
        StepVerifier.create(kafkaPublisher.publishCandle(ohlcvData))
                // Then
                .verifyComplete();

        // Verify message was published
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(10));
        assertThat(records.isEmpty()).isFalse();
        
        ConsumerRecord<String, String> record = records.iterator().next();
        assertThat(record.key()).isEqualTo("TCS");
    }

    @Test
    void testPublishMultipleTicksInBatch() {
        // Given
        consumer.subscribe(Collections.singletonList("market-data-ticks"));

        // When - publish multiple ticks
        for (int i = 0; i < 5; i++) {
            TickData tickData = TickData.builder()
                    .symbol("INFY")
                    .timestamp(Instant.now())
                    .price(new BigDecimal("1450.50").add(new BigDecimal(i)))
                    .volume(1000000L + i * 10000)
                    .build();
            
            kafkaPublisher.publishTick(tickData).block();
        }

        // Then - verify all messages were published
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(10));
        assertThat(records.count()).isGreaterThanOrEqualTo(5);
    }

    @Test
    void testPartitioningBySymbol() {
        // Given
        consumer.subscribe(Collections.singletonList("market-data-ticks"));

        // When - publish ticks for different symbols
        TickData reliance = createTickData("RELIANCE", "2450.50");
        TickData tcs = createTickData("TCS", "3500.75");
        
        kafkaPublisher.publishTick(reliance).block();
        kafkaPublisher.publishTick(tcs).block();

        // Then - verify messages are published
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(10));
        assertThat(records.count()).isGreaterThanOrEqualTo(2);
    }

    private TickData createTickData(String symbol, String price) {
        return TickData.builder()
                .symbol(symbol)
                .timestamp(Instant.now())
                .price(new BigDecimal(price))
                .volume(1000000L)
                .build();
    }
}
