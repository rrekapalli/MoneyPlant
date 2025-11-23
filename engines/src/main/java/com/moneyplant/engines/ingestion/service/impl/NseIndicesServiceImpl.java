package com.moneyplant.engines.ingestion.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.engines.common.NseIndicesTickDto;
import com.moneyplant.engines.common.dto.NseIndexTickDto;

import com.moneyplant.engines.ingestion.service.NseIndicesService;
import com.moneyplant.engines.ingestion.service.NseIndicesTickService;
import org.springframework.beans.factory.annotation.Autowired;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
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
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

/**
 * Implementation of NseIndicesService for managing NSE indices data ingestion.
 * Connects to NSE WebSocket, processes data, and publishes to Kafka topics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NseIndicesServiceImpl extends TextWebSocketHandler implements NseIndicesService {

    // Optional DB service for upserting flattened ticks; may be null when DB is disabled
    @Autowired(required = false)
    private NseIndicesTickService nseIndicesTickService;

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${kafka.topics.nse-indices-ticks:nse-indices-ticks}")
    private String kafkaTopic;

    @Value("${nse.websocket.url:wss://www.nseindia.com/streams/indices/high/drdMkt}")
    private String nseWebSocketUrl;

    @Value("${nse.websocket.alternative-urls:}")
    private List<String> alternativeUrls;

    @Value("${nse.websocket.reconnect.interval:30}")
    private long reconnectIntervalSeconds;

    @Value("${nse.websocket.reconnect.max-attempts:5}")
    private int maxReconnectAttempts;

    @Value("${nse.websocket.reconnect.backoff-multiplier:2}")
    private int backoffMultiplier;

    @Value("${nse.websocket.timeout:30000}")
    private long connectionTimeout;

    @Value("${nse.websocket.heartbeat-interval:30000}")
    private long heartbeatInterval;

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
    private int currentReconnectAttempt = 0;

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

    // NSE HTTP session cookies
    private List<String> nseCookies;

    /**
     * Initialize WebSocket client and executor on service startup
     */
    @PostConstruct
    public void initializeWebSocketClient() {
        webSocketClient = new StandardWebSocketClient();
        reconnectExecutor = Executors.newSingleThreadScheduledExecutor();
        // Ensure ObjectMapper can handle slightly non-standard JSON from upstream sources
        try {
            this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
            this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_FLOAT_AS_INT, true);
            this.objectMapper.configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
            this.objectMapper.configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
            this.objectMapper.configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_COMMENTS, true);
        } catch (Exception ignored) {}
        log.info("NSE Indices WebSocket client initialized. Connection will be established when ingestion starts.");
    }

    /**
     * Clean up resources on service shutdown
     */
    @PreDestroy
    public void cleanup() {
        log.info("Starting cleanup of NSE Indices Service...");
        
        // First stop ingestion to prevent new messages
        stopNseIndicesIngestion();
        
        // Wait a bit for any pending Kafka sends to complete
        try {
            log.info("Waiting for pending Kafka operations to complete...");
            Thread.sleep(2000); // Give 2 seconds for pending sends
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted while waiting for Kafka operations");
        }
        
        // Shutdown executor
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
        
        log.info("NSE Indices Service cleanup completed");
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
            // Get latest data from local cache instead of database
            return new ArrayList<>(latestIndexDataMap.values());
        } catch (Exception e) {
            log.error("Error retrieving latest indices data from cache: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public NseIndicesTickDto getLatestIndexData(String indexName) {
        try {
            // Get latest data from local cache instead of database
            return latestIndexDataMap.get(indexName);
        } catch (Exception e) {
            log.error("Error retrieving latest index data for {} from cache: {}", indexName, indexName, e.getMessage(), e);
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

            // First establish HTTP session to get authentication cookies
            establishNseHttpSession();
            
        } catch (Exception e) {
            isConnecting = false;
            log.error("Failed to connect to NSE WebSocket: {}", e.getMessage(), e);
            
            // Schedule reconnection attempt
            scheduleReconnect();
        }
    }

    /**
     * Establish HTTP session with NSE to get authentication cookies and tokens
     */
    private void establishNseHttpSession() {
        try {
            log.info("Establishing HTTP session with NSE...");
            
            // Create HTTP client with proper headers
            RestTemplate httpClient = new RestTemplate();
            HttpHeaders headers = createNseHttpHeaders();
            
            // First request to NSE homepage to get initial cookies
            String nseHomeUrl = "https://www.nseindia.com";
            HttpEntity<String> request = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = httpClient.exchange(
                nseHomeUrl, 
                HttpMethod.GET, 
                request, 
                String.class
            );
            
            // Extract cookies from response
            List<String> cookies = response.getHeaders().get("Set-Cookie");
            if (cookies != null && !cookies.isEmpty()) {
                log.info("Received {} cookies from NSE", cookies.size());
                
                // Store cookies for WebSocket connection
                nseCookies = cookies;
                
                // Now attempt WebSocket connection with cookies
                attemptWebSocketConnection();
            } else {
                log.warn("No cookies received from NSE, attempting WebSocket connection without cookies");
                attemptWebSocketConnection();
            }
            
        } catch (Exception e) {
            log.error("Failed to establish HTTP session with NSE: {}", e.getMessage(), e);
            // Try WebSocket connection anyway
            attemptWebSocketConnection();
        }
    }

    /**
     * Attempt WebSocket connection with established cookies
     */
    private void attemptWebSocketConnection() {
        try {
            // Create WebSocket connection with enhanced headers and cookies for NSE
            WebSocketHttpHeaders headers = createNseWebSocketHeaders();
            
            // Add cookies if available
            if (nseCookies != null && !nseCookies.isEmpty()) {
                String cookieHeader = String.join("; ", nseCookies);
                headers.add("Cookie", cookieHeader);
                log.info("Adding cookies to WebSocket connection: {}", cookieHeader);
            }
            
            // Try to connect to the primary URL first
            attemptConnection(nseWebSocketUrl, headers, 0);
            
        } catch (Exception e) {
            log.error("Failed to attempt WebSocket connection: {}", e.getMessage(), e);
            isConnecting = false;
            scheduleReconnect();
        }
    }

    /**
     * Attempt WebSocket connection with fallback to alternative URLs
     */
    private void attemptConnection(String url, WebSocketHttpHeaders headers, int attemptNumber) {
        try {
            log.info("Attempting connection to NSE WebSocket (attempt {}): {}", attemptNumber + 1, url);
            
            ListenableFuture<WebSocketSession> connectionFuture = webSocketClient.doHandshake(
                this, headers, URI.create(url)
            );

            connectionFuture.addCallback(new ListenableFutureCallback<WebSocketSession>() {
                @Override
                public void onSuccess(WebSocketSession session) {
                    webSocketSession = session;
                    isConnected = true;
                    isConnecting = false;
                    connectionStartTime = Instant.now();
                    log.info("Successfully connected to NSE WebSocket: {}", url);
                    
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
                    log.error("Failed to connect to NSE WebSocket {}: {}", url, ex.getMessage());
                    
                    // Try alternative URLs if available
                    if (attemptNumber < getMaxAlternativeAttempts()) {
                        String nextUrl = getNextAlternativeUrl(attemptNumber);
                        if (nextUrl != null) {
                            log.info("Trying alternative NSE WebSocket URL: {}", nextUrl);
                            attemptConnection(nextUrl, headers, attemptNumber + 1);
                            return;
                        }
                    }
                    
                    // All URLs failed, schedule reconnection
                    isConnecting = false;
                    log.error("All NSE WebSocket URLs failed. This might be due to network restrictions or NSE requiring authentication");
                    scheduleReconnect();
                }
            });
            
        } catch (Exception e) {
            log.error("Exception during WebSocket connection attempt to {}: {}", url, e.getMessage(), e);
            
            // Try alternative URLs if available
            if (attemptNumber < getMaxAlternativeAttempts()) {
                String nextUrl = getNextAlternativeUrl(attemptNumber);
                if (nextUrl != null) {
                    log.info("Trying alternative NSE WebSocket URL: {}", nextUrl);
                    attemptConnection(nextUrl, headers, attemptNumber + 1);
                    return;
                }
            }
            
            // All URLs failed
            isConnecting = false;
            scheduleReconnect();
        }
    }

    /**
     * Create enhanced headers for NSE WebSocket connection
     */
    private WebSocketHttpHeaders createNseWebSocketHeaders() {
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        
        // Standard headers
        headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        headers.add("Origin", "https://www.nseindia.com");
        headers.add("Referer", "https://www.nseindia.com/get-quotes/equity");
        headers.add("Accept", "*/*");
        headers.add("Accept-Language", "en-US,en;q=0.9");
        headers.add("Accept-Encoding", "gzip, deflate, br");
        headers.add("Connection", "keep-alive");
        headers.add("Upgrade", "websocket");
        headers.add("Sec-WebSocket-Version", "13");
        
        // Additional headers that might help with NSE authentication
        headers.add("Cache-Control", "no-cache");
        headers.add("Pragma", "no-cache");
        headers.add("Sec-Fetch-Dest", "websocket");
        headers.add("Sec-Fetch-Mode", "websocket");
        headers.add("Sec-Fetch-Site", "same-origin");
        
        return headers;
    }

    /**
     * Create enhanced headers for NSE HTTP session (cookies)
     */
    private HttpHeaders createNseHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        headers.add("Origin", "https://www.nseindia.com");
        headers.add("Referer", "https://www.nseindia.com/get-quotes/equity");
        headers.add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        headers.add("Accept-Language", "en-US,en;q=0.9");
        headers.add("Accept-Encoding", "gzip, deflate, br");
        headers.add("Connection", "keep-alive");
        headers.add("Upgrade-Insecure-Requests", "1");
        headers.add("Sec-Fetch-Dest", "document");
        headers.add("Sec-Fetch-Mode", "navigate");
        headers.add("Sec-Fetch-Site", "same-origin");
        headers.add("Sec-Fetch-User", "?1");
        headers.add("Pragma", "no-cache");
        headers.add("Cache-Control", "no-cache");
        return headers;
    }

    /**
     * Get the next alternative URL to try
     */
    private String getNextAlternativeUrl(int attemptNumber) {
        if (alternativeUrls != null && !alternativeUrls.isEmpty() && attemptNumber < alternativeUrls.size()) {
            return alternativeUrls.get(attemptNumber);
        }
        return null;
    }

    /**
     * Get maximum number of alternative attempts
     */
    private int getMaxAlternativeAttempts() {
        return alternativeUrls != null ? alternativeUrls.size() : 0;
    }

    /**
     * Start fallback mock data generation when NSE WebSocket fails
     */
    private void startFallbackMockDataGeneration() {
        if (fallbackEnabled && fallbackMockInterval > 0) {
            log.info("Starting fallback mock data generation every {} ms", fallbackMockInterval);
            
            // Schedule periodic mock data generation
            reconnectExecutor.scheduleAtFixedRate(() -> {
                try {
                    if (!isConnected) {
                        generateAndPublishMockData();
                    }
                } catch (Exception e) {
                    log.error("Error in fallback mock data generation: {}", e.getMessage(), e);
                }
            }, fallbackMockInterval, fallbackMockInterval, TimeUnit.MILLISECONDS);
        }
    }

    /**
     * Generate and publish mock NSE indices data
     */
    private void generateAndPublishMockData() {
        try {
            // Create mock data for common indices
            String[] mockIndices = {"NIFTY 50", "SENSEX", "BANKNIFTY", "NIFTY IT", "NIFTY PHARMA"};
            
            for (String indexName : mockIndices) {
                NseIndicesTickDto mockData = createMockIndexData(indexName);
                publishToKafka(mockData);
                broadcastToWebSocketSubscribers(mockData);
            }
            
            log.debug("Generated and published mock data for {} indices", mockIndices.length);
            
        } catch (Exception e) {
            log.error("Error generating mock data: {}", e.getMessage(), e);
        }
    }

    /**
     * Create mock data for a specific index
     */
    private NseIndicesTickDto createMockIndexData(String indexName) {
        NseIndicesTickDto mockData = new NseIndicesTickDto();
        mockData.setTimestamp(Instant.now().toString());
        mockData.setSource("Mock-Fallback");
        mockData.setIngestionTimestamp(Instant.now());
        
        // Create mock index data
        NseIndicesTickDto.IndexTickDataDto indexData = new NseIndicesTickDto.IndexTickDataDto();
        indexData.setIndexName(indexName);
        indexData.setIndexSymbol(indexName.replace(" ", ""));
        indexData.setLastPrice(new java.math.BigDecimal("19500.50"));
        indexData.setVariation(new java.math.BigDecimal("150.25"));
        indexData.setPercentChange(new java.math.BigDecimal("0.78"));
        indexData.setOpenPrice(new java.math.BigDecimal("19350.25"));
        indexData.setDayHigh(new java.math.BigDecimal("19600.75"));
        indexData.setDayLow(new java.math.BigDecimal("19300.00"));
        indexData.setPreviousClose(new java.math.BigDecimal("19350.25"));
        indexData.setYearHigh(new java.math.BigDecimal("21000.00"));
        indexData.setYearLow(new java.math.BigDecimal("18000.00"));
        indexData.setTickTimestamp(Instant.now());
        
        mockData.setIndices(new NseIndicesTickDto.IndexTickDataDto[]{indexData});
        
        return mockData;
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
     * Schedule reconnection attempt with exponential backoff
     */
    private void scheduleReconnect() {
        if (reconnectExecutor != null && !reconnectExecutor.isShutdown()) {
            currentReconnectAttempt++;
            
            if (currentReconnectAttempt <= maxReconnectAttempts) {
                // Calculate delay with exponential backoff
                long delay = reconnectIntervalSeconds * (long) Math.pow(backoffMultiplier, currentReconnectAttempt - 1);
                delay = Math.min(delay, 300); // Cap at 5 minutes
                
                log.info("Scheduling reconnection attempt {} of {} in {} seconds", 
                    currentReconnectAttempt, maxReconnectAttempts, delay);
                
                reconnectExecutor.schedule(() -> {
                    currentReconnectAttempt = 0; // Reset for next connection cycle
                    connectToNseWebSocket();
                }, delay, TimeUnit.SECONDS);
            } else {
                log.error("Maximum reconnection attempts ({}) reached. Stopping reconnection attempts.", maxReconnectAttempts);
                log.info("NSE WebSocket connection failed. Using fallback mock data if enabled.");
                
                // Reset attempt counter for next manual start
                currentReconnectAttempt = 0;
                
                // Enable fallback if configured
                if (fallbackEnabled) {
                    log.info("Enabling fallback mock data generation");
                    startFallbackMockDataGeneration();
                }
            }
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
            // Normalize payload for frontend expectations
            normalizeForFrontend(tickData);

            // Broadcast to all indices subscribers
            messagingTemplate.convertAndSend("/topic/nse-indices", tickData);
            
            // Broadcast to specific index subscribers if we have index data
            if (tickData.getIndices() != null) {
                for (NseIndicesTickDto.IndexTickDataDto indexData : tickData.getIndices()) {
                    if (indexData.getIndexName() != null || indexData.getIndexSymbol() != null) {
                        // Use consistent topic naming: convert "NIFTY 50" to "nifty-50"
                        String idx = indexData.getIndexName() != null ? indexData.getIndexName() : indexData.getIndexSymbol();
                        String topic = "/topic/nse-indices/" + idx.replaceAll("\\s+", "-").toLowerCase();

                        // Build compact single-index DTO
                        NseIndexTickDto single = mapToSingleIndexDto(indexData, tickData);
                        // Normalize source for frontend expectations
                        single.setSource("Engines STOMP WebSocket");

                        messagingTemplate.convertAndSend(topic, single);
                        log.debug("Broadcasting compact tick to topic: {} for index: {}", topic, idx);
                    }
                }
            }
            
            log.debug("Broadcasted NSE indices data to WebSocket subscribers");
            
        } catch (Exception e) {
            log.error("Error broadcasting to WebSocket subscribers: {}", e.getMessage(), e);
        }
    }

    /**
     * Ensure outgoing WebSocket payload matches frontend expectations.
     * - source should be 'Engines STOMP WebSocket'
     * - marketStatus should not be null (default to status 'ACTIVE')
     */
    private void normalizeForFrontend(NseIndicesTickDto dto) {
        try {
            // Standardize source label for frontend logs/feature toggles
            dto.setSource("Engines STOMP WebSocket");

            // Ensure marketStatus is always present
            if (dto.getMarketStatus() == null) {
                NseIndicesTickDto.MarketStatusTickDto status = new NseIndicesTickDto.MarketStatusTickDto();
                status.setStatus("ACTIVE");
                dto.setMarketStatus(status);
            }
        } catch (Exception e) {
            log.warn("Failed to normalize indices payload for frontend: {}", e.getMessage());
        }
    }

    /**
     * Map a single index entry from the large DTO to a compact single-index DTO for WebSocket consumers.
     */
    private NseIndexTickDto mapToSingleIndexDto(NseIndicesTickDto.IndexTickDataDto src, NseIndicesTickDto parent) {
        NseIndexTickDto d = new NseIndexTickDto();
        try {
            d.setTimestamp(parent != null && parent.getTimestamp() != null ? parent.getTimestamp() : Instant.now().toString());
            d.setIngestionTimestamp(parent != null && parent.getIngestionTimestamp() != null ? parent.getIngestionTimestamp() : Instant.now());
            d.setSource(parent != null ? parent.getSource() : null);

            d.setIndexName(src.getIndexName());
            d.setIndexSymbol(src.getIndexSymbol());

            d.setLastPrice(src.getLastPrice());
            d.setVariation(src.getVariation());
            d.setPercentChange(src.getPercentChange());

            d.setOpenPrice(src.getOpenPrice());
            d.setDayHigh(src.getDayHigh());
            d.setDayLow(src.getDayLow());
            d.setPreviousClose(src.getPreviousClose());

            d.setYearHigh(src.getYearHigh());
            d.setYearLow(src.getYearLow());

            d.setTickTimestamp(src.getTickTimestamp());
        } catch (Exception e) {
            log.warn("Failed mapping to single index dto: {}", e.getMessage());
        }
        return d;
    }

    /**
     * Publish tick data to Kafka topic
     */
    private void publishToKafka(NseIndicesTickDto tickData) {
        // Skip if not connected or Kafka is disabled
        if (!kafkaEnabled) {
            log.debug("Kafka is disabled, skipping publish");
            return;
        }
        
        try {
            String messageKey = "nse-indices-" + System.currentTimeMillis();
            String messageValue = objectMapper.writeValueAsString(tickData);
            
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(kafkaTopic, messageKey, messageValue);
            
            future.whenComplete((result, throwable) -> {
                if (throwable != null) {
                    // Check if it's a producer closed error
                    if (throwable.getMessage() != null && throwable.getMessage().contains("Producer closed")) {
                        log.warn("Kafka producer is closed, skipping message publish");
                    } else {
                        log.error("Failed to publish to Kafka topic {}: {}", kafkaTopic, throwable.getMessage());
                    }
                } else {
                    messagesPublished++;
                    log.debug("Successfully published to Kafka topic {}: partition={}, offset={}", 
                            kafkaTopic, result.getRecordMetadata().partition(), result.getRecordMetadata().offset());
                }
            });
            
        } catch (org.apache.kafka.common.KafkaException e) {
            // Handle Kafka-specific exceptions gracefully
            if (e.getMessage() != null && e.getMessage().contains("Producer closed")) {
                log.warn("Kafka producer is closed, cannot publish message");
            } else {
                log.error("Kafka error while publishing: {}", e.getMessage());
            }
        } catch (Exception e) {
            log.error("Error publishing to Kafka: {}", e.getMessage(), e);
        }
    }

    /**
     * Kafka consumer method to read NSE indices data and publish to WebSocket topics
     * This enables real-time data flow from Kafka to WebSocket subscribers
     * Only active when Kafka is enabled.
     */
    @KafkaListener(
        topics = "${kafka.topics.nse-indices-ticks:nse-indices-ticks}",
        groupId = "engines-websocket-group",
        autoStartup = "${spring.kafka.enabled:true}"
    )
    public void consumeNseIndicesData(String message) {
        try {
            log.debug("Received NSE indices data from Kafka: {}", message);
            
            NseIndicesTickDto indicesData = null;
            try {
                // Try the standard DTO first
                indicesData = objectMapper.readValue(message, NseIndicesTickDto.class);
            } catch (Exception ex) {
                log.warn("Kafka DTO parse failed, attempting raw parsing: {}", ex.getMessage());
            }

            // If empty or failed, try parsing as raw NSE JSON using existing logic
            if (indicesData == null || indicesData.getIndices() == null || indicesData.getIndices().length == 0) {
                try {
                    JsonNode node = objectMapper.readTree(message);
                    indicesData = parseNseIndicesData(node);
                } catch (Exception ex2) {
                    log.error("Fallback raw parse also failed: {}", ex2.getMessage());
                }
            }

            if (indicesData != null && indicesData.getIndices() != null && indicesData.getIndices().length > 0) {
                log.info("Processing {} indices from Kafka for DB upsert and WebSocket distribution", indicesData.getIndices().length);
                
                // Update local cache (keep full DTO for symbol key)
                for (NseIndicesTickDto.IndexTickDataDto index : indicesData.getIndices()) {
                    if (index.getIndexSymbol() != null) {
                        latestIndexDataMap.put(index.getIndexSymbol(), indicesData);
                    }
                }
                
                // Flatten to per-index DTOs for broadcasting
                List<NseIndexTickDto> flattenedForBroadcast = new ArrayList<>();
                for (NseIndicesTickDto.IndexTickDataDto index : indicesData.getIndices()) {
                    NseIndexTickDto single = mapToSingleIndexDto(index, indicesData);
                    // Normalize for frontend expectations
                    single.setSource("Engines STOMP WebSocket");
                    flattenedForBroadcast.add(single);
                }
                
                // Upsert flattened data into DB if service is available
                try {
                    if (nseIndicesTickService != null) {
                        List<NseIndicesTickDto> forUpsert = new ArrayList<>();
                        for (NseIndicesTickDto.IndexTickDataDto index : indicesData.getIndices()) {
                            NseIndicesTickDto singleDto = new NseIndicesTickDto();
                            singleDto.setTimestamp(indicesData.getTimestamp());
                            singleDto.setSource(indicesData.getSource());
                            singleDto.setIngestionTimestamp(indicesData.getIngestionTimestamp() != null ? indicesData.getIngestionTimestamp() : Instant.now());
                            singleDto.setMarketStatus(indicesData.getMarketStatus());
                            singleDto.setIndices(new NseIndicesTickDto.IndexTickDataDto[]{index});
                            forUpsert.add(singleDto);
                        }
                        nseIndicesTickService.upsertMultipleTickData(forUpsert);
                        log.debug("Upserted {} flattened index ticks into nse_idx_ticks (if DB enabled)", forUpsert.size());
                    } else {
                        log.debug("NseIndicesTickService bean not available - skipping DB upsert");
                    }
                } catch (Exception dbEx) {
                    log.error("Error during DB upsert of flattened index ticks: {}", dbEx.getMessage(), dbEx);
                }
                
                // Publish formatted object with indices array to all-indices topic
                Map<String, Object> payload = new HashMap<>();
                payload.put("timestamp", indicesData.getTimestamp() != null ? indicesData.getTimestamp() : Instant.now().toString());
                payload.put("source", "Engines STOMP WebSocket");
                payload.put("marketStatus", indicesData.getMarketStatus());
                payload.put("indices", flattenedForBroadcast);
                messagingTemplate.convertAndSend("/topic/nse-indices", payload);
                log.debug("Published formatted object with {} indices to /topic/nse-indices", flattenedForBroadcast.size());
                
                // Publish to specific index topics with compact DTO
                for (NseIndexTickDto single : flattenedForBroadcast) {
                    String idxName = single.getIndexName() != null ? single.getIndexName() : single.getIndexSymbol();
                    if (idxName != null) {
                        String topicName = "/topic/nse-indices/" + idxName.replaceAll("\\s+", "-").toLowerCase();
                        messagingTemplate.convertAndSend(topicName, single);
                        log.debug("Published compact dto to specific topic: {} for index: {}", topicName, idxName);
                    }
                }
                
                // Update subscription status logs
                if (allIndicesSubscribed) {
                    log.debug("All indices subscription active - flattened data published");
                }
                specificIndexSubscriptions.forEach((indexName, isSubscribed) -> {
                    if (isSubscribed) {
                        log.debug("Specific index subscription active for: {}", indexName);
                    }
                });
                
            } else {
                log.warn("Received invalid or empty NSE indices data from Kafka after fallback parsing");
            }
            
        } catch (Exception e) {
            log.error("Error processing NSE indices data from Kafka: {}", e.getMessage(), e);
        }
    }

    /**
     * Test Kafka consumer with sample data
     */
    @Override
    public void testKafkaConsumer() {
        log.info("Testing Kafka consumer with sample data");
        
        // Create sample NSE indices data
        NseIndicesTickDto.IndexTickDataDto[] sampleIndices = new NseIndicesTickDto.IndexTickDataDto[2];
        
        // Sample NIFTY 50 data
        sampleIndices[0] = new NseIndicesTickDto.IndexTickDataDto();
        sampleIndices[0].setIndexSymbol("NIFTY 50");
        sampleIndices[0].setIndexName("NIFTY 50");
        sampleIndices[0].setLastPrice(new java.math.BigDecimal("19500.00"));
        sampleIndices[0].setVariation(new java.math.BigDecimal("150.00"));
        sampleIndices[0].setPercentChange(new java.math.BigDecimal("0.78"));
        
        // Sample SENSEX data
        sampleIndices[1] = new NseIndicesTickDto.IndexTickDataDto();
        sampleIndices[1].setIndexSymbol("SENSEX");
        sampleIndices[1].setIndexName("SENSEX");
        sampleIndices[1].setLastPrice(new java.math.BigDecimal("65000.00"));
        sampleIndices[1].setVariation(new java.math.BigDecimal("500.00"));
        sampleIndices[1].setPercentChange(new java.math.BigDecimal("0.78"));
        
        NseIndicesTickDto sampleData = new NseIndicesTickDto();
        sampleData.setIndices(sampleIndices);
        sampleData.setTimestamp(java.time.Instant.now().toString());
        sampleData.setSource("TEST_DATA");
        
        // Process the sample data as if it came from Kafka
        log.info("Processing sample data through Kafka consumer...");
        try {
            this.consumeNseIndicesData(objectMapper.writeValueAsString(sampleData));
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("Error serializing test data to JSON: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to serialize test data", e);
        }
        
        log.info("Kafka consumer test completed");
    }


}
