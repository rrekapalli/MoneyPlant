package com.moneyplant.engines.ingestion.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.moneyplant.engines.common.NseIndicesTickDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.time.Instant;

/**
 * Kafka consumer service for consuming NSE indices data in the engines project.
 * This service listens to the 'nse-indices-ticks' topic and processes incoming data.
 * The engines project is responsible for data ingestion, processing, and distribution.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
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
        // Allow permissive formats often seen from NSE/raw producers
        this.objectMapper.configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        this.objectMapper.configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
        this.objectMapper.configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_COMMENTS, true);
    }

    /**
     * Consume NSE indices data from Kafka topic 'nse-indices-ticks'
     * Only active when Kafka is enabled.
     * 
     * @param message The JSON message from Kafka
     * @param topic The Kafka topic name
     * @param partition The Kafka partition number
     * @param offset The message offset
     */
    @KafkaListener(
        topics = "${kafka.topics.nse-indices-ticks:nse-indices-ticks}",
        groupId = "${spring.kafka.consumer.group-id:moneyplant-engines}",
        containerFactory = "kafkaListenerContainerFactory",
        autoStartup = "${spring.kafka.enabled:true}"
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
            
            NseIndicesTickDto tickData = null;
            try {
                // First try parsing as our DTO (backward compatible)
                tickData = objectMapper.readValue(message, NseIndicesTickDto.class);
                // If parsed but no indices, try to map from raw format
                if (tickData == null || tickData.getIndices() == null || tickData.getIndices().length == 0) {
                    tickData = parseRawKafkaMessage(message);
                }
            } catch (com.fasterxml.jackson.core.JsonProcessingException ex) {
                // Fallback to raw parsing if DTO parse fails
                log.warn("Standard DTO parsing failed, attempting raw NSE single-index mapping: {}", ex.getMessage());
                tickData = parseRawKafkaMessage(message);
            }

            if (tickData == null) {
                log.error("Unable to parse Kafka message into tick data. Skipping. Message: {}", message);
                return;
            }
            
            log.info("Processed NSE indices data - Timestamp: {}, Indices count: {}, Source: {}", 
                    tickData.getTimestamp(), 
                    tickData.getIndices() != null ? tickData.getIndices().length : 0,
                    tickData.getSource());
            
            // Process the tick data (store in database, update cache, etc.)
            processNseIndicesTickData(tickData);
            
            log.debug("Successfully processed NSE indices data from Kafka");
            
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

    /**
     * Fallback parser to handle raw NSE single-index or array formats coming on Kafka.
     */
    private NseIndicesTickDto parseRawKafkaMessage(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);

            NseIndicesTickDto dto = new NseIndicesTickDto();
            dto.setTimestamp(Instant.now().toString());
            dto.setSource("Kafka Raw NSE");
            dto.setIngestionTimestamp(Instant.now());

            java.util.List<NseIndicesTickDto.IndexTickDataDto> list = new java.util.ArrayList<>();

            if (root.has("data") && root.get("data").isArray()) {
                for (JsonNode idx : root.get("data")) {
                    NseIndicesTickDto.IndexTickDataDto one = mapIndexNode(idx);
                    if (one != null) list.add(one);
                }
            } else if (root.isArray()) {
                for (JsonNode idx : root) {
                    NseIndicesTickDto.IndexTickDataDto one = mapIndexNode(idx);
                    if (one != null) list.add(one);
                }
            } else {
                NseIndicesTickDto.IndexTickDataDto one = mapIndexNode(root);
                if (one != null) list.add(one);
            }

            if (!list.isEmpty()) {
                dto.setIndices(list.toArray(new NseIndicesTickDto.IndexTickDataDto[0]));
            }

            NseIndicesTickDto.MarketStatusTickDto status = mapMarketStatusFromRoot(root);
            if (status != null) dto.setMarketStatus(status);

            return dto;
        } catch (Exception ex) {
            log.error("Raw Kafka message parsing failed: {}", ex.getMessage(), ex);
            return null;
        }
    }

    private NseIndicesTickDto.IndexTickDataDto mapIndexNode(JsonNode node) {
        try {
            NseIndicesTickDto.IndexTickDataDto index = new NseIndicesTickDto.IndexTickDataDto();
            if (node.has("indexName")) index.setIndexName(node.get("indexName").asText());
            if (node.has("brdCstIndexName")) index.setIndexSymbol(node.get("brdCstIndexName").asText());
            if (node.has("currentPrice")) index.setLastPrice(node.get("currentPrice").decimalValue());
            if (node.has("change")) index.setVariation(node.get("change").decimalValue());
            if (node.has("perChange")) index.setPercentChange(node.get("perChange").decimalValue());
            if (node.has("open")) index.setOpenPrice(node.get("open").decimalValue());
            if (node.has("high")) index.setDayHigh(node.get("high").decimalValue());
            if (node.has("low")) index.setDayLow(node.get("low").decimalValue());
            if (node.has("previousClose")) index.setPreviousClose(node.get("previousClose").decimalValue());
            index.setTickTimestamp(Instant.now());
            return index;
        } catch (Exception e) {
            log.warn("Failed to map index node: {}", e.getMessage());
            return null;
        }
    }

    private NseIndicesTickDto.MarketStatusTickDto mapMarketStatusFromRoot(JsonNode root) {
        try {
            NseIndicesTickDto.MarketStatusTickDto status = new NseIndicesTickDto.MarketStatusTickDto();
            if (root.has("mktStatus")) {
                status.setStatus(root.get("mktStatus").asText());
            } else if (root.has("indStatus")) {
                status.setStatus(root.get("indStatus").asText());
            }
            if (status.getStatus() == null) return null;
            return status;
        } catch (Exception e) {
            return null;
        }
    }
}
