package com.moneyplant.engines.ingestion.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.engines.common.dto.NseIndicesTickDto;
import com.moneyplant.engines.common.entities.NseIndicesTick;
import com.moneyplant.engines.ingestion.service.NseIndicesService;
import com.moneyplant.engines.ingestion.service.NseIndicesTickService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.*;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.net.URI;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.CompletableFuture;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;
import java.util.List;
import java.util.ArrayList;

/**
 * Implementation of NseIndicesService for managing NSE indices data ingestion.
 * Connects to NSE WebSocket, processes data, and publishes to Kafka topics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NseIndicesServiceImpl extends TextWebSocketHandler implements NseIndicesService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final NseIndicesTickService nseIndicesTickService;

    @Value("${kafka.topics.nse-indices-ticks:nse-indices-ticks}")
    private String kafkaTopic;

    @Value("${nse.websocket.url:wss://www.nseindia.com/streams/indices/high/drdMkt}")
    private String nseWebSocketUrl;

    @Value("${nse.websocket.reconnect.interval:30}")
    private long reconnectIntervalSeconds;

    @Value("${spring.kafka.enabled:true}")
    private boolean kafkaEnabled;

    @Value("${nse.websocket.fallback.enabled:false}")
    private boolean fallbackEnabled;

    @Value("${nse.websocket.fallback.mock-interval:5000}")
    private long fallbackMockInterval;

    @Value("${nse.websocket.enabled:true}")
    private boolean nseWebSocketEnabled;

    // WebSocket components
    private WebSocketSession webSocketSession;
    private WebSocketClient webSocketClient;
    private ScheduledExecutorService reconnectExecutor;
    private volatile boolean isConnecting = false;
    private volatile boolean isConnected = false;

    // Subscription tracking
    private final Map<String, Boolean> activeSubscriptions = new ConcurrentHashMap<>();
    private final Map<String, Boolean> specificIndexSubscriptions = new ConcurrentHashMap<>();
    private boolean allIndicesSubscribed = false;

    // Data cache
    private final Map<String, NseIndicesTickDto> latestIndexDataMap = new ConcurrentHashMap<>();
    private final List<NseIndicesTickDto> latestIndicesData = new ArrayList<>();

    // Statistics
    private long messagesReceived = 0;
    private long messagesPublished = 0;
    private long lastMessageTimestamp = 0;
    private Instant connectionStartTime;

    /**
     * Initialize WebSocket client and executor on service startup
     */
    @PostConstruct
    public void initializeWebSocketClient() {
        webSocketClient = new StandardWebSocketClient();
        reconnectExecutor = Executors.newSingleThreadScheduledExecutor();
        log.info("NSE Indices WebSocket client initialized. Connection will be established when ingestion starts.");
    }

    /**
     * Clean up resources on service shutdown
     */
    @PreDestroy
    public void cleanup() {
        stopNseIndicesIngestion();
        if (reconnectExecutor != null && !reconnectExecutor.isShutdown()) {
            reconnectExecutor.shutdown();
        }
    }

    /**
     * Start NSE indices ingestion
     */
    @Override
    public void startNseIndicesIngestion() {
        if (isConnected) {
            log.info("NSE indices ingestion is already running");
            return;
        }

        log.info("Starting NSE indices ingestion with real NSE WebSocket connection");
        
        // Connect to NSE WebSocket for real data
        if (nseWebSocketEnabled) {
            connectToNseWebSocket();
        } else {
            log.warn("NSE WebSocket is disabled. Please enable it to receive real data.");
        }
    }

    @Override
    public void stopNseIndicesIngestion() {
        try {
            log.info("Stopping NSE indices data ingestion...");
            
            if (webSocketSession != null && webSocketSession.isOpen()) {
                webSocketSession.close();
            }
            
            isConnected = false;
            isConnecting = false;
            
            // Clear subscriptions
            activeSubscriptions.clear();
            specificIndexSubscriptions.clear();
            allIndicesSubscribed = false;
            
            log.info("NSE indices data ingestion stopped successfully");
        } catch (Exception e) {
            log.error("Error stopping NSE indices ingestion: {}", e.getMessage(), e);
        }
    }

    @Override
    public String getIngestionStatus() {
        if (isConnected) {
            long uptime = connectionStartTime != null ? 
                System.currentTimeMillis() - connectionStartTime.toEpochMilli() : 0;
            return String.format("RUNNING - Connected for %d seconds, Messages: %d, Published: %d", 
                    uptime / 1000, messagesReceived, messagesPublished);
        } else if (isConnecting) {
            return "CONNECTING";
        } else {
            return "STOPPED";
        }
    }

    @Override
    public void subscribeToAllIndices() {
        if (!isConnected) {
            log.warn("Cannot subscribe to all indices - WebSocket not connected");
            return;
        }

        try {
            allIndicesSubscribed = true;
            activeSubscriptions.put("ALL_INDICES", true);
            
            // Send subscription message to NSE WebSocket
            String subscriptionMessage = "{\"action\":\"subscribe\",\"channel\":\"indices\"}";
            webSocketSession.sendMessage(new TextMessage(subscriptionMessage));
            
            log.info("Subscribed to all NSE indices data");
        } catch (Exception e) {
            log.error("Failed to subscribe to all indices: {}", e.getMessage(), e);
        }
    }

    @Override
    public void subscribeToIndex(String indexName) {
        if (!isConnected) {
            log.warn("Cannot subscribe to index {} - WebSocket not connected", indexName);
            return;
        }

        try {
            specificIndexSubscriptions.put(indexName, true);
            
            // Send subscription message to NSE WebSocket
            String subscriptionMessage = String.format(
                "{\"action\":\"subscribe\",\"channel\":\"indices\",\"index\":\"%s\"}", 
                indexName
            );
            webSocketSession.sendMessage(new TextMessage(subscriptionMessage));
            
            log.info("Subscribed to NSE index: {}", indexName);
        } catch (Exception e) {
            log.error("Failed to subscribe to index {}: {}", indexName, e.getMessage(), e);
        }
    }

    @Override
    public void unsubscribeFromAllIndices() {
        if (!isConnected) {
            return;
        }

        try {
            allIndicesSubscribed = false;
            activeSubscriptions.remove("ALL_INDICES");
            
            String unsubscribeMessage = "{\"action\":\"unsubscribe\",\"channel\":\"indices\"}";
            webSocketSession.sendMessage(new TextMessage(unsubscribeMessage));
            
            log.info("Unsubscribed from all NSE indices data");
        } catch (Exception e) {
            log.error("Failed to unsubscribe from all indices: {}", e.getMessage(), e);
        }
    }

    @Override
    public void unsubscribeFromIndex(String indexName) {
        if (!isConnected) {
            return;
        }

        try {
            specificIndexSubscriptions.remove(indexName);
            
            String unsubscribeMessage = String.format(
                "{\"action\":\"unsubscribe\",\"channel\":\"indices\",\"index\":\"%s\"}", 
                indexName
            );
            webSocketSession.sendMessage(new TextMessage(unsubscribeMessage));
            
            log.info("Unsubscribed from NSE index: {}", indexName);
        } catch (Exception e) {
            log.error("Failed to unsubscribe from index {}: {}", indexName, e.getMessage(), e);
        }
    }

    @Override
    public List<NseIndicesTickDto> getLatestIndicesData() {
        try {
            // Get latest data from database instead of local cache
            List<NseIndicesTick> latestTicks = nseIndicesTickService.getLatestTicksForAllIndices();
            return latestTicks.stream()
                .map(nseIndicesTickService::convertEntityToDto)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving latest indices data from database: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public NseIndicesTickDto getLatestIndexData(String indexName) {
        try {
            // Get latest data from database instead of local cache
            NseIndicesTick latestTick = nseIndicesTickService.getLatestTickData(indexName);
            return latestTick != null ? nseIndicesTickService.convertEntityToDto(latestTick) : null;
        } catch (Exception e) {
            log.error("Error retrieving latest index data for {} from database: {}", indexName, e.getMessage(), e);
            return null;
        }
    }

    @Override
    public void triggerManualIngestion() {
        log.info("Manual ingestion triggered");
        if (!isConnected) {
            startNseIndicesIngestion();
        } else {
            log.info("WebSocket already connected, manual ingestion not needed");
        }
    }

    @Override
    public boolean isWebSocketConnected() {
        return isConnected && webSocketSession != null && webSocketSession.isOpen();
    }

    @Override
    public String getConnectionStats() {
        return String.format(
            "Connected: %s, Messages Received: %d, Messages Published: %d, Last Message: %d ms ago",
            isConnected, messagesReceived, messagesPublished, 
            lastMessageTimestamp > 0 ? System.currentTimeMillis() - lastMessageTimestamp : 0
        );
    }

    /**
     * Connect to NSE WebSocket for indices data
     */
    private void connectToNseWebSocket() {
        if (isConnecting) {
            return;
        }

        try {
            isConnecting = true;
            log.info("Connecting to NSE indices WebSocket: {}", nseWebSocketUrl);

            // Create WebSocket connection with proper headers like the backend
            WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.add("Origin", "https://www.nseindia.com");
            headers.add("Accept", "*/*");
            headers.add("Accept-Language", "en-US,en;q=0.9");
            headers.add("Accept-Encoding", "gzip, deflate, br");
            headers.add("Connection", "keep-alive");
            headers.add("Upgrade", "websocket");
            headers.add("Sec-WebSocket-Version", "13");

            ListenableFuture<WebSocketSession> connectionFuture = webSocketClient.doHandshake(
                this, headers, URI.create(nseWebSocketUrl)
            );

            connectionFuture.addCallback(new ListenableFutureCallback<WebSocketSession>() {
                @Override
                public void onSuccess(WebSocketSession session) {
                    webSocketSession = session;
                    isConnected = true;
                    isConnecting = false;
                    connectionStartTime = Instant.now();
                    log.info("Successfully connected to NSE WebSocket");
                    
                    // Send initial subscription message
                    try {
                        String subscriptionMessage = "{\"action\":\"subscribe\",\"channel\":\"indices\"}";
                        webSocketSession.sendMessage(new TextMessage(subscriptionMessage));
                        log.info("Sent subscription message to NSE WebSocket");
                    } catch (Exception e) {
                        log.warn("Failed to send subscription message to NSE: {}", e.getMessage());
                    }
                }

                @Override
                public void onFailure(Throwable ex) {
                    isConnecting = false;
                    log.error("Failed to connect to NSE WebSocket: {}", ex.getMessage());
                    log.error("This might be due to network restrictions or NSE requiring authentication");
                    
                    // Schedule reconnection attempt
                    scheduleReconnect();
                }
            });
            
        } catch (Exception e) {
            isConnecting = false;
            log.error("Failed to connect to NSE WebSocket: {}", e.getMessage(), e);
            
            // Schedule reconnection attempt
            scheduleReconnect();
        }
    }

    /**
     * Restore active subscriptions after reconnection
     */
    private void restoreSubscriptions() {
        if (allIndicesSubscribed) {
            subscribeToAllIndices();
        }
        
        specificIndexSubscriptions.forEach((indexName, subscribed) -> {
            if (subscribed) {
                subscribeToIndex(indexName);
            }
        });
    }

    /**
     * Schedule reconnection attempt
     */
    private void scheduleReconnect() {
        if (reconnectExecutor != null && !reconnectExecutor.isShutdown()) {
            reconnectExecutor.schedule(this::connectToNseWebSocket, reconnectIntervalSeconds, TimeUnit.SECONDS);
            log.info("Scheduled reconnection attempt in {} seconds", reconnectIntervalSeconds);
        }
    }

    /**
     * WebSocket connection established
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connection established with NSE");
        isConnected = true;
        connectionStartTime = Instant.now();
    }

    /**
     * Handle incoming WebSocket messages
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            messagesReceived++;
            lastMessageTimestamp = System.currentTimeMillis();
            
            String payload = message.getPayload();
            log.info("=== NSE WebSocket Message ===");
            log.info("Raw message: {}", payload);
            log.info("Message length: {}", payload.length());
            log.info("First 200 chars: {}", payload.length() > 200 ? payload.substring(0, 200) + "..." : payload);
            log.info("=============================");
            
            // Parse and process the message
            processNseIndicesMessage(payload);
            
        } catch (Exception e) {
            log.error("Error processing WebSocket message: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle WebSocket connection closure
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("WebSocket connection closed with status: {}", status);
        isConnected = false;
        
        if (status.getCode() != CloseStatus.NORMAL.getCode()) {
            scheduleReconnect();
        }
    }

    /**
     * Handle WebSocket transport errors
     */
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket transport error: {}", exception.getMessage(), exception);
        isConnected = false;
        scheduleReconnect();
    }

    /**
     * Process NSE indices message and publish to Kafka
     */
    private void processNseIndicesMessage(String message) {
        try {
            log.info("Processing NSE indices message: {}", message);
            
            // Parse the JSON message
            JsonNode jsonNode = objectMapper.readTree(message);
            log.info("Parsed JSON structure: {}", jsonNode.toPrettyString());
            
            // Create DTO from the message using the same logic as backend
            NseIndicesTickDto tickData = parseNseIndicesData(jsonNode);
            if (tickData != null) {
                tickData.setIngestionTimestamp(Instant.now());
                
                log.info("Created tick data: timestamp={}, indices={}, source={}, marketStatus={}", 
                        tickData.getTimestamp(), 
                        tickData.getIndices() != null ? tickData.getIndices().length : 0,
                        tickData.getSource(),
                        tickData.getMarketStatus() != null ? "present" : "null");
                
                // Save to database using UPSERT operation
                try {
                    nseIndicesTickService.upsertTickData(tickData);
                    log.debug("Successfully saved tick data to database");
                } catch (Exception dbException) {
                    log.error("Failed to save tick data to database: {}", dbException.getMessage(), dbException);
                }
                
                // Update local cache
                updateLocalCache(tickData);
                
                // Publish to Kafka
                publishToKafka(tickData);
            } else {
                log.warn("Failed to parse NSE indices data, skipping message");
            }
            
        } catch (JsonProcessingException e) {
            log.error("Failed to parse NSE indices message: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Failed to process NSE indices message: {}", e.getMessage(), e);
        }
    }

    /**
     * Parse NSE JSON data into NseIndicesTickDto using the same logic as backend
     */
    private NseIndicesTickDto parseNseIndicesData(JsonNode rootNode) {
        try {
            NseIndicesTickDto dto = new NseIndicesTickDto();
            dto.setTimestamp(Instant.now().toString());
            dto.setSource("NSE WebSocket");
            
            List<NseIndicesTickDto.IndexTickDataDto> indices = new ArrayList<>();
            
            // Handle different NSE data formats
            if (rootNode.has("data") && rootNode.get("data").isArray()) {
                // Format: {"data": [{"indexName": "...", "currentPrice": ...}, ...]}
                for (JsonNode indexNode : rootNode.get("data")) {
                    NseIndicesTickDto.IndexTickDataDto indexData = parseIndexNode(indexNode);
                    if (indexData != null) {
                        indices.add(indexData);
                    }
                }
            } else if (rootNode.has("indexName")) {
                // Format: {"indexName": "...", "currentPrice": ...} (single index)
                NseIndicesTickDto.IndexTickDataDto indexData = parseIndexNode(rootNode);
                if (indexData != null) {
                    indices.add(indexData);
                }
            }
            
            if (!indices.isEmpty()) {
                dto.setIndices(indices.toArray(new NseIndicesTickDto.IndexTickDataDto[0]));
            }
            
            // Parse market status if available
            if (rootNode.has("marketStatus")) {
                NseIndicesTickDto.MarketStatusTickDto marketStatus = parseMarketStatusNode(rootNode.get("marketStatus"));
                dto.setMarketStatus(marketStatus);
            }
            
            return dto;
            
        } catch (Exception e) {
            log.error("Error parsing NSE indices data structure: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Parse individual index node from NSE data
     */
    private NseIndicesTickDto.IndexTickDataDto parseIndexNode(JsonNode indexNode) {
        try {
            NseIndicesTickDto.IndexTickDataDto indexData = new NseIndicesTickDto.IndexTickDataDto();
            
            // Map NSE field names to DTO field names (same as backend)
            if (indexNode.has("indexName")) {
                indexData.setIndexName(indexNode.get("indexName").asText());
            }
            if (indexNode.has("brdCstIndexName")) {
                indexData.setIndexSymbol(indexNode.get("brdCstIndexName").asText());
            }
            if (indexNode.has("currentPrice")) {
                indexData.setLastPrice(indexNode.get("currentPrice").decimalValue());
            }
            if (indexNode.has("change")) {
                indexData.setVariation(indexNode.get("change").decimalValue());
            }
            if (indexNode.has("perChange")) {
                indexData.setPercentChange(indexNode.get("perChange").decimalValue());
            }
            
            // Set timestamp
            indexData.setTickTimestamp(Instant.now());
            
            return indexData;
            
        } catch (Exception e) {
            log.error("Error parsing index node: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Parse market status node from NSE data
     */
    private NseIndicesTickDto.MarketStatusTickDto parseMarketStatusNode(JsonNode statusNode) {
        try {
            NseIndicesTickDto.MarketStatusTickDto marketStatus = new NseIndicesTickDto.MarketStatusTickDto();
            
            if (statusNode.has("marketStatus")) {
                marketStatus.setStatus(statusNode.get("marketStatus").asText());
            }
            if (statusNode.has("marketStatusMessage")) {
                marketStatus.setMessage(statusNode.get("marketStatusMessage").asText());
            }
            if (statusNode.has("tradeDate")) {
                marketStatus.setTradeDate(statusNode.get("tradeDate").asText());
            }
            if (statusNode.has("index")) {
                marketStatus.setIndex(statusNode.get("index").asText());
            }
            if (statusNode.has("last")) {
                marketStatus.setLast(statusNode.get("last").decimalValue());
            }
            if (statusNode.has("variation")) {
                marketStatus.setVariation(statusNode.get("variation").decimalValue());
            }
            if (statusNode.has("percentChange")) {
                marketStatus.setPercentChange(statusNode.get("percentChange").decimalValue());
            }
            if (statusNode.has("marketStatusTime")) {
                marketStatus.setMarketStatusTime(statusNode.get("marketStatusTime").asText());
            }
            
            return marketStatus;
            
        } catch (Exception e) {
            log.error("Error parsing market status node: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Update local cache with latest data
     */
    private void updateLocalCache(NseIndicesTickDto tickData) {
        if (tickData.getIndices() != null) {
            for (NseIndicesTickDto.IndexTickDataDto indexData : tickData.getIndices()) {
                if (indexData.getIndexName() != null) {
                    latestIndexDataMap.put(indexData.getIndexName(), tickData);
                }
            }
        }
        
        // Keep only last 100 entries in the list for WebSocket broadcasting
        latestIndicesData.add(tickData);
        if (latestIndicesData.size() > 100) {
            latestIndicesData.remove(0);
        }
        
        // Broadcast to WebSocket subscribers
        broadcastToWebSocketSubscribers(tickData);
    }

    /**
     * Broadcast NSE indices data to WebSocket subscribers
     */
    private void broadcastToWebSocketSubscribers(NseIndicesTickDto tickData) {
        try {
            // Broadcast to all indices subscribers
            messagingTemplate.convertAndSend("/topic/nse-indices", tickData);
            
            // Broadcast to specific index subscribers if we have index data
            if (tickData.getIndices() != null) {
                for (NseIndicesTickDto.IndexTickDataDto indexData : tickData.getIndices()) {
                    if (indexData.getIndexName() != null) {
                        String topic = "/topic/nse-indices/" + indexData.getIndexName().replace(" ", "-").toLowerCase();
                        messagingTemplate.convertAndSend(topic, tickData);
                    }
                }
            }
            
            log.debug("Broadcasted NSE indices data to WebSocket subscribers");
            
        } catch (Exception e) {
            log.error("Error broadcasting to WebSocket subscribers: {}", e.getMessage(), e);
        }
    }

    /**
     * Publish tick data to Kafka topic
     */
    private void publishToKafka(NseIndicesTickDto tickData) {
        try {
            String messageKey = "nse-indices-" + System.currentTimeMillis();
            String messageValue = objectMapper.writeValueAsString(tickData);
            
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(kafkaTopic, messageKey, messageValue);
            
            future.whenComplete((result, throwable) -> {
                if (throwable != null) {
                    log.error("Failed to publish to Kafka topic {}: {}", kafkaTopic, throwable.getMessage(), throwable);
                } else {
                    messagesPublished++;
                    log.debug("Successfully published to Kafka topic {}: partition={}, offset={}", 
                            kafkaTopic, result.getRecordMetadata().partition(), result.getRecordMetadata().offset());
                }
            });
            
        } catch (Exception e) {
            log.error("Error publishing to Kafka: {}", e.getMessage(), e);
        }
    }


}
