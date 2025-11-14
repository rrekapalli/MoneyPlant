package com.moneyplant.engines.ingestion.historical.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Service for downloading NSE Bhav Copy files using synchronous HTTP calls.
 * 
 * Responsibilities:
 * - Download bhavcopy ZIP files from NSE for a date range
 * - Handle NSE session initialization with cookies
 * - Implement retry logic with exponential backoff
 * - Extract ZIP files to staging directory
 * - Rate limiting between downloads
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.8, 1.9, 1.10, 1.12, 6.1, 6.2
 */
@Service
@Slf4j
public class NseBhavCopyDownloader {
    
    private static final String NSE_HOMEPAGE = "https://www.nseindia.com";
    private static final String BHAV_COPY_URL_TEMPLATE = 
        "https://archives.nseindia.com/content/historical/EQUITIES/%d/%s/cm%sbhav.csv.zip";
    
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("ddMMMyyyy", Locale.ENGLISH);
    
    private final int downloadDelayMs;
    private final int maxRetries;
    private final double retryBackoffMultiplier;
    
    // Session cookies for NSE
    private String sessionCookies = "";
    
    public NseBhavCopyDownloader(
            @Value("${ingestion.providers.nse.historical.base-url:https://archives.nseindia.com}") String baseUrl,
            @Value("${ingestion.providers.nse.historical.download-delay-ms:300}") int downloadDelayMs,
            @Value("${ingestion.providers.nse.historical.max-retries:6}") int maxRetries,
            @Value("${ingestion.providers.nse.historical.retry-backoff-multiplier:2.0}") double retryBackoffMultiplier) {
        
        this.downloadDelayMs = downloadDelayMs;
        this.maxRetries = maxRetries;
        this.retryBackoffMultiplier = retryBackoffMultiplier;
        
        log.info("NseBhavCopyDownloader initialized with baseUrl={}, downloadDelayMs={}, maxRetries={}, backoffMultiplier={}", 
                baseUrl, downloadDelayMs, maxRetries, retryBackoffMultiplier);
    }
    
    /**
     * Initialize NSE session by visiting homepage to set cookies.
     * This is required before downloading bhavcopy files.
     * 
     * Requirements: 1.3
     */
    public void initializeNseSession() {
        log.info("Initializing NSE session by visiting homepage");
        
        try {
            URL url = new URL(NSE_HOMEPAGE);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            addBrowserHeaders(conn);
            
            int responseCode = conn.getResponseCode();
            log.info("NSE homepage response: {}", responseCode);
            
            // Extract cookies from response
            String cookies = conn.getHeaderField("Set-Cookie");
            if (cookies != null) {
                sessionCookies = cookies;
                log.info("Session cookies obtained");
            }
            
            conn.disconnect();
            log.info("NSE session initialized successfully");
            
        } catch (Exception e) {
            log.error("Failed to initialize NSE session", e);
            // Continue anyway - downloads might still work
        }
    }
    
