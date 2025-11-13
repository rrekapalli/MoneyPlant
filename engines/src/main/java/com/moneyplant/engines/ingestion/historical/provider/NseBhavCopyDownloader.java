package com.moneyplant.engines.ingestion.historical.provider;

import com.moneyplant.engines.ingestion.historical.model.BhavCopyData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.io.*;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Service for downloading NSE Bhav Copy files.
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
        "https://www.nseindia.com/content/historical/EQUITIES/%d/%s/cm%sbhav.csv.zip";
    
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("ddMMMyyyy", Locale.ENGLISH);
    
    private final WebClient webClient;
    private final int downloadDelayMs;
    private final int maxRetries;
    private final double retryBackoffMultiplier;
    
    public NseBhavCopyDownloader(
            @Value("${ingestion.providers.nse.historical.base-url:https://www.nseindia.com}") String baseUrl,
            @Value("${ingestion.providers.nse.historical.download-delay-ms:300}") int downloadDelayMs,
            @Value("${ingestion.providers.nse.historical.max-retries:6}") int maxRetries,
            @Value("${ingestion.providers.nse.historical.retry-backoff-multiplier:2.0}") double retryBackoffMultiplier) {
        
        this.downloadDelayMs = downloadDelayMs;
        this.maxRetries = maxRetries;
        this.retryBackoffMultiplier = retryBackoffMultiplier;
        
        // Create WebClient with NSE-specific headers
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.USER_AGENT, 
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .defaultHeader(HttpHeaders.ACCEPT, 
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "en-US,en;q=0.9")
                .defaultHeader(HttpHeaders.ACCEPT_ENCODING, "gzip, deflate, br")
                .defaultHeader(HttpHeaders.CONNECTION, "keep-alive")
                .defaultHeader(HttpHeaders.CACHE_CONTROL, "max-age=0")
                .defaultHeader("Upgrade-Insecure-Requests", "1")
                .defaultHeader("Sec-Fetch-Dest", "document")
                .defaultHeader("Sec-Fetch-Mode", "navigate")
                .defaultHeader("Sec-Fetch-Site", "none")
                .defaultHeader("Sec-Fetch-User", "?1")
                .build();
        
        log.info("NseBhavCopyDownloader initialized with baseUrl={}, downloadDelayMs={}, maxRetries={}, backoffMultiplier={}", 
                baseUrl, downloadDelayMs, maxRetries, retryBackoffMultiplier);
    }
    
    /**
     * Initialize NSE session by visiting homepage to set cookies.
     * This is required before downloading bhavcopy files.
     * 
     * Requirements: 1.3
     */
    public Mono<Void> initializeNseSession() {
        log.info("Initializing NSE session by visiting homepage");
        
        return webClient.get()
                .uri(NSE_HOMEPAGE)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("NSE session initialized successfully"))
                .doOnError(error -> log.error("Failed to initialize NSE session", error))
                .then()
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(5))
                        .filter(throwable -> !(throwable instanceof WebClientResponseException.NotFound)));
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
     * @return Mono that completes when all files are downloaded
     */
    public Mono<Void> downloadToStaging(
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
            return Mono.error(new RuntimeException("Failed to create staging directory: " + stagingDir, e));
        }
        
        // Initialize session first
        return initializeNseSession()
                .then(Mono.defer(() -> {
                    // Generate list of dates to download
                    List<LocalDate> dates = new ArrayList<>();
                    LocalDate current = startDate;
                    while (!current.isAfter(endDate)) {
                        dates.add(current);
                        current = current.plusDays(1);
                    }
                    
                    log.info("Total dates to process: {}", dates.size());
                    
                    // Download files sequentially with delay between downloads
                    return Flux.fromIterable(dates)
                            .concatMap(date -> downloadBhavCopyForDate(date, stagingDir)
                                    .doOnSuccess(v -> {
                                        // Invoke callback after successful download
                                        if (onDateProcessed != null) {
                                            onDateProcessed.accept(date);
                                        }
                                    })
                                    .delayElement(Duration.ofMillis(downloadDelayMs)))
                            .then();
                }));
    }
    
    /**
     * Download bhavcopy files for a date range and save to staging directory.
     * Convenience method without progress callback.
     * 
     * Requirements: 1.1, 1.2, 1.4, 1.8, 1.9, 1.10, 1.12
     * 
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @param stagingDir Staging directory to save CSV files
     * @return Mono that completes when all files are downloaded
     */
    public Mono<Void> downloadToStaging(LocalDate startDate, LocalDate endDate, Path stagingDir) {
        return downloadToStaging(startDate, endDate, stagingDir, null);
    }
    

    
    /**
     * Download bhavcopy file for a specific date and extract to staging directory.
     * 
     * Requirements: 1.2, 1.4, 1.8, 1.9, 1.10, 6.1, 6.2
     * 
     * @param date Date to download
     * @param stagingDir Staging directory
     * @return Mono that completes when file is downloaded and extracted
     */
    private Mono<Void> downloadBhavCopyForDate(LocalDate date, Path stagingDir) {
        String url = buildBhavCopyUrl(date);
        String filename = String.format("bhav_%s.csv", date.format(DateTimeFormatter.BASIC_ISO_DATE));
        Path outputPath = stagingDir.resolve(filename);
        
        log.debug("Downloading bhav copy for date: {}, URL: {}", date, url);
        
        return downloadBhavCopy(url)
                .flatMap(zipBytes -> extractZipToFile(zipBytes, outputPath))
                .doOnSuccess(v -> log.info("Successfully downloaded and extracted bhav copy for date: {}", date))
                .doOnError(error -> {
                    if (error instanceof WebClientResponseException.NotFound) {
                        log.info("Bhav copy not found for date: {} (likely weekend/holiday)", date);
                    } else {
                        log.error("Failed to download bhav copy for date: {}", date, error);
                    }
                })
                .onErrorResume(WebClientResponseException.NotFound.class, e -> {
                    // 404 is expected for weekends/holidays, don't fail the entire process
                    return Mono.empty();
                });
    }
    
    /**
     * Download bhavcopy ZIP file from NSE.
     * Implements retry logic with exponential backoff.
     * 
     * Requirements: 1.2, 1.8, 1.9, 6.1, 6.2
     * 
     * @param url URL to download
     * @return Mono containing ZIP file bytes
     */
    private Mono<byte[]> downloadBhavCopy(String url) {
        return webClient.get()
                .uri(url)
                .header(HttpHeaders.REFERER, NSE_HOMEPAGE)
                .accept(MediaType.APPLICATION_OCTET_STREAM)
                .retrieve()
                .bodyToMono(byte[].class)
                .retryWhen(Retry.backoff(maxRetries, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(32))
                        .filter(throwable -> {
                            // Don't retry on 404 (missing data for weekend/holiday)
                            if (throwable instanceof WebClientResponseException.NotFound) {
                                return false;
                            }
                            // Retry on other errors
                            return true;
                        })
                        .doBeforeRetry(signal -> 
                            log.warn("Retrying download (attempt {}/{}): {}", 
                                    signal.totalRetries() + 1, maxRetries, signal.failure().getMessage())));
    }
    
    /**
     * Extract ZIP file and save CSV content to staging directory.
     * 
     * Requirements: 1.4, 1.12
     * 
     * @param zipBytes ZIP file bytes
     * @param outputPath Output file path
     * @return Mono that completes when extraction is done
     */
    private Mono<Void> extractZipToFile(byte[] zipBytes, Path outputPath) {
        return Mono.fromCallable(() -> {
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
                return null;
                
            } catch (IOException e) {
                throw new RuntimeException("Failed to extract ZIP file to: " + outputPath, e);
            }
        }).then();
    }
    
    /**
     * Build NSE bhavcopy download URL for a specific date.
     * URL format: https://www.nseindia.com/content/historical/EQUITIES/{year}/{month}/cm{DDMMMYYYY}bhav.csv.zip
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
}
