package com.moneyplant.engines.ingestion.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.engines.common.dto.NseIndicesTickDto;
import com.moneyplant.engines.ingestion.service.NseIndicesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
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

    @Value("${kafka.topics.nse-indices-ticks:nse-indices-ticks}")
    private String kafkaTopic;

    @Value("${nse.websocket.url:wss://www.nseindia.com/streams/indices/high/drdMkt}")
    private String nseWebSocketUrl;

    @Value("${nse.websocket.reconnect.interval:30}")
    private long reconnectIntervalSeconds;

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

    @Override
    public void startNseIndicesIngestion() {
        if (isConnected || isConnecting) {
            log.info("NSE indices ingestion is already running or connecting");
            return;
        }

        try {
            log.info("Starting NSE indices data ingestion...");
            connectToNseWebSocket();
            connectionStartTime = Instant.now();
        } catch (Exception e) {
            log.error("Failed to start NSE indices ingestion: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to start NSE indices ingestion", e);
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
        return new ArrayList<>(latestIndicesData);
    }

    @Override
    public NseIndicesTickDto getLatestIndexData(String indexName) {
        return latestIndexDataMap.get(indexName);
    }

    @Override
    public void triggerManualIngestion() {
        log.info("Manual ingestion triggered");
        if (!isConnected) {
            startNseIndicesIngestion();
        } else {
            // Simulate data ingestion for testing
            simulateDataIngestion();
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

            // Create WebSocket connection
            CompletableFuture<WebSocketSession> connectionFuture = webSocketClient.doHandshake(
                this, new WebSocketHttpHeaders(), URI.create(nseWebSocketUrl)
            );

            connectionFuture.whenComplete((session, throwable) -> {
                if (throwable != null) {
                    log.error("Failed to connect to NSE WebSocket: {}", throwable.getMessage(), throwable);
                    isConnecting = false;
                    scheduleReconnect();
                } else {
                    webSocketSession = session;
                    isConnected = true;
                    isConnecting = false;
                    log.info("Successfully connected to NSE WebSocket");
                    
                    // Restore subscriptions if any
                    restoreSubscriptions();
                }
            });

        } catch (Exception e) {
            log.error("Error connecting to NSE WebSocket: {}", e.getMessage(), e);
            isConnecting = false;
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
            log.debug("Received WebSocket message: {}", payload);
            
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
            // Parse the JSON message
            JsonNode jsonNode = objectMapper.readTree(message);
            
            // Create DTO from the message
            NseIndicesTickDto tickData = createTickDataFromJson(jsonNode);
            tickData.setIngestionTimestamp(Instant.now());
            
            // Update local cache
            updateLocalCache(tickData);
            
            // Publish to Kafka
            publishToKafka(tickData);
            
        } catch (JsonProcessingException e) {
            log.error("Failed to parse NSE indices message: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Failed to process NSE indices message: {}", e.getMessage(), e);
        }
    }

    /**
     * Create tick data DTO from JSON message
     */
    private NseIndicesTickDto createTickDataFromJson(JsonNode jsonNode) {
        NseIndicesTickDto tickData = new NseIndicesTickDto();
        
        // Extract basic fields
        if (jsonNode.has("timestamp")) {
            tickData.setTimestamp(jsonNode.get("timestamp").asText());
        }
        
        if (jsonNode.has("source")) {
            tickData.setSource(jsonNode.get("source").asText());
        }
        
        // Extract indices data
        if (jsonNode.has("indices") && jsonNode.get("indices").isArray()) {
            JsonNode indicesArray = jsonNode.get("indices");
            NseIndicesTickDto.IndexTickDataDto[] indices = new NseIndicesTickDto.IndexTickDataDto[indicesArray.size()];
            
            for (int i = 0; i < indicesArray.size(); i++) {
                indices[i] = createIndexDataFromJson(indicesArray.get(i));
            }
            
            tickData.setIndices(indices);
        }
        
        // Extract market status
        if (jsonNode.has("marketStatus")) {
            tickData.setMarketStatus(createMarketStatusFromJson(jsonNode.get("marketStatus")));
        }
        
        return tickData;
    }

    /**
     * Create index data DTO from JSON
     */
    private NseIndicesTickDto.IndexTickDataDto createIndexDataFromJson(JsonNode indexNode) {
        NseIndicesTickDto.IndexTickDataDto indexData = new NseIndicesTickDto.IndexTickDataDto();
        
        if (indexNode.has("key")) indexData.setKey(indexNode.get("key").asText());
        if (indexNode.has("index")) indexData.setIndexName(indexNode.get("index").asText());
        if (indexNode.has("indexSymbol")) indexData.setIndexSymbol(indexNode.get("indexSymbol").asText());
        if (indexNode.has("last")) indexData.setLastPrice(indexNode.get("last").decimalValue());
        if (indexNode.has("variation")) indexData.setVariation(indexNode.get("variation").decimalValue());
        if (indexNode.has("percentChange")) indexData.setPercentChange(indexNode.get("percentChange").decimalValue());
        if (indexNode.has("open")) indexData.setOpenPrice(indexNode.get("open").decimalValue());
        if (indexNode.has("dayHigh")) indexData.setDayHigh(indexNode.get("dayHigh").decimalValue());
        if (indexNode.has("dayLow")) indexData.setDayLow(indexNode.get("dayLow").decimalValue());
        if (indexNode.has("previousClose")) indexData.setPreviousClose(indexNode.get("previousClose").decimalValue());
        if (indexNode.has("yearHigh")) indexData.setYearHigh(indexNode.get("yearHigh").decimalValue());
        if (indexNode.has("yearLow")) indexData.setYearLow(indexNode.get("yearLow").decimalValue());
        if (indexNode.has("indicativeClose")) indexData.setIndicativeClose(indexNode.get("indicativeClose").decimalValue());
        if (indexNode.has("pe")) indexData.setPeRatio(indexNode.get("pe").decimalValue());
        if (indexNode.has("pb")) indexData.setPbRatio(indexNode.get("pb").decimalValue());
        if (indexNode.has("dy")) indexData.setDividendYield(indexNode.get("dy").decimalValue());
        if (indexNode.has("declines")) indexData.setDeclines(indexNode.get("declines").asInt());
        if (indexNode.has("advances")) indexData.setAdvances(indexNode.get("advances").asInt());
        if (indexNode.has("unchanged")) indexData.setUnchanged(indexNode.get("unchanged").asInt());
        if (indexNode.has("perChange365d")) indexData.setPercentChange365d(indexNode.get("perChange365d").decimalValue());
        if (indexNode.has("date365dAgo")) indexData.setDate365dAgo(indexNode.get("date365dAgo").asText());
        if (indexNode.has("perChange30d")) indexData.setPercentChange30d(indexNode.get("perChange30d").decimalValue());
        if (indexNode.has("date30dAgo")) indexData.setDate30dAgo(indexNode.get("date30dAgo").asText());
        if (indexNode.has("chart365dPath")) indexData.setChart365dPath(indexNode.get("chart365dPath").asText());
        if (indexNode.has("chart30dPath")) indexData.setChart30dPath(indexNode.get("chart30dPath").asText());
        if (indexNode.has("chartTodayPath")) indexData.setChartTodayPath(indexNode.get("chartTodayPath").asText());
        
        indexData.setTickTimestamp(Instant.now());
        
        return indexData;
    }

    /**
     * Create market status DTO from JSON
     */
    private NseIndicesTickDto.MarketStatusTickDto createMarketStatusFromJson(JsonNode statusNode) {
        NseIndicesTickDto.MarketStatusTickDto marketStatus = new NseIndicesTickDto.MarketStatusTickDto();
        
        if (statusNode.has("marketStatus")) marketStatus.setStatus(statusNode.get("marketStatus").asText());
        if (statusNode.has("marketStatusMessage")) marketStatus.setMessage(statusNode.get("marketStatusMessage").asText());
        if (statusNode.has("tradeDate")) marketStatus.setTradeDate(statusNode.get("tradeDate").asText());
        if (statusNode.has("index")) marketStatus.setIndex(statusNode.get("index").asText());
        if (statusNode.has("last")) marketStatus.setLast(statusNode.get("last").decimalValue());
        if (statusNode.has("variation")) marketStatus.setVariation(statusNode.get("variation").decimalValue());
        if (statusNode.has("percentChange")) marketStatus.setPercentChange(statusNode.get("percentChange").decimalValue());
        if (statusNode.has("marketStatusTime")) marketStatus.setMarketStatusTime(statusNode.get("marketStatusTime").asText());
        
        return marketStatus;
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
        
        // Keep only last 100 entries in the list
        latestIndicesData.add(tickData);
        if (latestIndicesData.size() > 100) {
            latestIndicesData.remove(0);
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

    /**
     * Simulate data ingestion for testing purposes
     */
    private void simulateDataIngestion() {
        try {
            log.info("Simulating NSE indices data ingestion for testing");
            
            // Create mock data
            NseIndicesTickDto mockData = createMockIndicesData();
            mockData.setIngestionTimestamp(Instant.now());
            
            // Update local cache
            updateLocalCache(mockData);
            
            // Publish to Kafka
            publishToKafka(mockData);
            
            log.info("Mock NSE indices data published to Kafka");
            
        } catch (Exception e) {
            log.error("Error simulating data ingestion: {}", e.getMessage(), e);
        }
    }

    /**
     * Create mock indices data for testing
     */
    private NseIndicesTickDto createMockIndicesData() {
        NseIndicesTickDto mockData = new NseIndicesTickDto();
        mockData.setTimestamp(Instant.now().toString());
        mockData.setSource("MOCK_NSE");
        
        // Create mock index data
        NseIndicesTickDto.IndexTickDataDto mockIndex = new NseIndicesTickDto.IndexTickDataDto();
        mockIndex.setIndexName("NIFTY 50");
        mockIndex.setIndexSymbol("NIFTY");
        mockIndex.setLastPrice(new java.math.BigDecimal("19500.50"));
        mockIndex.setVariation(new java.math.BigDecimal("150.25"));
        mockIndex.setPercentChange(new java.math.BigDecimal("0.78"));
        mockIndex.setTickTimestamp(Instant.now());
        
        mockData.setIndices(new NseIndicesTickDto.IndexTickDataDto[]{mockIndex});
        
        return mockData;
    }
}