    /**
     * Download bhavcopy files for a date range and save to staging directory.
     * 
     * Requirements: 1.1, 1.2, 1.4, 1.8, 1.9, 1.10, 1.12
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @param stagingDir Staging directory to save CSV files
     * @param onDateProcessed Optional callback invoked after each date is successfully processed
     */
    public void downloadToStaging(
            LocalDate startDate, 
            LocalDate endDate, 
            Path stagingDir,
            java.util.function.Consumer<LocalDate> onDateProcessed) {
        log.info("Starting bhav copy download from {} to {}, staging directory: {}", 
                startDate, endDate, stagingDir);
        
        // Create staging directory if it doesn't exist
        try {
            Files.createDirectories(stagingDir);
            log.info("Created staging directory: {}", stagingDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create staging directory: " + stagingDir, e);
        }
        
        // Initialize session first
        initializeNseSession();
        
        // Download files sequentially
        LocalDate current = startDate;
        int totalDates = 0;
        int successfulDownloads = 0;
        int skippedDates = 0;
        
        while (!current.isAfter(endDate)) {
            totalDates++;
            log.info("Processing date {} ({}/{})", current, totalDates, 
                    java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1);
            
            boolean downloaded = downloadBhavCopyForDate(current, stagingDir);
            
            if (downloaded) {
                successfulDownloads++;
                if (onDateProcessed != null) {
                    onDateProcessed.accept(current);
                }
            } else {
                skippedDates++;
            }
            
            current = current.plusDays(1);
            
            // Rate limiting delay between downloads
            if (!current.isAfter(endDate)) {
                try {
                    Thread.sleep(downloadDelayMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Download interrupted");
                    break;
                }
            }
        }
        
        log.info("Download phase completed: {} total dates, {} successful downloads, {} skipped (holidays/weekends)", 
                totalDates, successfulDownloads, skippedDates);
    }
    
    /**
     * Download bhavcopy files for a date range and save to staging directory.
     * Convenience method without progress callback.
     */
    public void downloadToStaging(LocalDate startDate, LocalDate endDate, Path stagingDir) {
        downloadToStaging(startDate, endDate, stagingDir, null);
    }
    
    /**
     * Download bhavcopy file for a specific date and extract to staging directory.
     * 
     * Requirements: 1.2, 1.4, 1.8, 1.9, 1.10, 6.1, 6.2
     * 
     * @param date Date to download
     * @param stagingDir Staging directory
     * @return true if file was downloaded successfully, false if skipped (404)
     */
    private boolean downloadBhavCopyForDate(LocalDate date, Path stagingDir) {
        String url = buildBhavCopyUrl(date);
        String filename = String.format("bhav_%s.csv", date.format(DateTimeFormatter.BASIC_ISO_DATE));
        Path outputPath = stagingDir.resolve(filename);
        
        log.info("Downloading bhav copy for date: {}", date);
        log.debug("URL: {}", url);
        log.debug("Output: {}", outputPath);
        
        // Retry logic with exponential backoff
        int attempt = 0;
        long backoffMs = 1000; // Start with 1 second
        
        while (attempt < maxRetries) {
            try {
                byte[] zipBytes = downloadFile(url);
                extractZipToFile(zipBytes, outputPath);
                log.info("Successfully downloaded and extracted bhav copy for date: {}", date);
                return true;
                
            } catch (FileNotFoundException e) {
                // 404 - file not found (holiday/weekend)
                log.info("Bhav copy not found for date: {} (likely weekend/holiday)", date);
                return false;
                
            } catch (Exception e) {
                attempt++;
                if (attempt >= maxRetries) {
                    log.error("Failed to download bhav copy for date {} after {} attempts", date, maxRetries, e);
                    return false;
                }
                
                log.warn("Download attempt {}/{} failed for date {}: {}. Retrying in {}ms...", 
                        attempt, maxRetries, date, e.getMessage(), backoffMs);
                
                try {
                    Thread.sleep(backoffMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return false;
                }
                
                backoffMs = (long) (backoffMs * retryBackoffMultiplier);
                if (backoffMs > 32000) backoffMs = 32000; // Cap at 32 seconds
            }
        }
        
        return false;
    }
    
    /**
     * Download file from URL using HttpURLConnection.
     * 
     * @param urlString URL to download
     * @return byte array of downloaded content
     * @throws IOException if download fails
     */
    private byte[] downloadFile(String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        addBrowserHeaders(conn);
        
        // Add session cookies if available
        if (!sessionCookies.isEmpty()) {
            conn.setRequestProperty("Cookie", sessionCookies);
        }
        
        int responseCode = conn.getResponseCode();
        
        if (responseCode == 404) {
            conn.disconnect();
            throw new FileNotFoundException("File not found: " + urlString);
        }
        
        if (responseCode != 200) {
            conn.disconnect();
            throw new IOException("HTTP error code: " + responseCode);
        }
        
        // Read response
        try (InputStream is = conn.getInputStream();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesRead);
            }
            
            conn.disconnect();
            return baos.toByteArray();
        }
    }
    
    /**
     * Add browser-like headers to HTTP connection.
     */
    private void addBrowserHeaders(HttpURLConnection conn) {
        conn.setRequestProperty("User-Agent", 
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        conn.setRequestProperty("Accept", 
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
        conn.setRequestProperty("Accept-Language", "en-US,en;q=0.9");
        conn.setRequestProperty("Accept-Encoding", "gzip, deflate, br");
        conn.setRequestProperty("Connection", "keep-alive");
        conn.setRequestProperty("Cache-Control", "max-age=0");
        conn.setRequestProperty("Referer", NSE_HOMEPAGE);
    }
    
    /**
     * Extract ZIP file and save CSV content to staging directory.
     * 
     * Requirements: 1.4, 1.12
     * 
     * @param zipBytes ZIP file bytes
     * @param outputPath Output file path
     */
    private void extractZipToFile(byte[] zipBytes, Path outputPath) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry = zis.getNextEntry();
            
            if (entry == null) {
                throw new IOException("ZIP file is empty");
            }
            
            // Read CSV content from ZIP
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int len;
            while ((len = zis.read(buffer)) > 0) {
                baos.write(buffer, 0, len);
            }
            
            // Write to output file
            Files.write(outputPath, baos.toByteArray());
            
            log.debug("Extracted CSV to: {}", outputPath);
        }
    }
    
    /**
     * Build NSE bhavcopy download URL for a specific date.
     * URL format: https://archives.nseindia.com/content/historical/EQUITIES/{year}/{month}/cm{DDMMMYYYY}bhav.csv.zip
     * Example: https://archives.nseindia.com/content/historical/EQUITIES/2024/JAN/cm08JAN2024bhav.csv.zip
     * 
     * Requirements: 1.2
     * 
     * @param date Date to build URL for
     * @return Bhav copy download URL
     */
    private String buildBhavCopyUrl(LocalDate date) {
        int year = date.getYear();
        String month = date.format(MONTH_FORMATTER).toUpperCase();
        String dateStr = date.format(DATE_FORMATTER).toUpperCase();
        
        return String.format(BHAV_COPY_URL_TEMPLATE, year, month, dateStr);
    }
    
    /**
     * Test method to verify URL building and print the URL.
     * This is for debugging purposes.
     */
    public void testUrlBuilding(LocalDate date) {
        String url = buildBhavCopyUrl(date);
        log.info("TEST: URL for date {} is: {}", date, url);
        log.info("TEST: Template: {}", BHAV_COPY_URL_TEMPLATE);
    }
}
