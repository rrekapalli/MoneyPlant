package com.moneyplant.engines.ingestion.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.engines.common.entities.NseEquityMaster;
import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.reactor.ratelimiter.operator.RateLimiterOperator;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.cookie.BasicCookieStore;
import org.apache.hc.client5.http.cookie.CookieStore;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.util.Timeout;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.retry.Retry;

import org.brotli.dec.BrotliInputStream;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.zip.GZIPInputStream;

/**
 * NSE India Data Provider implementation.
 * Fetches historical OHLCV data directly from NSE India API.
 * 
 * This provider uses Apache HttpClient 5 with proper cookie management
 * to bypass NSE's anti-bot protection (403 Forbidden errors).
 * 
 * Key improvements over WebClient:
 * - Persistent cookie store (like Python requests.Session())
 * - Browser-like headers and behavior
 * - Proper session initialization
 * - Automatic cookie handling across requests
 * 
 * NSE India API Endpoint:
 * - Historical Data: https://www.nseindia.com/api/historicalOR/generateSecurityWiseHistoricalData
 */
@Component
@Slf4j
public class NseIndiaProvider implements DataProvider {
    
    private static final String NSE_BASE_URL = "https://www.nseindia.com";
    private static final String HISTORICAL_ENDPOINT = "/api/historicalOR/generateSecurityWiseHistoricalData";
    private static final DateTimeFormatter NSE_DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    
    private final CloseableHttpClient httpClient;
    private final CookieStore cookieStore;
    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private volatile boolean sessionInitialized = false;
    
    public NseIndiaProvider(RateLimiter nseRateLimiter) {
        this.rateLimiter = nseRateLimiter;
        this.cookieStore = new BasicCookieStore();
        
        // Configure request timeouts
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(Timeout.of(10, TimeUnit.SECONDS))
                .setResponseTimeout(Timeout.of(30, TimeUnit.SECONDS))
                .build();
        
        // Create HttpClient with cookie store and browser-like configuration
        this.httpClient = HttpClients.custom()
                .setDefaultCookieStore(cookieStore)
                .setDefaultRequestConfig(requestConfig)
                .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .disableRedirectHandling() // Handle redirects manually if needed
                .build();
        
        log.info("NseIndiaProvider initialized with Apache HttpClient 5 and persistent cookie store");
        log.info("Session will be initialized lazily on first data request");
    }
    
    /**
     * Initialize NSE session by visiting required pages and getting cookies.
     * This mimics Python's requests.Session() behavior.
     * 
     * The cookie store automatically persists cookies across requests,
     * just like Python's session object.
     * 
     * This is called lazily on first data request, not at application startup.
     */
    private synchronized void initializeNseSession() {
        // Double-check if already initialized (thread-safe)
        if (sessionInitialized) {
            log.debug("Session already initialized, skipping");
            return;
        }
        
        log.info("🔐 Initializing NSE session with cookie persistence...");
        
        try {
            // Step 1: Visit NSE homepage to establish session and get initial cookies
            log.debug("📍 Step 1/3: Visiting NSE homepage");
            HttpGet homepageRequest = new HttpGet(NSE_BASE_URL);
            addBrowserHeaders(homepageRequest, NSE_BASE_URL, null);
            
            try (CloseableHttpResponse response = httpClient.execute(homepageRequest)) {
                int statusCode = response.getCode();
                log.debug("Homepage response: {} - Cookies in store: {}", statusCode, cookieStore.getCookies().size());
                EntityUtils.consume(response.getEntity()); // Consume response to release connection
            }
            
            // Small delay to mimic human behavior
            Thread.sleep(500);
            
            // Step 2: Visit get-quotes page to get additional session cookies
            log.debug("📍 Step 2/3: Visiting get-quotes/equity page");
            HttpGet quotesRequest = new HttpGet(NSE_BASE_URL + "/get-quotes/equity");
            addBrowserHeaders(quotesRequest, NSE_BASE_URL + "/get-quotes/equity", NSE_BASE_URL);
            
            try (CloseableHttpResponse response = httpClient.execute(quotesRequest)) {
                int statusCode = response.getCode();
                log.debug("Get-quotes response: {} - Cookies in store: {}", statusCode, cookieStore.getCookies().size());
                EntityUtils.consume(response.getEntity());
            }
            
            // Small delay to mimic human behavior
            Thread.sleep(500);
            
            // Step 3: Visit market-data page for additional cookies
            log.debug("📍 Step 3/3: Visiting market-data page");
            HttpGet marketDataRequest = new HttpGet(NSE_BASE_URL + "/market-data");
            addBrowserHeaders(marketDataRequest, NSE_BASE_URL + "/market-data", NSE_BASE_URL);
            
            try (CloseableHttpResponse response = httpClient.execute(marketDataRequest)) {
                int statusCode = response.getCode();
                log.debug("Market-data response: {} - Cookies in store: {}", statusCode, cookieStore.getCookies().size());
                EntityUtils.consume(response.getEntity());
            }
            
            sessionInitialized = true;
            log.info("✅ NSE session initialized successfully with {} cookies", cookieStore.getCookies().size());
            cookieStore.getCookies().forEach(cookie -> 
                log.debug("  Cookie: {} = {}", cookie.getName(), cookie.getValue().substring(0, Math.min(20, cookie.getValue().length())) + "...")
            );
            
        } catch (Exception e) {
            log.error("❌ Error initializing NSE session: {}", e.getMessage(), e);
            log.warn("⚠️ Continuing without session initialization - API calls may fail with 403");
        }
    }
    
