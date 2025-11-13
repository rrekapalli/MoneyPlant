import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.cookie.BasicCookieStore;
import org.apache.hc.client5.http.cookie.CookieStore;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.util.Timeout;

import org.brotli.dec.BrotliInputStream;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;
import java.util.zip.GZIPInputStream;

/**
 * Standalone test for NSE India Provider - Tests 403 solution
 * 
 * To run:
 * 1. Download dependencies:
 *    mvn dependency:copy-dependencies -DoutputDirectory=lib -f engines/pom.xml
 * 2. Compile:
 *    javac -cp "lib/*" TestNseProvider.java
 * 3. Run:
 *    java -cp ".:lib/*" TestNseProvider
 */
public class TestNseProvider {
    
    private static final String NSE_BASE_URL = "https://www.nseindia.com";
    private static final String HISTORICAL_ENDPOINT = "/api/historicalOR/generateSecurityWiseHistoricalData";
    private static final DateTimeFormatter NSE_DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    
    public static void main(String[] args) {
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║         NSE India Provider - 403 Solution Test               ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
        System.out.println();
        
        try {
            // Create cookie store
            CookieStore cookieStore = new BasicCookieStore();
            
            // Configure request timeouts
            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectionRequestTimeout(Timeout.of(10, TimeUnit.SECONDS))
                    .setResponseTimeout(Timeout.of(30, TimeUnit.SECONDS))
                    .build();
            
            // Create HttpClient with cookie store
            CloseableHttpClient httpClient = HttpClients.custom()
                    .setDefaultCookieStore(cookieStore)
                    .setDefaultRequestConfig(requestConfig)
                    .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .build();
            
            System.out.println("✅ HttpClient created with persistent cookie store");
            System.out.println();
            
            // Step 1: Initialize session
            System.out.println("🔐 Initializing NSE session (lazy initialization simulation)...");
            initializeSession(httpClient, cookieStore);
            
            // Step 2: Fetch historical data for RELIANCE
            System.out.println();
            System.out.println("📊 Test 1: Fetching historical data for RELIANCE...");
            fetchHistoricalData(httpClient, cookieStore, "RELIANCE", 
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31));
            
            // Step 3: Fetch another symbol to test session reuse
            System.out.println();
            System.out.println("📊 Test 2: Fetching historical data for TCS (session reuse)...");
            fetchHistoricalData(httpClient, cookieStore, "TCS", 
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31));
            
