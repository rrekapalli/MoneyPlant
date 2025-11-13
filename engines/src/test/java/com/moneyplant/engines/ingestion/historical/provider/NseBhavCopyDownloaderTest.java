package com.moneyplant.engines.ingestion.historical.provider;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for NseBhavCopyDownloader.
 * 
 * Tests URL building, date formatting, and basic functionality.
 * Integration tests with actual NSE downloads should be done separately.
 */
class NseBhavCopyDownloaderTest {
    
    private NseBhavCopyDownloader downloader;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() {
        downloader = new NseBhavCopyDownloader(
                "https://www.nseindia.com",
                300,
                6,
                2.0
        );
    }
    
    @Test
    void testBuildBhavCopyUrl() {
        // Test URL building for a specific date
        LocalDate date = LocalDate.of(2024, 1, 15);
        
        // Use reflection to access private method for testing
        String url = (String) ReflectionTestUtils.invokeMethod(
                downloader, "buildBhavCopyUrl", date);
        
        assertNotNull(url);
        assertTrue(url.contains("2024"), "URL should contain year");
        assertTrue(url.contains("JAN"), "URL should contain month");
        assertTrue(url.contains("15JAN2024"), "URL should contain formatted date");
        assertTrue(url.endsWith("bhav.csv.zip"), "URL should end with bhav.csv.zip");
        
        // Verify full URL format
        String expectedUrl = "https://www.nseindia.com/content/historical/EQUITIES/2024/JAN/cm15JAN2024bhav.csv.zip";
        assertEquals(expectedUrl, url);
    }
    
    @Test
    void testBuildBhavCopyUrlForDifferentMonths() {
        // Test different months
        LocalDate[] dates = {
                LocalDate.of(2024, 1, 1),   // January
                LocalDate.of(2024, 6, 15),  // June
                LocalDate.of(2024, 12, 31)  // December
        };
        
        String[] expectedMonths = {"JAN", "JUN", "DEC"};
        
        for (int i = 0; i < dates.length; i++) {
            String url = (String) ReflectionTestUtils.invokeMethod(
                    downloader, "buildBhavCopyUrl", dates[i]);
            
            assertTrue(url.contains(expectedMonths[i]), 
                    "URL should contain month: " + expectedMonths[i]);
        }
    }
    
    @Test
    void testDownloaderInitialization() {
        assertNotNull(downloader);
        
        // Verify configuration values are set
        int downloadDelayMs = (int) ReflectionTestUtils.getField(downloader, "downloadDelayMs");
        int maxRetries = (int) ReflectionTestUtils.getField(downloader, "maxRetries");
        double retryBackoffMultiplier = (double) ReflectionTestUtils.getField(downloader, "retryBackoffMultiplier");
        
        assertEquals(300, downloadDelayMs);
        assertEquals(6, maxRetries);
        assertEquals(2.0, retryBackoffMultiplier);
    }
    
    @Test
    void testStagingDirectoryCreation() {
        // This test verifies that the staging directory path is correctly handled
        Path stagingDir = tempDir.resolve("test_staging");
        
        assertFalse(stagingDir.toFile().exists(), "Staging directory should not exist initially");
        
        // The actual directory creation happens in downloadToStaging method
        // We're just verifying the path handling here
        assertNotNull(stagingDir);
        assertTrue(stagingDir.toString().contains("test_staging"));
    }
    
    @Test
    void testDateFormatting() {
        // Test that date formatting matches NSE requirements
        LocalDate date = LocalDate.of(2024, 3, 5);
        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("ddMMMyyyy", java.util.Locale.ENGLISH);
        String formatted = date.format(dateFormatter).toUpperCase();
        
        assertEquals("05MAR2024", formatted);
    }
}
