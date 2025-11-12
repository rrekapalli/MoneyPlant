package com.moneyplant.engines.ingestion.integration;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import com.moneyplant.engines.ingestion.repository.OhlcvRepository;
import com.moneyplant.engines.ingestion.repository.TimescaleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for TimescaleDB operations using Testcontainers
 */
@SpringBootTest(properties = {
    "spring.kafka.enabled=false",
    "ingestion.auto-start.enabled=false",
    "nse.websocket.enabled=false",
    "nse.auto-start.enabled=false"
})
@ActiveProfiles("test")
@Testcontainers
class TimescaleDbIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("timescale/timescaledb:latest-pg15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("test-schema.sql");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TimescaleRepository timescaleRepository;

    @Autowired
    private OhlcvRepository ohlcvRepository;

    @BeforeEach
    void setUp() {
        // Clean up before each test
        timescaleRepository.truncateTickTable();
    }

    @Test
    void testSaveTickData() {
        // Given
        TickData tickData = TickData.builder()
                .symbol("RELIANCE")
                .timestamp(Instant.now())
                .price(new BigDecimal("2450.50"))
                .volume(1000000L)
                .bid(new BigDecimal("2450.00"))
                .ask(new BigDecimal("2451.00"))
                .build();

        // When
        int result = timescaleRepository.save(tickData);

        // Then
        assertThat(result).isEqualTo(1);
    }

    @Test
    void testBatchInsertTickData() {
        // Given
        List<TickData> tickDataList = List.of(
                createTickData("RELIANCE", "2450.50", 1000000L),
                createTickData("TCS", "3500.75", 500000L),
                createTickData("INFY", "1450.25", 750000L)
        );

        // When
        int[] results = timescaleRepository.batchInsert(tickDataList);

        // Then
        assertThat(results.length).isEqualTo(3);
    }

    @Test
    void testGetTickDataForDate() {
        // Given
        LocalDate today = LocalDate.now();
        List<TickData> tickDataList = List.of(
                createTickData("RELIANCE", "2450.50", 1000000L),
                createTickData("RELIANCE", "2451.00", 1100000L),
                createTickData("TCS", "3500.75", 500000L)
        );
        
        timescaleRepository.batchInsert(tickDataList);

        // When
        List<TickData> result = timescaleRepository.getTickDataForDate(today);

        // Then
        assertThat(result).hasSize(3);
    }

    @Test
    void testSaveOhlcvData() {
        // Given
        OhlcvData ohlcvData = OhlcvData.builder()
                .symbol("RELIANCE")
                .timestamp(Instant.now())
                .timeframe(Timeframe.ONE_DAY)
                .open(new BigDecimal("2450.00"))
                .high(new BigDecimal("2460.00"))
                .low(new BigDecimal("2445.00"))
                .close(new BigDecimal("2455.00"))
                .volume(5000000L)
                .build();

        // When
        int result = ohlcvRepository.save(ohlcvData);

        // Then
        assertThat(result).isEqualTo(1);
    }

    @Test
    void testBatchInsertOhlcvData() {
        // Given
        List<OhlcvData> ohlcvDataList = List.of(
                createOhlcvData("RELIANCE", "2450.00", "2460.00", "2445.00", "2455.00"),
                createOhlcvData("TCS", "3500.00", "3510.00", "3495.00", "3505.00"),
                createOhlcvData("INFY", "1450.00", "1455.00", "1448.00", "1452.00")
        );

        // When
        int[] results = ohlcvRepository.batchInsert(ohlcvDataList);

        // Then
        assertThat(results.length).isEqualTo(3);
    }

    @Test
    void testQueryOhlcvDataWithDateRange() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now().plusDays(1);
        
        List<OhlcvData> ohlcvDataList = List.of(
                createOhlcvData("RELIANCE", "2450.00", "2460.00", "2445.00", "2455.00"),
                createOhlcvData("RELIANCE", "2455.00", "2465.00", "2450.00", "2460.00")
        );
        
        ohlcvRepository.batchInsert(ohlcvDataList);

        // When
        List<OhlcvData> result = ohlcvRepository.findBySymbolAndTimeframeAndDateRange(
                "RELIANCE", Timeframe.ONE_DAY, startDate, endDate);

        // Then
        assertThat(result).hasSize(2);
    }

    @Test
    void testTruncateTickTable() {
        // Given
        List<TickData> tickDataList = List.of(
                createTickData("RELIANCE", "2450.50", 1000000L),
                createTickData("TCS", "3500.75", 500000L)
        );
        
        timescaleRepository.batchInsert(tickDataList);

        // When
        timescaleRepository.truncateTickTable();

        // Verify table is empty
        LocalDate today = LocalDate.now();
        List<TickData> result = timescaleRepository.getTickDataForDate(today);
        assertThat(result).isEmpty();
    }

    private TickData createTickData(String symbol, String price, Long volume) {
        return TickData.builder()
                .symbol(symbol)
                .timestamp(Instant.now())
                .price(new BigDecimal(price))
                .volume(volume)
                .bid(new BigDecimal(price).subtract(new BigDecimal("0.50")))
                .ask(new BigDecimal(price).add(new BigDecimal("0.50")))
                .build();
    }

    private OhlcvData createOhlcvData(String symbol, String open, String high, String low, String close) {
        return OhlcvData.builder()
                .symbol(symbol)
                .timestamp(Instant.now())
                .timeframe(Timeframe.ONE_DAY)
                .open(new BigDecimal(open))
                .high(new BigDecimal(high))
                .low(new BigDecimal(low))
                .close(new BigDecimal(close))
                .volume(5000000L)
                .build();
    }
}
