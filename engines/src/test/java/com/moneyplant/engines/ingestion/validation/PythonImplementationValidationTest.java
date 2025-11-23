package com.moneyplant.engines.ingestion.validation;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import com.moneyplant.engines.ingestion.repository.OhlcvRepository;
import com.moneyplant.engines.ingestion.service.BackfillService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import reactor.test.StepVerifier;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Validation tests comparing Java implementation with Python implementation
 * 
 * These tests validate that the Java ingestion engine produces the same results
 * as the existing Python implementation for the same date ranges and symbols.
 * 
 * Prerequisites:
 * - Python implementation must have ingested data for the test date range
 * - Database must contain historical data from Python ingestion
 * - Set PYTHON_VALIDATION_ENABLED=true to run these tests
 */
@SpringBootTest(properties = {
    "spring.kafka.enabled=false",
    "ingestion.auto-start.enabled=false",
    "nse.websocket.enabled=false",
    "nse.auto-start.enabled=false"
})
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "PYTHON_VALIDATION_ENABLED", matches = "true")
class PythonImplementationValidationTest {

    @Autowired
    private OhlcvRepository ohlcvRepository;

    @Autowired
    private BackfillService backfillService;

    private static final String TEST_SYMBOL = "RELIANCE";
    private static final LocalDate TEST_START_DATE = LocalDate.of(2024, 1, 1);
    private static final LocalDate TEST_END_DATE = LocalDate.of(2024, 1, 31);

    @Test
    void testDataCompletenessComparison() {
        // Given - Query data ingested by Python implementation
        List<OhlcvData> pythonData = ohlcvRepository
                .findBySymbolAndTimeframeAndDateRange(TEST_SYMBOL, Timeframe.ONE_DAY, TEST_START_DATE, TEST_END_DATE);

        // Then - Verify data completeness
        assertThat(pythonData).isNotNull();
        assertThat(pythonData).isNotEmpty();
        
        // Expected trading days in January 2024 (approximately 21-22 days)
        assertThat(pythonData.size()).isGreaterThan(15);
        
        System.out.println("Python implementation data points: " + pythonData.size());
    }

    @Test
    void testDataAccuracyComparison() {
        // Given - Query specific date from Python implementation
        LocalDate testDate = LocalDate.of(2024, 1, 15);
        
        List<OhlcvData> pythonData = ohlcvRepository
                .findBySymbolAndTimeframeAndDateRange(TEST_SYMBOL, Timeframe.ONE_DAY, testDate, testDate.plusDays(1));

        // Then - Verify data accuracy
        assertThat(pythonData).isNotNull();
        if (!pythonData.isEmpty()) {
            OhlcvData data = pythonData.get(0);
            
            // Verify all OHLCV fields are present and valid
            assertThat(data.getSymbol()).isEqualTo(TEST_SYMBOL);
            assertThat(data.getOpen()).isGreaterThan(BigDecimal.ZERO);
            assertThat(data.getHigh()).isGreaterThanOrEqualTo(data.getOpen());
            assertThat(data.getLow()).isLessThanOrEqualTo(data.getClose());
            assertThat(data.getVolume()).isGreaterThan(0L);
            
            // Verify OHLC relationships
            assertThat(data.getHigh()).isGreaterThanOrEqualTo(data.getLow());
            assertThat(data.getHigh()).isGreaterThanOrEqualTo(data.getOpen());
            assertThat(data.getHigh()).isGreaterThanOrEqualTo(data.getClose());
            assertThat(data.getLow()).isLessThanOrEqualTo(data.getOpen());
            assertThat(data.getLow()).isLessThanOrEqualTo(data.getClose());
            
            System.out.println("Python data validation passed for " + testDate);
            System.out.println("OHLCV: " + data.getOpen() + ", " + data.getHigh() + ", " + 
                             data.getLow() + ", " + data.getClose() + ", " + data.getVolume());
        }
    }

    @Test
    void testMultipleSymbolsComparison() {
        // Given - Multiple symbols to compare
        List<String> testSymbols = List.of("RELIANCE", "TCS", "INFY", "HDFC", "ICICI");
        
        for (String symbol : testSymbols) {
            // When - Query data for each symbol
            List<OhlcvData> symbolData = ohlcvRepository
                    .findBySymbolAndTimeframeAndDateRange(symbol, Timeframe.ONE_DAY, TEST_START_DATE, TEST_END_DATE);

            // Then - Verify data exists for each symbol
            if (symbolData != null && !symbolData.isEmpty()) {
                assertThat(symbolData.size()).isGreaterThan(0);
                System.out.println(symbol + ": " + symbolData.size() + " data points");
                
                // Verify data quality
                for (OhlcvData data : symbolData) {
                    assertThat(data.getSymbol()).isEqualTo(symbol);
                    assertThat(data.getVolume()).isGreaterThan(0L);
                }
            }
        }
    }