            // Step 4: Test with INFY
            System.out.println();
            System.out.println("📊 Test 3: Fetching historical data for INFY (session reuse)...");
            fetchHistoricalData(httpClient, cookieStore, "INFY", 
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31));
            
            httpClient.close();
            
            System.out.println();
            System.out.println("╔══════════════════════════════════════════════════════════════╗");
            System.out.println("║  ✅ ALL TESTS PASSED! NO 403 ERRORS!                        ║");
            System.out.println("║  The NSE 403 solution is working correctly!                  ║");
            System.out.println("╚══════════════════════════════════════════════════════════════╝");
            
        } catch (Exception e) {
            System.out.println();
            System.out.println("╔══════════════════════════════════════════════════════════════╗");
            System.out.println("║  ❌ TEST FAILED                                              ║");
            System.out.println("╚══════════════════════════════════════════════════════════════╝");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    private static void initializeSession(CloseableHttpClient httpClient, CookieStore cookieStore) throws Exception {
        // Step 1: Visit homepage
        System.out.println("  📍 Step 1/3: Visiting NSE homepage");
        HttpGet homepageRequest = new HttpGet(NSE_BASE_URL);
        addBrowserHeaders(homepageRequest, NSE_BASE_URL, null);
        
        try (CloseableHttpResponse response = httpClient.execute(homepageRequest)) {
            int statusCode = response.getCode();
            EntityUtils.consume(response.getEntity());
            System.out.println("     Response: " + statusCode + " - Cookies: " + cookieStore.getCookies().size());
        }
        
        Thread.sleep(500);
        
        // Step 2: Visit get-quotes page
        System.out.println("  📍 Step 2/3: Visiting get-quotes/equity page");
        HttpGet quotesRequest = new HttpGet(NSE_BASE_URL + "/get-quotes/equity");
        addBrowserHeaders(quotesRequest, NSE_BASE_URL + "/get-quotes/equity", NSE_BASE_URL);
        
        try (CloseableHttpResponse response = httpClient.execute(quotesRequest)) {
            int statusCode = response.getCode();
            EntityUtils.consume(response.getEntity());
            System.out.println("     Response: " + statusCode + " - Cookies: " + cookieStore.getCookies().size());
        }
        
        Thread.sleep(500);
        
        // Step 3: Visit market-data page
        System.out.println("  📍 Step 3/3: Visiting market-data page");
        HttpGet marketDataRequest = new HttpGet(NSE_BASE_URL + "/market-data");
        addBrowserHeaders(marketDataRequest, NSE_BASE_URL + "/market-data", NSE_BASE_URL);
        
        try (CloseableHttpResponse response = httpClient.execute(marketDataRequest)) {
            int statusCode = response.getCode();
            EntityUtils.consume(response.getEntity());
            System.out.println("     Response: " + statusCode + " - Cookies: " + cookieStore.getCookies().size());
        }
        
        System.out.println("  ✅ Session initialized with " + cookieStore.getCookies().size() + " cookies");
        System.out.println("  Cookies:");
        cookieStore.getCookies().forEach(cookie -> 
            System.out.println("     • " + cookie.getName() + " = " + 
                    cookie.getValue().substring(0, Math.min(20, cookie.getValue().length())) + "...")
        );
    }
    
    private static void fetchHistoricalData(CloseableHttpClient httpClient, CookieStore cookieStore,
                                           String symbol, LocalDate start, LocalDate end) throws Exception {
        String fromDate = start.format(NSE_DATE_FORMAT);
        String toDate = end.format(NSE_DATE_FORMAT);
        
        String url = NSE_BASE_URL + HISTORICAL_ENDPOINT +
                "?from=" + fromDate +
                "&to=" + toDate +
                "&symbol=" + symbol +
                "&type=priceVolumeDeliverable" +
                "&series=ALL";
        
        System.out.println("  Request: " + symbol + " (" + fromDate + " to " + toDate + ")");
        System.out.println("  Cookies in store: " + cookieStore.getCookies().size());
        
        HttpGet request = new HttpGet(url);
        addApiHeaders(request);
        
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            int statusCode = response.getCode();
            
            if (statusCode == 403) {
                System.out.println("  ❌ 403 Forbidden - Anti-bot protection triggered!");
                throw new RuntimeException("403 Forbidden for " + symbol);
            }
            
            if (statusCode != 200) {
                System.out.println("  ❌ Error: HTTP " + statusCode);
                throw new RuntimeException("HTTP " + statusCode + " for " + symbol);
            }
            
            // Check response headers
            String contentType = response.getEntity().getContentType();
            String contentEncoding = response.getFirstHeader("Content-Encoding") != null ? 
                    response.getFirstHeader("Content-Encoding").getValue() : "none";
            
            System.out.println("  Content-Type: " + contentType);
            System.out.println("  Content-Encoding: " + contentEncoding);
            
            byte[] responseBytes = EntityUtils.toByteArray(response.getEntity());
            System.out.println("  Raw size: " + responseBytes.length + " bytes");
            
            // Decompress based on Content-Encoding
            String jsonResponse;
            if ("br".equals(contentEncoding)) {
                // Brotli compression
                try {
                    jsonResponse = decompressBrotli(responseBytes);
                    System.out.println("  ✅ Brotli decompression successful: " + jsonResponse.length() + " bytes");
                } catch (Exception e) {
                    System.out.println("  ❌ Brotli decompression failed: " + e.getMessage());
                    jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);
                }
            } else if ("gzip".equals(contentEncoding)) {
                // GZIP compression
                try {
                    jsonResponse = decompressGzip(responseBytes);
                    System.out.println("  ✅ GZIP decompression successful: " + jsonResponse.length() + " bytes");
                } catch (Exception e) {
                    System.out.println("  ❌ GZIP decompression failed: " + e.getMessage());
                    jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);
                }
            } else {
                // No compression or unknown
                jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);
                System.out.println("  ℹ️  No compression detected");
            }
            
            // Count records in response
            int recordCount = jsonResponse.split("\"CH_TIMESTAMP\"").length - 1;
            
            System.out.println("  ✅ Success! HTTP " + statusCode);
            System.out.println("  Records found: " + recordCount);
            System.out.println("  Preview: " + jsonResponse.substring(0, Math.min(200, jsonResponse.length())) + "...");
        }
    }
    
    private static void addBrowserHeaders(HttpGet request, String url, String referer) {
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
    
    private static void addApiHeaders(HttpGet request) {
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
    
    /**
     * Decompress Brotli-compressed byte array to string.
     */
    private static String decompressBrotli(byte[] compressed) throws Exception {
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
     * Decompress GZIP-compressed byte array to string.
     */
    private static String decompressGzip(byte[] compressed) throws Exception {
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
}
