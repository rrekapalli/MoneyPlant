#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         NSE EOD Ingestion Test - Today (2025-11-12)         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Today's date
TODAY="2025-11-12"
FROM_DATE="12-11-2025"  # NSE format: DD-MM-YYYY
TO_DATE="12-11-2025"

# Test symbols
SYMBOLS=("RELIANCE" "TCS" "INFY" "HDFCBANK" "ICICIBANK")

echo "Testing NSE EOD data fetch for: $TODAY"
echo "Symbols: ${SYMBOLS[@]}"
echo ""

# Compile test if needed
if [ ! -f "TestNseProvider.class" ]; then
    echo "Compiling test..."
    ./run-nse-test.sh > /dev/null 2>&1
fi

# Create a modified test for today's date
cat > TestNseEodToday.java << 'EOFTEST'
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
import java.util.concurrent.TimeUnit;
import java.util.zip.GZIPInputStream;

public class TestNseEodToday {
    
    private static final String NSE_BASE_URL = "https://www.nseindia.com";
    private static final String HISTORICAL_ENDPOINT = "/api/historicalOR/generateSecurityWiseHistoricalData";
    
    public static void main(String[] args) {
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║         NSE EOD Test - 2025-11-12 (Today)                   ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
        System.out.println();
        
        String[] symbols = {"RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"};
        String fromDate = "12-11-2025";
        String toDate = "12-11-2025";
        
        try {
            CookieStore cookieStore = new BasicCookieStore();
            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectionRequestTimeout(Timeout.of(10, TimeUnit.SECONDS))
                    .setResponseTimeout(Timeout.of(30, TimeUnit.SECONDS))
                    .build();
            
            CloseableHttpClient httpClient = HttpClients.custom()
                    .setDefaultCookieStore(cookieStore)
                    .setDefaultRequestConfig(requestConfig)
                    .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .build();
            
            // Initialize session
            System.out.println("🔐 Initializing NSE session...");
            initializeSession(httpClient, cookieStore);
            
            // Test each symbol
            int successCount = 0;
            int totalRecords = 0;
            
            for (String symbol : symbols) {
                System.out.println();
                System.out.println("📊 Testing: " + symbol);
                try {
                    int records = fetchHistoricalData(httpClient, cookieStore, symbol, fromDate, toDate);
                    if (records >= 0) {
                        successCount++;
                        totalRecords += records;
                    }
                } catch (Exception e) {
                    System.out.println("  ❌ Error: " + e.getMessage());
                }
            }
            
            httpClient.close();
            
            System.out.println();
            System.out.println("╔══════════════════════════════════════════════════════════════╗");
            System.out.println("║  SUMMARY                                                     ║");
            System.out.println("╠══════════════════════════════════════════════════════════════╣");
            System.out.println("║  Date: 2025-11-12 (Today)                                    ║");
            System.out.println("║  Symbols Tested: " + symbols.length + "                                            ║");
            System.out.println("║  Successful: " + successCount + "                                                ║");
            System.out.println("║  Failed: " + (symbols.length - successCount) + "                                                    ║");
            System.out.println("║  Total Records: " + totalRecords + "                                             ║");
            System.out.println("╚══════════════════════════════════════════════════════════════╝");
            
            if (successCount == symbols.length) {
                System.out.println();
                System.out.println("✅ ALL TESTS PASSED! NSE EOD ingestion is working!");
            } else {
                System.out.println();
                System.out.println("⚠️  Some tests failed. Check logs above.");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Test failed: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    private static void initializeSession(CloseableHttpClient httpClient, CookieStore cookieStore) throws Exception {
        HttpGet homepageRequest = new HttpGet(NSE_BASE_URL);
        addBrowserHeaders(homepageRequest, NSE_BASE_URL, null);
        try (CloseableHttpResponse response = httpClient.execute(homepageRequest)) {
            EntityUtils.consume(response.getEntity());
        }
        Thread.sleep(500);
        
        HttpGet quotesRequest = new HttpGet(NSE_BASE_URL + "/get-quotes/equity");
        addBrowserHeaders(quotesRequest, NSE_BASE_URL + "/get-quotes/equity", NSE_BASE_URL);
        try (CloseableHttpResponse response = httpClient.execute(quotesRequest)) {
            EntityUtils.consume(response.getEntity());
        }
        Thread.sleep(500);
        
        HttpGet marketDataRequest = new HttpGet(NSE_BASE_URL + "/market-data");
        addBrowserHeaders(marketDataRequest, NSE_BASE_URL + "/market-data", NSE_BASE_URL);
        try (CloseableHttpResponse response = httpClient.execute(marketDataRequest)) {
            EntityUtils.consume(response.getEntity());
        }
        
        System.out.println("  ✅ Session initialized with " + cookieStore.getCookies().size() + " cookies");
    }
    
    private static int fetchHistoricalData(CloseableHttpClient httpClient, CookieStore cookieStore,
                                           String symbol, String fromDate, String toDate) throws Exception {
        String url = NSE_BASE_URL + HISTORICAL_ENDPOINT +
                "?from=" + fromDate +
                "&to=" + toDate +
                "&symbol=" + symbol +
                "&type=priceVolumeDeliverable" +
                "&series=ALL";
        
        HttpGet request = new HttpGet(url);
        addApiHeaders(request);
        
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            int statusCode = response.getCode();
            
            if (statusCode == 403) {
                System.out.println("  ❌ 403 Forbidden");
                return -1;
            }
            
            if (statusCode != 200) {
                System.out.println("  ❌ HTTP " + statusCode);
                return -1;
            }
            
            String contentEncoding = response.getFirstHeader("Content-Encoding") != null ? 
                    response.getFirstHeader("Content-Encoding").getValue() : "none";
            
            byte[] responseBytes = EntityUtils.toByteArray(response.getEntity());
            
            String jsonResponse;
            if ("br".equals(contentEncoding)) {
                jsonResponse = decompressBrotli(responseBytes);
            } else if ("gzip".equals(contentEncoding)) {
                jsonResponse = decompressGzip(responseBytes);
            } else {
                jsonResponse = new String(responseBytes, StandardCharsets.UTF_8);
            }
            
            int recordCount = jsonResponse.split("\"CH_TIMESTAMP\"").length - 1;
            
            System.out.println("  ✅ HTTP " + statusCode + " - " + recordCount + " records");
            if (recordCount > 0) {
                // Show first record timestamp
                int timestampStart = jsonResponse.indexOf("\"mTIMESTAMP\":\"") + 14;
                if (timestampStart > 13) {
                    int timestampEnd = jsonResponse.indexOf("\"", timestampStart);
                    String timestamp = jsonResponse.substring(timestampStart, timestampEnd);
                    System.out.println("  📅 First record: " + timestamp);
                }
            }
            
            return recordCount;
        }
    }
    
    private static void addBrowserHeaders(HttpGet request, String url, String referer) {
        request.setHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        request.setHeader("Accept-Language", "en-US,en;q=0.9");
        request.setHeader("Accept-Encoding", "gzip, deflate, br");
        request.setHeader("Connection", "keep-alive");
        request.setHeader("DNT", "1");
        request.setHeader("Sec-Fetch-Dest", "document");
        request.setHeader("Sec-Fetch-Mode", "navigate");
        request.setHeader("Sec-Fetch-Site", referer != null ? "same-origin" : "none");
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
EOFTEST

echo "Compiling EOD test..."
/home/raja/.jdks/corretto-21.0.8/bin/javac -cp "lib/*" TestNseEodToday.java

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Compilation successful"
echo ""
echo "Running EOD test for today (2025-11-12)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

/home/raja/.jdks/corretto-21.0.8/bin/java -cp ".:lib/*" TestNseEodToday

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
