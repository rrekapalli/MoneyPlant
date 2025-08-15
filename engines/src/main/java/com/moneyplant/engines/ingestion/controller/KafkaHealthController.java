package com.moneyplant.engines.ingestion.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

/**
 * Health check controller for Kafka connectivity and consumer status in the engines project.
 * Provides endpoints to verify Kafka is working properly for data ingestion.
 */
@RestController
@RequestMapping("/api/v1/kafka")
@RequiredArgsConstructor
@Slf4j
public class KafkaHealthController {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Health check endpoint for Kafka connectivity
     * 
     * @return Kafka health status
     */
    @GetMapping("/health")
    public KafkaHealthResponse checkKafkaHealth() {
        try {
            // Test Kafka producer connectivity
            String testMessage = "Kafka health check from engines - " + System.currentTimeMillis();
            CompletableFuture<SendResult<String, Object>> future = 
                kafkaTemplate.send("kafka-health-test", "health-check", testMessage);
            
            SendResult<String, Object> result = future.get();
            
            log.info("Kafka health check successful from engines - Topic: {}, Partition: {}, Offset: {}", 
                    result.getRecordMetadata().topic(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            
            return KafkaHealthResponse.builder()
                    .status("HEALTHY")
                    .message("Kafka is working properly in engines project")
                    .topic(result.getRecordMetadata().topic())
                    .partition(result.getRecordMetadata().partition())
                    .offset(result.getRecordMetadata().offset())
                    .timestamp(System.currentTimeMillis())
                    .build();
                    
        } catch (Exception e) {
            log.error("Kafka health check failed in engines: {}", e.getMessage(), e);
            
            return KafkaHealthResponse.builder()
                    .status("UNHEALTHY")
                    .message("Kafka health check failed in engines: " + e.getMessage())
                    .error(e.getClass().getSimpleName())
                    .timestamp(System.currentTimeMillis())
                    .build();
        }
    }

    /**
     * Test endpoint to send a message to the NSE indices topic
     * 
     * @return Test result
     */
    @GetMapping("/test-nse-indices")
    public String testNseIndicesTopic() {
        try {
            // Create a test message
            String testMessage = "{\"timestamp\":\"" + System.currentTimeMillis() + 
                               "\",\"source\":\"Engines Health Check\",\"indices\":[]}";
            
            CompletableFuture<SendResult<String, Object>> future = 
                kafkaTemplate.send("nse-indices-ticks", "test-key", testMessage);
            
            SendResult<String, Object> result = future.get();
            
            log.info("Test message sent from engines to nse-indices-ticks topic - Partition: {}, Offset: {}", 
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            
            return "Test message sent successfully from engines to nse-indices-ticks topic";
            
        } catch (Exception e) {
            log.error("Failed to send test message from engines to nse-indices-ticks topic: {}", e.getMessage(), e);
            return "Failed to send test message from engines: " + e.getMessage();
        }
    }

    /**
     * Response DTO for Kafka health check
     */
    public static class KafkaHealthResponse {
        private String status;
        private String message;
        private String topic;
        private Integer partition;
        private Long offset;
        private String error;
        private Long timestamp;

        // Builder pattern
        public static KafkaHealthResponseBuilder builder() {
            return new KafkaHealthResponseBuilder();
        }

        public static class KafkaHealthResponseBuilder {
            private KafkaHealthResponse response = new KafkaHealthResponse();

            public KafkaHealthResponseBuilder status(String status) {
                response.status = status;
                return this;
            }

            public KafkaHealthResponseBuilder message(String message) {
                response.message = message;
                return this;
            }

            public KafkaHealthResponseBuilder topic(String topic) {
                response.topic = topic;
                return this;
            }

            public KafkaHealthResponseBuilder partition(Integer partition) {
                response.partition = partition;
                return this;
            }

            public KafkaHealthResponseBuilder offset(Long offset) {
                response.offset = offset;
                return this;
            }

            public KafkaHealthResponseBuilder error(String error) {
                response.error = error;
                return this;
            }

            public KafkaHealthResponseBuilder timestamp(Long timestamp) {
                response.timestamp = timestamp;
                return this;
            }

            public KafkaHealthResponse build() {
                return response;
            }
        }

        // Getters
        public String getStatus() { return status; }
        public String getMessage() { return message; }
        public String getTopic() { return topic; }
        public Integer getPartition() { return partition; }
        public Long getOffset() { return offset; }
        public String getError() { return error; }
        public Long getTimestamp() { return timestamp; }
    }
}
