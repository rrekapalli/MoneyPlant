package com.moneyplant.stock.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.core.entities.Index;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.stock.dtos.IndicesDto;
import com.moneyplant.stock.dtos.IndicesDto.IndexDataDto;
import com.moneyplant.stock.dtos.IndicesDto.MarketStatusDto;
import com.moneyplant.index.repositories.IndexRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.*;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.http.HttpHeaders;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.TextMessage;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.net.URI;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Service for managing NSE indices data streaming from WebSocket.
 * Connects to NSE indices WebSocket stream and provides real-time data updates.
 * 
 * WebSocket URL: wss://www.nseindia.com/streams/indices/high/drdMkt
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IndicesService {

    private final SimpMessagingTemplate messagingTemplate;
    private final IndexRepository indexRepository;
    private final ObjectMapper objectMapper;

    // NSE WebSocket URL for indices data
    private static final String NSE_INDICES_WS_URL = "wss://www.nseindia.com/streams/indices/high/drdMkt";
    
    // Track active subscriptions
    private final Map<String, Boolean> activeSubscriptions = new ConcurrentHashMap<>();
    private final Map<String, Boolean> specificIndexSubscriptions = new ConcurrentHashMap<>();
    
    // WebSocket client
    private WebSocketSession webSocketSession;
    private WebSocketClient webSocketClient;
    private ScheduledExecutorService reconnectExecutor;
    private boolean allIndicesSubscribed = false;
    private volatile boolean isConnecting = false;
    
    // Cache for latest indices data
    private IndicesDto latestIndicesData;
    private final Map<String, IndexDataDto> latestIndexDataMap = new ConcurrentHashMap<>();

    /**
     * Initialize WebSocket client and executor on service startup
     * Note: WebSocket connection is established only when there are active subscribers
     */
    @PostConstruct
    public void initializeWebSocketClient() {
        webSocketClient = new StandardWebSocketClient();
        reconnectExecutor = Executors.newSingleThreadScheduledExecutor();
        log.info("WebSocket client initialized. Connection will be established when subscribers are present.");
    }

    /**
     * Connect to NSE WebSocket for indices data only if there are active subscribers
     */
    private void connectToNseWebSocketIfNeeded() {
        if (hasActiveSubscribers() && !isWebSocketConnected() && !isConnecting) {
            connectToNseWebSocket();
        }
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
            log.info("Connecting to NSE indices WebSocket: {}", NSE_INDICES_WS_URL);
            
            WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.add("Origin", "https://www.nseindia.com");
            headers.add("Accept", "*/*");
            headers.add("Accept-Language", "en-US,en;q=0.9");
            headers.add("Accept-Encoding", "gzip, deflate, br");
            headers.add("Connection", "keep-alive");
            headers.add("Upgrade", "websocket");
            headers.add("Sec-WebSocket-Version", "13");
            
            webSocketClient.doHandshake(
                new NseIndicesWebSocketHandler(), 
                headers, 
                URI.create(NSE_INDICES_WS_URL)
            ).addCallback(
                result -> {
                    webSocketSession = result;
                    isConnecting = false;
                    log.info("Successfully connected to NSE WebSocket");
                    
                    // Send initial subscription message if needed
                    try {
                        String subscriptionMessage = "{\"action\":\"subscribe\",\"channel\":\"indices\"}";
                        webSocketSession.sendMessage(new TextMessage(subscriptionMessage));
                        log.info("Sent subscription message to NSE WebSocket");
                    } catch (Exception e) {
                        log.warn("Failed to send subscription message to NSE: {}", e.getMessage());
                    }
                },
                failure -> {
                    isConnecting = false;
                    log.error("Failed to connect to NSE WebSocket: {}", failure.getMessage());
                    log.error("This might be due to network restrictions or NSE requiring authentication");
                    
                    // Fallback to mock data for testing
                    log.info("Falling back to mock data for testing purposes");
                    startMockDataGeneration();
                    
                    scheduleReconnectionIfNeeded();
                }
            );
            
        } catch (Exception e) {
            isConnecting = false;
            log.error("Failed to connect to NSE WebSocket: {}", e.getMessage(), e);
            
            // Fallback to mock data for testing
            log.info("Falling back to mock data for testing purposes");
            startMockDataGeneration();
            
            scheduleReconnectionIfNeeded();
        }
    }
    
    /**
     * Generate mock data for testing when NSE connection fails
     */
    private void startMockDataGeneration() {
        if (reconnectExecutor != null && !reconnectExecutor.isShutdown()) {
            reconnectExecutor.scheduleAtFixedRate(() -> {
                if (hasActiveSubscribers()) {
                    generateAndBroadcastMockData();
                }
            }, 0, 5, TimeUnit.SECONDS); // Generate mock data every 5 seconds
        }
    }
    
    /**
     * Generate mock indices data for testing
     */
    private void generateAndBroadcastMockData() {
        try {
            IndicesDto mockData = new IndicesDto();
            mockData.setTimestamp(Instant.now().toString());
            mockData.setSource("Mock Data (NSE connection failed)");
            
            List<IndexDataDto> mockIndices = new ArrayList<>();
            
            // Generate mock data for common indices
            String[] indexNames = {"NIFTY 50", "SENSEX", "BANK NIFTY", "NIFTY IT", "NIFTY PHARMA"};
            
            for (String indexName : indexNames) {
                IndexDataDto mockIndex = new IndexDataDto();
                mockIndex.setIndexName(indexName);
                mockIndex.setIndexSymbol(indexName.replace(" ", "").toUpperCase());
                mockIndex.setLastPrice((float)(18000.0 + Math.random() * 2000));
                mockIndex.setVariation((float)(Math.random() * 100 - 50));
                mockIndex.setPercentChange((float)(Math.random() * 2 - 1));
                mockIndex.setOpenPrice((float)(17900.0 + Math.random() * 1000));
                mockIndex.setDayHigh((float)(18200.0 + Math.random() * 500));
                mockIndex.setDayLow((float)(17800.0 + Math.random() * 300));
                mockIndex.setPreviousClose((float)(17950.0 + Math.random() * 100));
                mockIndex.setYearHigh((float)(19000.0 + Math.random() * 1000));
                mockIndex.setYearLow((float)(17000.0 + Math.random() * 500));
                mockIndex.setIndicativeClose((float)(18050.0 + Math.random() * 100));
                mockIndex.setPeRatio((float)(20.0 + Math.random() * 5));
                mockIndex.setPbRatio((float)(3.0 + Math.random() * 2));
                mockIndex.setDividendYield((float)(1.5 + Math.random() * 1));
                mockIndex.setAdvances((int)(Math.random() * 100));
                mockIndex.setDeclines((int)(Math.random() * 50));
                mockIndex.setUnchanged((int)(Math.random() * 20));
                
                mockIndices.add(mockIndex);
            }
            
            mockData.setIndices(mockIndices);
            
            // Update cache
            latestIndicesData = mockData;
            updateIndexDataCache(mockData);
            
            // Broadcast to subscribers
            if (allIndicesSubscribed || !activeSubscriptions.isEmpty()) {
                broadcastAllIndices(mockData);
            }
            broadcastSpecificIndices(mockData);
            
            log.debug("Generated and broadcasted mock indices data");
            
        } catch (Exception e) {
            log.error("Error generating mock data: {}", e.getMessage(), e);
        }
    }

    /**
     * Check if WebSocket is currently connected
     */
    private boolean isWebSocketConnected() {
        return webSocketSession != null && webSocketSession.isOpen();
    }

    /**
     * Check if there are any active subscribers
     */
    private boolean hasActiveSubscribers() {
        return allIndicesSubscribed || !activeSubscriptions.isEmpty() || !specificIndexSubscriptions.isEmpty();
    }

    /**
     * Disconnect WebSocket if there are no active subscribers
     */
    private void disconnectWebSocketIfNotNeeded() {
        if (!hasActiveSubscribers() && isWebSocketConnected()) {
            try {
                log.info("No active subscribers, disconnecting from NSE WebSocket");
                webSocketSession.close();
                webSocketSession = null;
            } catch (Exception e) {
                log.error("Error disconnecting WebSocket: {}", e.getMessage(), e);
            }
        }
    }

    /**
     * WebSocket handler for NSE indices stream
     */
    private class NseIndicesWebSocketHandler implements WebSocketHandler {

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            webSocketSession = session;
            log.info("Connected to NSE indices WebSocket successfully");
        }

        @Override
        public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) {
            try {
                String payload = message.getPayload().toString();
                log.debug("Received NSE indices data: {}", payload);
                
                // Parse and process the incoming data
                processNseIndicesData(payload);
                
            } catch (Exception e) {
                log.error("Error processing NSE indices message: {}", e.getMessage(), e);
            }
        }

        @Override
        public void handleTransportError(WebSocketSession session, Throwable exception) {
            log.error("NSE WebSocket transport error: {}", exception.getMessage(), exception);
            // Attempt to reconnect only if there are active subscribers
            scheduleReconnectionIfNeeded();
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
            log.warn("NSE WebSocket connection closed: {}", closeStatus);
            webSocketSession = null;
            // Attempt to reconnect only if there are active subscribers
            scheduleReconnectionIfNeeded();
        }

        @Override
        public boolean supportsPartialMessages() {
            return false;
        }
    }

    /**
     * Process incoming NSE indices data and update subscribers
     */
    private void processNseIndicesData(String jsonData) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonData);
            
            // Parse the NSE data structure
            IndicesDto indicesDto = parseNseIndicesData(rootNode);
            
            if (indicesDto != null) {
                // Update cache
                latestIndicesData = indicesDto;
                updateIndexDataCache(indicesDto);
                
                // Broadcast to all subscribers if any are active
                if (allIndicesSubscribed || !activeSubscriptions.isEmpty()) {
                    broadcastAllIndices(indicesDto);
                }
                
                // Broadcast to specific index subscribers
                broadcastSpecificIndices(indicesDto);
                
                // Update database with latest data
                updateDatabaseWithLatestData(indicesDto);
            }
            
        } catch (JsonProcessingException e) {
            log.error("Error parsing NSE indices JSON data: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error processing NSE indices data: {}", e.getMessage(), e);
        }
    }

    /**
     * Parse NSE JSON data into IndicesDto
     */
    private IndicesDto parseNseIndicesData(JsonNode rootNode) {
        try {
            IndicesDto dto = new IndicesDto();
            dto.setTimestamp(Instant.now().toString());
            dto.setSource("NSE WebSocket");
            
            List<IndexDataDto> indices = new ArrayList<>();
            
            // Handle different NSE data formats
            if (rootNode.has("data") && rootNode.get("data").isArray()) {
                // Format: {"data": [{"indexName": "...", "currentPrice": ...}, ...]}
                for (JsonNode indexNode : rootNode.get("data")) {
                    IndexDataDto indexData = parseIndexNode(indexNode);
                    if (indexData != null) {
                        indices.add(indexData);
                    }
                }
            } else if (rootNode.has("indexName")) {
                // Format: {"indexName": "...", "currentPrice": ...} (single index)
                IndexDataDto indexData = parseIndexNode(rootNode);
                if (indexData != null) {
                    indices.add(indexData);
                }
            }
            
            dto.setIndices(indices);
            
            // Parse market status if available
            if (rootNode.has("marketStatus")) {
                MarketStatusDto marketStatus = objectMapper.treeToValue(rootNode.get("marketStatus"), MarketStatusDto.class);
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
    private IndexDataDto parseIndexNode(JsonNode indexNode) {
        try {
            IndexDataDto indexData = new IndexDataDto();
            
            // Map NSE field names to DTO field names
            if (indexNode.has("indexName")) {
                indexData.setIndexName(indexNode.get("indexName").asText());
            }
            if (indexNode.has("brdCstIndexName")) {
                indexData.setIndexSymbol(indexNode.get("brdCstIndexName").asText());
            }
            if (indexNode.has("currentPrice")) {
                indexData.setLastPrice((float) indexNode.get("currentPrice").asDouble());
            }
            if (indexNode.has("change")) {
                indexData.setVariation((float) indexNode.get("change").asDouble());
            }
            if (indexNode.has("perChange")) {
                indexData.setPercentChange((float) indexNode.get("perChange").asDouble());
            }
            if (indexNode.has("open")) {
                indexData.setOpenPrice((float) indexNode.get("open").asDouble());
            }
            if (indexNode.has("high")) {
                indexData.setDayHigh((float) indexNode.get("high").asDouble());
            }
            if (indexNode.has("low")) {
                indexData.setDayLow((float) indexNode.get("low").asDouble());
            }
            if (indexNode.has("previousClose")) {
                indexData.setPreviousClose((float) indexNode.get("previousClose").asDouble());
            }
            
            // Set key for identification
            indexData.setKey(indexData.getIndexName());
            
            log.debug("Parsed index data: {}", indexData);
            return indexData;
            
        } catch (Exception e) {
            log.error("Error parsing index node: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Update the index data cache for quick lookups
     */
    private void updateIndexDataCache(IndicesDto indicesDto) {
        if (indicesDto.getIndices() != null) {
            for (IndexDataDto indexData : indicesDto.getIndices()) {
                if (indexData.getIndexName() != null) {
                    latestIndexDataMap.put(indexData.getIndexName().toUpperCase(), indexData);
                }
            }
        }
    }

    /**
     * Broadcast indices data to all subscribers
     */
    private void broadcastAllIndices(IndicesDto indicesDto) {
        try {
            messagingTemplate.convertAndSend("/topic/indices", indicesDto);
            log.debug("Broadcasted all indices data to subscribers");
        } catch (Exception e) {
            log.error("Error broadcasting all indices data: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast specific index data to subscribers
     */
    private void broadcastSpecificIndices(IndicesDto indicesDto) {
        for (String indexName : specificIndexSubscriptions.keySet()) {
            try {
                IndexDataDto indexData = findIndexDataByName(indicesDto, indexName);
                if (indexData != null) {
                    IndicesDto specificDto = new IndicesDto();
                    specificDto.setTimestamp(indicesDto.getTimestamp());
                    specificDto.setSource(indicesDto.getSource());
                    specificDto.setMarketStatus(indicesDto.getMarketStatus());
                    specificDto.setIndices(List.of(indexData));
                    
                    String destination = "/topic/indices/" + indexName.replace(" ", "-").toUpperCase();
                    messagingTemplate.convertAndSend(destination, specificDto);
                    log.debug("Broadcasted index data for {} to destination {}", indexName, destination);
                }
            } catch (Exception e) {
                log.error("Error broadcasting data for index {}: {}", indexName, e.getMessage(), e);
            }
        }
    }

    /**
     * Find index data by name from the indices list
     */
    private IndexDataDto findIndexDataByName(IndicesDto indicesDto, String indexName) {
        if (indicesDto.getIndices() != null) {
            return indicesDto.getIndices().stream()
                .filter(index -> indexName.equalsIgnoreCase(index.getIndexName()))
                .findFirst()
                .orElse(null);
        }
        return null;
    }

    /**
     * Update database with latest indices data
     */
    private void updateDatabaseWithLatestData(IndicesDto indicesDto) {
        try {
            if (indicesDto.getIndices() != null) {
                for (IndexDataDto indexData : indicesDto.getIndices()) {
                    updateIndexInDatabase(indexData);
                }
            }
        } catch (Exception e) {
            log.error("Error updating database with indices data: {}", e.getMessage(), e);
        }
    }

    /**
     * Update individual index data in database
     */
    private void updateIndexInDatabase(IndexDataDto indexData) {
        try {
            Optional<Index> existingIndex = indexRepository.findByIndexNameIgnoreCase(indexData.getIndexName());
            
            Index index = existingIndex.orElse(new Index());
            
            // Map data from DTO to entity
            index.setKeyCategory(indexData.getKey());
            index.setIndexName(indexData.getIndexName());
            index.setIndexSymbol(indexData.getIndexSymbol());
            index.setLastPrice(indexData.getLastPrice());
            index.setVariation(indexData.getVariation());
            index.setPercentChange(indexData.getPercentChange());
            index.setOpenPrice(indexData.getOpenPrice());
            index.setHighPrice(indexData.getDayHigh());
            index.setLowPrice(indexData.getDayLow());
            index.setPreviousClose(indexData.getPreviousClose());
            index.setYearHigh(indexData.getYearHigh());
            index.setYearLow(indexData.getYearLow());
            index.setIndicativeClose(indexData.getIndicativeClose());
            index.setPeRatio(indexData.getPeRatio());
            index.setPbRatio(indexData.getPbRatio());
            index.setDividendYield(indexData.getDividendYield());
            index.setDeclines(indexData.getDeclines());
            index.setAdvances(indexData.getAdvances());
            index.setUnchanged(indexData.getUnchanged());
            index.setPercentChange365d(indexData.getPercentChange365d());
            index.setDate365dAgo(indexData.getDate365dAgo());
            index.setPercentChange30d(indexData.getPercentChange30d());
            index.setDate30dAgo(indexData.getDate30dAgo());
            index.setChart365dPath(indexData.getChart365dPath());
            index.setChart30dPath(indexData.getChart30dPath());
            index.setChartTodayPath(indexData.getChartTodayPath());
            
            // Set audit fields
            if (index.getId() == null) {
                index.setCreatedAt(Instant.now());
            }
            index.setUpdatedAt(Instant.now());
            
            indexRepository.save(index);
            
        } catch (Exception e) {
            log.error("Error updating index {} in database: {}", indexData.getIndexName(), e.getMessage(), e);
        }
    }

    /**
     * Subscribe to all indices updates
     */
    public void subscribeToAllIndices() {
        log.info("Subscribing to all indices updates");
        allIndicesSubscribed = true;
        activeSubscriptions.put("ALL", true);
        
        // Connect to WebSocket if this is the first subscriber
        connectToNseWebSocketIfNeeded();
    }

    /**
     * Subscribe to specific index updates
     */
    public void subscribeToIndex(String indexName) {
        log.info("Subscribing to index updates: {}", indexName);
        specificIndexSubscriptions.put(indexName.toUpperCase(), true);
        activeSubscriptions.put(indexName.toUpperCase(), true);
        
        // Connect to WebSocket if this is the first subscriber
        connectToNseWebSocketIfNeeded();
    }

    /**
     * Unsubscribe from all indices updates
     */
    public void unsubscribeFromAllIndices() {
        log.info("Unsubscribing from all indices updates");
        allIndicesSubscribed = false;
        activeSubscriptions.remove("ALL");
        
        // Disconnect WebSocket if no more subscribers
        disconnectWebSocketIfNotNeeded();
    }

    /**
     * Unsubscribe from specific index updates
     */
    public void unsubscribeFromIndex(String indexName) {
        log.info("Unsubscribing from index updates: {}", indexName);
        specificIndexSubscriptions.remove(indexName.toUpperCase());
        activeSubscriptions.remove(indexName.toUpperCase());
        
        // Disconnect WebSocket if no more subscribers
        disconnectWebSocketIfNotNeeded();
    }

    /**
     * Get all indices data
     */
    public IndicesDto getAllIndices() {
        if (latestIndicesData != null) {
            return latestIndicesData;
        }
        
        // Fallback to database if no WebSocket data available
        return getIndicesFromDatabase();
    }

    /**
     * Get specific index data
     */
    public IndicesDto getIndexData(String indexName) {
        IndexDataDto indexData = latestIndexDataMap.get(indexName.toUpperCase());
        
        if (indexData != null) {
            IndicesDto dto = new IndicesDto();
            dto.setTimestamp(Instant.now().toString());
            dto.setSource("NSE WebSocket");
            dto.setIndices(List.of(indexData));
            return dto;
        }
        
        // Fallback to database
        return getIndexFromDatabase(indexName);
    }

    /**
     * Get indices data from database as fallback
     */
    private IndicesDto getIndicesFromDatabase() {
        try {
            List<Index> indices = indexRepository.findAll();
            
            IndicesDto dto = new IndicesDto();
            dto.setTimestamp(Instant.now().toString());
            dto.setSource("Database");
            
            List<IndexDataDto> indexDataList = indices.stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());
            
            dto.setIndices(indexDataList);
            return dto;
            
        } catch (Exception e) {
            log.error("Error fetching indices from database: {}", e.getMessage(), e);
            throw new ServiceException("Failed to fetch indices data", e);
        }
    }

    /**
     * Get specific index from database as fallback
     */
    private IndicesDto getIndexFromDatabase(String indexName) {
        try {
            Optional<Index> indexOptional = indexRepository.findByIndexNameIgnoreCase(indexName);
            
            if (indexOptional.isPresent()) {
                IndicesDto dto = new IndicesDto();
                dto.setTimestamp(Instant.now().toString());
                dto.setSource("Database");
                dto.setIndices(List.of(convertEntityToDto(indexOptional.get())));
                return dto;
            } else {
                throw new ResourceNotFoundException("Index not found: " + indexName);
            }
            
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching index {} from database: {}", indexName, e.getMessage(), e);
            throw new ServiceException("Failed to fetch index data for: " + indexName, e);
        }
    }

    /**
     * Convert Index entity to IndexDataDto
     */
    private IndexDataDto convertEntityToDto(Index index) {
        IndexDataDto dto = new IndexDataDto();
        dto.setKey(index.getKeyCategory());
        dto.setIndexName(index.getIndexName());
        dto.setIndexSymbol(index.getIndexSymbol());
        dto.setLastPrice(index.getLastPrice());
        dto.setVariation(index.getVariation());
        dto.setPercentChange(index.getPercentChange());
        dto.setOpenPrice(index.getOpenPrice());
        dto.setDayHigh(index.getHighPrice());
        dto.setDayLow(index.getLowPrice());
        dto.setPreviousClose(index.getPreviousClose());
        dto.setYearHigh(index.getYearHigh());
        dto.setYearLow(index.getYearLow());
        dto.setIndicativeClose(index.getIndicativeClose());
        dto.setPeRatio(index.getPeRatio());
        dto.setPbRatio(index.getPbRatio());
        dto.setDividendYield(index.getDividendYield());
        dto.setDeclines(index.getDeclines());
        dto.setAdvances(index.getAdvances());
        dto.setUnchanged(index.getUnchanged());
        dto.setPercentChange365d(index.getPercentChange365d());
        dto.setDate365dAgo(index.getDate365dAgo());
        dto.setPercentChange30d(index.getPercentChange30d());
        dto.setDate30dAgo(index.getDate30dAgo());
        dto.setChart365dPath(index.getChart365dPath());
        dto.setChart30dPath(index.getChart30dPath());
        dto.setChartTodayPath(index.getChartTodayPath());
        return dto;
    }

    /**
     * Schedule reconnection attempts for WebSocket only if there are active subscribers
     */
    private void scheduleReconnectionIfNeeded() {
        if (hasActiveSubscribers() && reconnectExecutor != null && !reconnectExecutor.isShutdown()) {
            log.info("Scheduling WebSocket reconnection in 30 seconds...");
            reconnectExecutor.schedule(() -> {
                if (hasActiveSubscribers() && (webSocketSession == null || !webSocketSession.isOpen())) {
                    connectToNseWebSocket();
                }
            }, 30, TimeUnit.SECONDS);
        }
    }

    /**
     * Scheduled method to maintain WebSocket connection health
     * Only maintains connection if there are active subscribers
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void maintainConnection() {
        if (hasActiveSubscribers()) {
            if (webSocketSession == null || !webSocketSession.isOpen()) {
                log.info("WebSocket connection is not active but subscribers exist, attempting to reconnect...");
                connectToNseWebSocket();
            }
        } else if (isWebSocketConnected()) {
            log.info("No active subscribers but WebSocket is connected, disconnecting to save resources...");
            disconnectWebSocketIfNotNeeded();
        }
    }

    /**
     * Cleanup on service shutdown
     */
    @PreDestroy
    public void cleanup() {
        if (webSocketSession != null && webSocketSession.isOpen()) {
            try {
                webSocketSession.close();
                log.info("NSE WebSocket connection closed successfully");
            } catch (Exception e) {
                log.error("Error closing NSE WebSocket connection: {}", e.getMessage(), e);
            }
        }
        
        if (reconnectExecutor != null && !reconnectExecutor.isShutdown()) {
            reconnectExecutor.shutdown();
            try {
                if (!reconnectExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                    reconnectExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                reconnectExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }
}