    /**
     * Add browser-like headers to mimic real browser behavior.
     * This is critical to bypass NSE's anti-bot protection.
     */
    private void addBrowserHeaders(HttpGet request, String url, String referer) {
        request.setHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
        request.setHeader("Accept-Language", "en-US,en;q=0.9");
        request.setHeader("Accept-Encoding", "gzip, deflate, br");
        request.setHeader("Cache-Control", "max-age=0");
        request.setHeader("Connection", "keep-alive");
        request.setHeader("DNT", "1");
        request.setHeader("Upgrade-Insecure-Requests", "1");
        request.setHeader("Sec-Fetch-Dest", "document");
        request.setHeader("Sec-Fetch-Mode", "navigate");
        request.setHeader("Sec-Fetch-Site", referer != null ? "same-origin" : "none");
        request.setHeader("Sec-Fetch-User", "?1");
        request.setHeader("Sec-Ch-Ua", "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"");
        request.setHeader("Sec-Ch-Ua-Mobile", "?0");
        request.setHeader("Sec-Ch-Ua-Platform", "\"Windows\"");
        
        if (referer != null) {
            request.setHeader("Referer", referer);
        }
    }
    
    /**
     * Add API-specific headers for data requests.
     */
    private void addApiHeaders(HttpGet request) {
        request.setHeader("Accept", "application/json, text/plain, */*");
        request.setHeader("Accept-Language", "en-US,en;q=0.9");
        request.setHeader("Accept-Encoding", "gzip, deflate, br");
        request.setHeader("Connection", "keep-alive");
        request.setHeader("DNT", "1");
        request.setHeader("Referer", NSE_BASE_URL + "/get-quotes/equity");
        request.setHeader("X-Requested-With", "XMLHttpRequest");
        request.setHeader("Sec-Fetch-Dest", "empty");
        request.setHeader("Sec-Fetch-Mode", "cors");
        request.setHeader("Sec-Fetch-Site", "same-origin");
    }
    
    @Override
    public Mono<List<OhlcvData>> fetchHistorical(String symbol, LocalDate start, LocalDate end, Timeframe timeframe) {
        log.info("Fetching historical data from NSE India for symbol: {} from {} to {}", symbol, start, end);
        
        // Lazy session initialization - only on first request
        if (!sessionInitialized) {
            log.info("First data request detected, initializing NSE session...");
            initializeNseSession();
        }
        
        // Format dates for NSE API
        String fromDate = start.format(NSE_DATE_FORMAT);
        String toDate = end.format(NSE_DATE_FORMAT);
        
        // Build URL with query parameters
        String url = NSE_BASE_URL + HISTORICAL_ENDPOINT +
                "?from=" + fromDate +
                "&to=" + toDate +
                "&symbol=" + symbol +
                "&type=priceVolumeDeliverable" +
                "&series=ALL";
        
        return Mono.fromCallable(() -> {
            // Apply rate limiting
            rateLimiter.acquirePermission();
            
            HttpGet request = new HttpGet(url);
            addApiHeaders(request);
            
            log.debug("Making request to: {}", url);
            log.debug("Cookies in store: {}", cookieStore.getCookies().size());
            
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getCode();
                
                if (statusCode == 403) {
                    log.error("❌ 403 Forbidden - NSE anti-bot protection triggered for symbol: {}", symbol);
                    log.info("🔄 Re-initializing session and retrying...");
                    sessionInitialized = false;
                    initializeNseSession();
                    throw new RuntimeException("403 Forbidden - Session re-initialized, retry needed");
                }
                
                if (statusCode != 200) {
                    String errorBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                    log.error("NSE India API error for symbol {}: {} - {}", symbol, statusCode, errorBody);
                    throw new RuntimeException("NSE India API error: " + statusCode + " - " + errorBody);
                }
                
                // Check Content-Encoding header
                String contentEncoding = response.getFirstHeader("Content-Encoding") != null ? 
                        response.getFirstHeader("Content-Encoding").getValue() : "none";
                
                // Read response body
                byte[] responseBytes = EntityUtils.toByteArray(response.getEntity());
                
                // Decompress based on Content-Encoding
                String jsonResponse;
                if ("br".equals(contentEncoding)) {
                    // Brotli compression (NSE commonly uses this)
                    try {
                        jsonResponse = decompressBrotli(responseBytes);
                        log.debug("Brotli decompressed response for {}: {} bytes", symbol, jsonResponse.length());
                    } catch (Exception e) {
                        log.warn("Brotli decompression failed for {}, trying plain text: {}", symbol, e.getMessage());
                        jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);
                    }
                } else if ("gzip".equals(contentEncoding)) {
                    // GZIP compression
                    try {
                        jsonResponse = decompressGzip(responseBytes);
                        log.debug("GZIP decompressed response for {}: {} bytes", symbol, jsonResponse.length());
                    } catch (Exception e) {
                        log.warn("GZIP decompression failed for {}, trying plain text: {}", symbol, e.getMessage());
                        jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);
                    }
                } else {
                    // No compression or unknown
                    jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);
                    log.debug("Plain text response for {}: {} bytes", symbol, jsonResponse.length());
                }
                
                log.debug("JSON response preview for {}: {}", symbol, 
                        jsonResponse.length() > 200 ? jsonResponse.substring(0, 200) + "..." : jsonResponse);
                
                return parseJsonToOhlcvData(jsonResponse, symbol, timeframe);
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                .maxBackoff(Duration.ofSeconds(10))
                .filter(throwable -> {
                    // Retry on 403 errors (after session re-initialization)
                    // Don't retry on IllegalArgumentException (bad data)
                    return !(throwable instanceof IllegalArgumentException);
                })
                .doBeforeRetry(signal -> log.warn("Retrying request for symbol {} (attempt {})", 
                        symbol, signal.totalRetries() + 1)))
        .doOnSuccess(list -> log.info("✅ Successfully fetched {} historical records for {} from NSE India", 
                list.size(), symbol))
        .doOnError(error -> log.error("❌ Failed to fetch historical data for {} from NSE India: {}", 
                symbol, error.getMessage()));
    }
    
    @Override
    public Mono<List<NseEquityMaster>> fetchEquityMasterData() {
        log.warn("NSE India historical API does not support equity master data fetching");
        return Mono.just(new ArrayList<>());
    }
    
    @Override
    public Mono<Boolean> isHealthy() {
        // Test with a known symbol
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        LocalDate yesterday = today.minusDays(1);
        
        String url = NSE_BASE_URL + HISTORICAL_ENDPOINT +
                "?from=" + yesterday.format(NSE_DATE_FORMAT) +
                "&to=" + today.format(NSE_DATE_FORMAT) +
                "&symbol=RELIANCE" +
                "&type=priceVolumeDeliverable" +
                "&series=ALL";
        
        return Mono.fromCallable(() -> {
            if (!sessionInitialized) {
                initializeNseSession();
            }
            
            HttpGet request = new HttpGet(url);
            addApiHeaders(request);
            
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getCode();
                EntityUtils.consume(response.getEntity());
                return statusCode == 200;
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        .timeout(Duration.ofSeconds(10))
        .onErrorReturn(false)
        .doOnNext(healthy -> log.debug("NSE India provider health check: {}", healthy));
    }
    
    @Override
    public ProviderType getType() {
        return ProviderType.NSE;
    }
    
    /**
     * Parse JSON response from NSE India API to OHLCV data.
     * 
     * JSON format from NSE:
     * {
     *   "data": [
     *     {
     *       "CH_TIMESTAMP": "07-NOV-2025",
     *       "CH_SERIES": "EQ",
     *       "CH_OPENING_PRICE": 100.0,
     *       "CH_TRADE_HIGH_PRICE": 105.0,
     *       "CH_TRADE_LOW_PRICE": 99.0,
     *       "CH_CLOSING_PRICE": 103.0,
     *       "VWAP": 102.5,
     *       "CH_TOT_TRADED_QTY": 1000000,
     *       ...
     *     }
     *   ]
     * }
     */
    private List<OhlcvData> parseJsonToOhlcvData(String json, String symbol, Timeframe timeframe) {
        List<OhlcvData> ohlcvList = new ArrayList<>();
        
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode dataArray = root.get("data");
            
            if (dataArray == null || !dataArray.isArray()) {
                log.warn("No data array found in JSON response for symbol {}", symbol);
                return ohlcvList;
            }
            
            for (JsonNode record : dataArray) {
                try {
                    // Parse date - try multiple field names and formats
                    String dateStr = null;
                    if (record.has("mTIMESTAMP")) {
                        dateStr = record.get("mTIMESTAMP").asText();
                    } else if (record.has("CH_TIMESTAMP")) {
                        dateStr = record.get("CH_TIMESTAMP").asText();
                    }
                    
                    if (dateStr == null || dateStr.isEmpty()) {
                        log.warn("No timestamp field found in record for symbol {}", symbol);
                        continue;
                    }
                    
                    // Try parsing with different formats
                    LocalDate date;
                    try {
                        // Try ISO format first: "2025-11-11T18:30:00.000+00:00"
                        if (dateStr.contains("T")) {
                            date = LocalDate.parse(dateStr.substring(0, 10), DateTimeFormatter.ISO_LOCAL_DATE);
                        } else {
                            // Try NSE format: "07-NOV-2025" or "07-Nov-2025"
                            date = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd-MMM-yyyy"));
                        }
                    } catch (Exception e) {
                        log.warn("Failed to parse date '{}' for symbol {}: {}", dateStr, symbol, e.getMessage());
                        continue;
                    }
                    
                    // Convert to timestamp (market close time 3:30 PM IST)
                    java.time.Instant timestamp = date.atTime(15, 30)
                            .atZone(ZoneId.of("Asia/Kolkata"))
                            .toInstant();
                    
                    // Parse OHLCV values
                    BigDecimal open = parseJsonBigDecimal(record.get("CH_OPENING_PRICE"));
                    BigDecimal high = parseJsonBigDecimal(record.get("CH_TRADE_HIGH_PRICE"));
                    BigDecimal low = parseJsonBigDecimal(record.get("CH_TRADE_LOW_PRICE"));
                    BigDecimal close = parseJsonBigDecimal(record.get("CH_CLOSING_PRICE"));
                    BigDecimal vwap = parseJsonBigDecimal(record.get("VWAP"));
                    long volume = parseJsonLong(record.get("CH_TOT_TRADED_QTY"));
                    
                    OhlcvData ohlcv = OhlcvData.builder()
                            .timestamp(timestamp)
                            .symbol(symbol)
                            .timeframe(timeframe)
                            .open(open)
                            .high(high)
                            .low(low)
                            .close(close)
                            .volume(volume)
                            .vwap(vwap)
                            .build();
                    
                    ohlcvList.add(ohlcv);
                    
                } catch (Exception e) {
                    log.warn("Error parsing JSON record for symbol {}: {}", symbol, e.getMessage());
                }
            }
            
            log.info("Parsed {} OHLCV records from JSON for symbol {}", ohlcvList.size(), symbol);
            
        } catch (Exception e) {
            log.error("Error parsing JSON response for symbol {}: {}", symbol, e.getMessage());
        }
        
        return ohlcvList;
    }
    
    private BigDecimal parseJsonBigDecimal(JsonNode node) {
        if (node == null || node.isNull()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(node.asText().replace(",", ""));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
    
    private long parseJsonLong(JsonNode node) {
        if (node == null || node.isNull()) {
            return 0L;
        }
        try {
            return Long.parseLong(node.asText().replace(",", ""));
        } catch (Exception e) {
            return 0L;
        }
    }
    
    /**
     * Decompress Brotli-compressed byte array to string.
     * NSE India API commonly uses Brotli compression (Content-Encoding: br).
     */
    private String decompressBrotli(byte[] compressed) throws Exception {
        try (ByteArrayInputStream bis = new ByteArrayInputStream(compressed);
             BrotliInputStream bris = new BrotliInputStream(bis);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[1024];
            int len;
            while ((len = bris.read(buffer)) > 0) {
                bos.write(buffer, 0, len);
            }
            
            return bos.toString(StandardCharsets.UTF_8.name());
        }
    }
    
    /**
     * Decompress gzip-compressed byte array to string.
     */
    private String decompressGzip(byte[] compressed) throws Exception {
        try (ByteArrayInputStream bis = new ByteArrayInputStream(compressed);
             GZIPInputStream gis = new GZIPInputStream(bis);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gis.read(buffer)) > 0) {
                bos.write(buffer, 0, len);
            }
            
            return bos.toString(StandardCharsets.UTF_8.name());
        }
    }
    
    /**
     * Cleanup resources when the provider is destroyed.
     */
    public void destroy() {
        try {
            if (httpClient != null) {
                httpClient.close();
                log.info("NSE HttpClient closed successfully");
            }
        } catch (Exception e) {
            log.error("Error closing NSE HttpClient: {}", e.getMessage());
        }
    }

}