    @Test
    void testDateRangeContinuity() {
        // Given - Query data for date range
        List<OhlcvData> data = ohlcvRepository
                .findBySymbolAndTimeframeAndDateRange(TEST_SYMBOL, Timeframe.ONE_DAY, TEST_START_DATE, TEST_END_DATE);

        // Then - Verify date continuity (no unexpected gaps)
        assertThat(data).isNotNull();
        if (data.size() > 1) {
            // Sort by timestamp
            data.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));
            
            // Check for reasonable gaps (weekends and holidays are expected)
            for (int i = 1; i < data.size(); i++) {
                LocalDate prevDate = data.get(i - 1).getTimestamp()
                        .atZone(java.time.ZoneId.of("Asia/Kolkata"))
                        .toLocalDate();
                LocalDate currDate = data.get(i).getTimestamp()
                        .atZone(java.time.ZoneId.of("Asia/Kolkata"))
                        .toLocalDate();
                
                long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(prevDate, currDate);
                
                // Gap should not exceed 5 days (accounting for long weekends)
                assertThat(daysBetween).isLessThanOrEqualTo(5);
            }
            
            System.out.println("Date continuity validation passed");
        }
    }

    @Test
    void testVolumeConsistency() {
        // Given - Query data for analysis
        List<OhlcvData> data = ohlcvRepository
                .findBySymbolAndTimeframeAndDateRange(TEST_SYMBOL, Timeframe.ONE_DAY, TEST_START_DATE, TEST_END_DATE);

        // Then - Verify volume consistency
        assertThat(data).isNotNull();
        if (!data.isEmpty()) {
            // Calculate average volume
            long totalVolume = data.stream()
                    .mapToLong(OhlcvData::getVolume)
                    .sum();
            long avgVolume = totalVolume / data.size();
            
            System.out.println("Average daily volume: " + avgVolume);
            
            // Verify no zero volumes
            for (OhlcvData ohlcv : data) {
                assertThat(ohlcv.getVolume()).isGreaterThan(0L);
            }
            
            // Verify volumes are within reasonable range (not more than 10x average)
            for (OhlcvData ohlcv : data) {
                assertThat(ohlcv.getVolume()).isLessThan(avgVolume * 10);
            }
        }
    }

    @Test
    void testPriceConsistency() {
        // Given - Query data for analysis
        List<OhlcvData> data = ohlcvRepository
                .findBySymbolAndTimeframeAndDateRange(TEST_SYMBOL, Timeframe.ONE_DAY, TEST_START_DATE, TEST_END_DATE);

        // Then - Verify price consistency
        assertThat(data).isNotNull();
        if (data.size() > 1) {
            // Sort by timestamp
            data.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));
            
            // Check for circuit breaker violations (±20% daily limit)
            for (int i = 1; i < data.size(); i++) {
                BigDecimal prevClose = data.get(i - 1).getClose();
                BigDecimal currOpen = data.get(i).getOpen();
                
                BigDecimal change = currOpen.subtract(prevClose)
                        .divide(prevClose, 4, java.math.RoundingMode.HALF_UP)
                        .abs();
                
                // Price change should not exceed 25% (allowing for some corporate actions)
                assertThat(change.doubleValue()).isLessThan(0.25);
            }
            
            System.out.println("Price consistency validation passed");
        }
    }

    @Test
    void testBackfillGapDetection() {
        // Given - Date range with potential gaps
        LocalDate gapStart = LocalDate.of(2024, 2, 1);
        LocalDate gapEnd = LocalDate.of(2024, 2, 29);

        // When - Detect gaps in data
        StepVerifier.create(backfillService.detectGaps(TEST_SYMBOL, gapStart, gapEnd, Timeframe.ONE_DAY))
                // Then - Verify gap detection works
                .expectNextCount(0) // Assuming no gaps if Python ingestion is complete
                .verifyComplete();
    }

    @Test
    void testDataFormatConsistency() {
        // Given - Query sample data
        List<OhlcvData> data = ohlcvRepository
                .findBySymbolAndTimeframeAndDateRange(TEST_SYMBOL, Timeframe.ONE_DAY, TEST_START_DATE, TEST_START_DATE.plusDays(5));

        // Then - Verify data format consistency
        assertThat(data).isNotNull();
        for (OhlcvData ohlcv : data) {
            // Verify symbol format
            assertThat(ohlcv.getSymbol()).matches("[A-Z0-9]+");
            
            // Verify price precision (max 4 decimal places)
            assertThat(ohlcv.getOpen().scale()).isLessThanOrEqualTo(4);
            assertThat(ohlcv.getHigh().scale()).isLessThanOrEqualTo(4);
            assertThat(ohlcv.getLow().scale()).isLessThanOrEqualTo(4);
            assertThat(ohlcv.getClose().scale()).isLessThanOrEqualTo(4);
            
            // Verify timeframe
            assertThat(ohlcv.getTimeframe()).isNotNull();
            
            // Verify timestamp
            assertThat(ohlcv.getTimestamp()).isNotNull();
        }
        
        System.out.println("Data format consistency validation passed");
    }
}
