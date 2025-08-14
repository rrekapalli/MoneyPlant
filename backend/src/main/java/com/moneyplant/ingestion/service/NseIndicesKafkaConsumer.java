package com.moneyplant.ingestion.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.stock.dtos.IndicesDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Kafka consumer service for consuming NSE indices data from the engines project.
 * This service listens to the 'nse-indices-ticks' topic and processes incoming data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NseIndicesKafkaConsumer {

    private final ObjectMapper objectMapper;

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
        groupId = "${spring.kafka.consumer.group-id:trading-group}",
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
            
            // Parse the JSON message
            IndicesDto tickData = objectMapper.readValue(message, IndicesDto.class);
            
            log.info("Processed NSE indices data - Timestamp: {}, Indices count: {}, Source: {}", 
                    tickData.getTimestamp(), 
                    tickData.getIndices() != null ? tickData.getIndices().size() : 0,
                    tickData.getSource());
            
            // Process the tick data (store in database, update cache, etc.)
            processNseIndicesTickData(tickData);
            
            log.debug("Successfully processed NSE indices data from Kafka");
            
        } catch (Exception e) {
            log.error("Error processing NSE indices data from Kafka: {}", e.getMessage(), e);
            // In a production environment, you might want to send to a dead letter queue
            // or implement retry logic here
        }
    }

    /**
     * Process the received NSE indices tick data
     * 
     * @param tickData The parsed indices data
     */
    private void processNseIndicesTickData(IndicesDto tickData) {
        try {
            log.info("Processing NSE indices tick data with {} indices", 
                    tickData.getIndices() != null ? tickData.getIndices().size() : 0);
            
            // Log the received data for monitoring purposes
            if (tickData.getIndices() != null && !tickData.getIndices().isEmpty()) {
                for (IndicesDto.IndexDataDto indexData : tickData.getIndices()) {
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
            
            log.info("Successfully processed NSE indices tick data (database operations disabled)");
            
        } catch (Exception e) {
            log.error("Error processing NSE indices tick data: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle any errors that occur during Kafka consumption
     */
    @KafkaListener(
        topics = "${kafka.topics.nse-indices-ticks:nse-indices-ticks}",
        groupId = "${spring.kafka.consumer.group-id:trading-group}-error-handler",
        containerFactory = "kafkaListenerContainerFactory",
        errorHandler = "kafkaErrorHandler"
    )
    public void handleError(String message, Exception exception) {
        log.error("Error handling Kafka message: {}", exception.getMessage(), exception);
        log.error("Failed message content: {}", message);
    }
}
