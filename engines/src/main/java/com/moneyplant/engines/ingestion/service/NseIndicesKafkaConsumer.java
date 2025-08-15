package com.moneyplant.engines.ingestion.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.engines.common.dto.NseIndicesTickDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

/**
 * Kafka consumer service for consuming NSE indices data in the engines project.
 * This service listens to the 'nse-indices-ticks' topic and processes incoming data.
 * The engines project is responsible for data ingestion, processing, and distribution.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NseIndicesKafkaConsumer {

    private final ObjectMapper objectMapper;

    /**
     * Post-construct method to configure ObjectMapper
     */
    @PostConstruct
    public void configureObjectMapper() {
        // Configure ObjectMapper to be more flexible with JSON parsing
        this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
        this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_FLOAT_AS_INT, true);
    }

    /**
     * Consume NSE indices data from Kafka topic 'nse-indices-ticks'
     * 
     * @param message The JSON message from Kafka
     * @param topic The Kafka topic name
     * @param partition The Kafka partition number
     * @param offset The message offset
     */
    @KafkaListener(
        topics = "${kafka.topics.nse-indices-ticks:nse-indices-ticks}",
        groupId = "${spring.kafka.consumer.group-id:moneyplant-engines}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeNseIndicesData(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        try {
            log.info("Received NSE indices data from Kafka - Topic: {}, Partition: {}, Offset: {}", 
                    topic, partition, offset);
            
            // Log the raw message for debugging
            log.debug("Raw Kafka message: {}", message);
            
            // Parse the JSON message using the engines DTO
            NseIndicesTickDto tickData = objectMapper.readValue(message, NseIndicesTickDto.class);
            
            log.info("Processed NSE indices data - Timestamp: {}, Indices count: {}, Source: {}", 
                    tickData.getTimestamp(), 
                    tickData.getIndices() != null ? tickData.getIndices().length : 0,
                    tickData.getSource());
            
            // Process the tick data (store in database, update cache, etc.)
            processNseIndicesTickData(tickData);
            
            log.debug("Successfully processed NSE indices data from Kafka");
            
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("JSON parsing error in Kafka message: {}", e.getMessage());
            log.error("Failed message content: {}", message);
            log.error("JSON error details: {}", e.getOriginalMessage());
        } catch (Exception e) {
            log.error("Error processing NSE indices data from Kafka: {}", e.getMessage(), e);
            log.error("Failed message content: {}", message);
            
            // In a production environment, you might want to send to a dead letter queue
            // or implement retry logic here
            
            // For now, just log the error and continue processing other messages
            // This prevents the consumer from stopping due to malformed messages
        }
    }

    /**
     * Process the received NSE indices tick data
     * 
     * @param tickData The parsed indices data
     */
    private void processNseIndicesTickData(NseIndicesTickDto tickData) {
        try {
            log.info("Processing NSE indices tick data with {} indices", 
                    tickData.getIndices() != null ? tickData.getIndices().length : 0);
            
            // Log the received data for monitoring purposes
            if (tickData.getIndices() != null && tickData.getIndices().length > 0) {
                for (NseIndicesTickDto.IndexTickDataDto indexData : tickData.getIndices()) {
                    log.debug("Received index data: {} - Last Price: {}, Change: {}%", 
                            indexData.getIndexName(), 
                            indexData.getLastPrice(), 
                            indexData.getPercentChange());
                }
            }
            
            // Log market status if available
            if (tickData.getMarketStatus() != null) {
                log.info("Market status: {}", tickData.getMarketStatus().getStatus());
            }
            
            log.info("Successfully processed NSE indices tick data in engines project");
            
            // TODO: Add additional processing logic here:
            // - Store in database
            // - Update cache
            // - Trigger analytics
            // - Send to other systems
            
        } catch (Exception e) {
            log.error("Error processing NSE indices tick data: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle any errors that occur during Kafka consumption
     * Note: This method is not needed as errors are handled by the main consumer method
     * and the global error handler in KafkaConfig
     */
}
