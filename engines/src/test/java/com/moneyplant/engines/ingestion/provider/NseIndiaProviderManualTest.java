package com.moneyplant.engines.ingestion.provider;

import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.cookie.BasicCookieStore;
import org.apache.hc.client5.http.cookie.CookieStore;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.util.Timeout;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

/**
 * Manual test for NSE India Provider to verify 403 issue is resolved.
 * Run this as a standalone Java application.
 */
public class NseIndiaProviderManualTest {
    
    private static final String NSE_BASE_URL = "https://www.nseindia.com";
    private static final String HISTORICAL_ENDPOINT = "/api/historicalOR/generateSecurityWiseHistoricalData";
    private static final DateTimeFormatter NSE_DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    
    public static void main(String[] args) {
        System.out.println("=== NSE India Provider Manual Test ===\n");
        
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
            
            System.out.println("✅ HttpClient created with cookie store\n");
            
            // Step 1: Initialize session
            System.out.println("🔐 Initializing NSE session...");
            initializeSession(httpClient, cookieStore);
            
            // Step 2: Fetch historical data
            System.out.println("\n📊 Fetching historical data for RELIANCE...");
            fetchHistoricalData(httpClient, cookieStore, "RELIANCE", 
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31));
            
            // Step 3: Fetch another symbol to test session reuse
            System.out.println("\n📊 Fetching historical data for TCS...");
            fetchHistoricalData(httpClient, cookieStore, "TCS", 
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31));
            
            httpClient.close();
            
            System.out.println("\n✅ Test completed successfully! No 403 errors!");
            
        } catch (Exception e) {
            System.err.println("\n❌ Test failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static void initializeSession(CloseableHttpClient httpClient, CookieStore cookieStore) throws Exception {
        // Step 1: Visit homepage
        System.out.println("📍 Step 1/3: Visiting NSE homepage");
        HttpGet homepageRequest = new HttpGet(NSE_BASE_URL);
        addBrowserHeaders(homepageRequest, NSE_BASE_URL, null);
        
        try (CloseableHttpResponse response = httpClient.execute(homepageRequest)) {
            int statusCode = response.getCode();
            EntityUtils.consume(response.getEntity());
            System.out.println("   Response: " + statusCode + " - Cookies: " + cookieStore.getCookies().size());
        }
        
        Thread.sleep(500);
        
        // Step 2: Visit get-quotes page
        System.out.println("📍 Step 2/3: Visiting get-quotes/equity page");
        HttpGet quotesRequest = new HttpGet(NSE_BASE_URL + "/get-quotes/equity");
        addBrowserHeaders(quotesRequest, NSE_BASE_URL + "/get-quotes/equity", NSE_BASE_URL);
        
        try (CloseableHttpResponse response = httpClient.execute(quotesRequest)) {
            int statusCode = response.getCode();
            EntityUtils.consume(response.getEntity());
            System.out.println("   Response: " + statusCode + " - Cookies: " + cookieStore.getCookies().size());
        }
        
        Thread.sleep(500);
        
        // Step 3: Visit market-data page
        System.out.println("📍 Step 3/3: Visiting market-data page");
        HttpGet marketDataRequest = new HttpGet(NSE_BASE_URL + "/market-data");
        addBrowserHeaders(marketDataRequest, NSE_BASE_URL + "/market-data", NSE_BASE_URL);
        
        try (CloseableHttpResponse response = httpClient.execute(marketDataRequest)) {
            int statusCode = response.getCode();
            EntityUtils.consume(response.getEntity());
            System.out.println("   Response: " + statusCode + " - Cookies: " + cookieStore.getCookies().size());
        }
        
        System.out.println("✅ Session initialized with " + cookieStore.getCookies().size() + " cookies");
        cookieStore.getCookies().forEach(cookie -> 
            System.out.println("   Cookie: " + cookie.getName() + " = " + 
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
        
        System.out.println("   URL: " + url);
        System.out.println("   Cookies in store: " + cookieStore.getCookies().size());
        
        HttpGet request = new HttpGet(url);
        addApiHeaders(request);
        
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            int statusCode = response.getCode();
            
            if (statusCode == 403) {
                System.err.println("   ❌ 403 Forbidden - Anti-bot protection triggered!");
                throw new RuntimeException("403 Forbidden");
            }
            
            if (statusCode != 200) {
                System.err.println("   ❌ Error: " + statusCode);
                throw new RuntimeException("HTTP " + statusCode);
            }
            
            byte[] responseBytes = EntityUtils.toByteArray(response.getEntity());
            String jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);
            
            System.out.println("   ✅ Response: " + statusCode);
            System.out.println("   Data length: " + jsonResponse.length() + " bytes");
            System.out.println("   Preview: " + jsonResponse.substring(0, Math.min(200, jsonResponse.length())) + "...");
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
}
