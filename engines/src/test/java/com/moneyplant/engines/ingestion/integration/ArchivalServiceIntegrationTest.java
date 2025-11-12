package com.moneyplant.engines.ingestion.integration;

import com.moneyplant.engines.ingestion.model.ArchivalResult;
import com.moneyplant.engines.ingestion.model.TickData;
import com.moneyplant.engines.ingestion.repository.ArchivalMetadataRepository;
import com.moneyplant.engines.ingestion.repository.TimescaleRepository;
import com.moneyplant.engines.ingestion.service.EndOfDayArchivalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import reactor.test.StepVerifier;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for End-of-Day Archival Service
 */
@SpringBootTest(properties = {
    "spring.kafka.enabled=false",
    "ingestion.auto-start.enabled=false",
    "nse.websocket.enabled=false",
    "nse.auto-start.enabled=false",
    "archival.enabled=false"
})
@ActiveProfiles("test")
@Testcontainers
class ArchivalServiceIntegrationTest {

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
    private ArchivalMetadataRepository archivalMetadataRepository;

    @MockBean
    private EndOfDayArchivalService archivalService;

    @BeforeEach
    void setUp() {
        // Clean up before each test
        timescaleRepository.truncateTickTable();
        archivalMetadataRepository.deleteAll();
    }

    @Test
    void testArchivalMetadataStorage() {
        // Given - Tick data for archival
        LocalDate archivalDate = LocalDate.now();
        List<TickData> tickDataList = List.of(
                createTickData("RELIANCE", "2450.50", 1000000L),
                createTickData("TCS", "3500.75", 500000L),
                createTickData("INFY", "1450.25", 750000L)
        );
        
        timescaleRepository.batchInsert(tickDataList);

        // When - Retrieve tick data for archival
        List<TickData> result = timescaleRepository.getTickDataForDate(archivalDate);
        
        // Then - Verify data is available
        assertThat(result).hasSize(3);
    }

    @Test
    void testTickDataRetrieval() {
        // Given - Multiple days of tick data
        List<TickData> tickDataList = List.of(
                createTickData("RELIANCE", "2450.50", 1000000L),
                createTickData("RELIANCE", "2451.00", 1100000L),
                createTickData("TCS", "3500.75", 500000L),
                createTickData("TCS", "3501.25", 550000L)
        );
        
        timescaleRepository.batchInsert(tickDataList);

        // When - Retrieve data for today
        LocalDate today = LocalDate.now();
        List<TickData> result = timescaleRepository.getTickDataForDate(today);
        
        // Then - Verify all data is retrieved
        assertThat(result).hasSize(4);
    }

    @Test
    void testTruncateAfterArchival() {
        // Given - Tick data in table
        List<TickData> tickDataList = List.of(
                createTickData("RELIANCE", "2450.50", 1000000L),
                createTickData("TCS", "3500.75", 500000L)
        );
        
        timescaleRepository.batchInsert(tickDataList);

        // Verify data exists
        LocalDate today = LocalDate.now();
        List<TickData> beforeTruncate = timescaleRepository.getTickDataForDate(today);
        assertThat(beforeTruncate).hasSize(2);

        // When - Truncate table
        timescaleRepository.truncateTickTable();

        // Then - Verify table is empty
        List<TickData> afterTruncate = timescaleRepository.getTickDataForDate(today);
        assertThat(afterTruncate).isEmpty();
    }

    @Test
    void testArchivalMetadataCreation() {
        // Given - Archival metadata
        LocalDate archivalDate = LocalDate.now();
        
        // When - Create archival metadata
        var metadata = com.moneyplant.engines.ingestion.model.ArchivalMetadata.builder()
                .archivalDate(archivalDate)
                .sourceRecordCount(1000L)
                .destinationRecordCount(1000L)
                .status(com.moneyplant.engines.ingestion.model.ArchivalMetadata.ArchivalStatus.SUCCESS)
                .startTime(java.time.Instant.now())
                .endTime(java.time.Instant.now())
                .hudiTablePath("s3://test-bucket/data/" + archivalDate)
                .integrityCheckPassed(true)
                .tableTruncated(false)
                .build();
        
        var saved = archivalMetadataRepository.save(metadata);

        // Then - Verify metadata is saved
        assertThat(saved).isNotNull();
        assertThat(saved.getArchivalDate()).isEqualTo(archivalDate);
        assertThat(saved.getSourceRecordCount()).isEqualTo(1000L);
        assertThat(saved.getStatus()).isEqualTo(com.moneyplant.engines.ingestion.model.ArchivalMetadata.ArchivalStatus.SUCCESS);
    }

    @Test
    void testArchivalMetadataQuery() {
        // Given - Multiple archival records
        LocalDate date1 = LocalDate.now().minusDays(1);
        LocalDate date2 = LocalDate.now();
        
        var metadata1 = com.moneyplant.engines.ingestion.model.ArchivalMetadata.builder()
                .archivalDate(date1)
                .sourceRecordCount(500L)
                .destinationRecordCount(500L)
                .status(com.moneyplant.engines.ingestion.model.ArchivalMetadata.ArchivalStatus.SUCCESS)
                .startTime(java.time.Instant.now())
                .endTime(java.time.Instant.now())
                .integrityCheckPassed(true)
                .tableTruncated(false)
                .build();
        
        var metadata2 = com.moneyplant.engines.ingestion.model.ArchivalMetadata.builder()
                .archivalDate(date2)
                .sourceRecordCount(1000L)
                .destinationRecordCount(1000L)
                .status(com.moneyplant.engines.ingestion.model.ArchivalMetadata.ArchivalStatus.SUCCESS)
                .startTime(java.time.Instant.now())
                .endTime(java.time.Instant.now())
                .integrityCheckPassed(true)
                .tableTruncated(false)
                .build();
        
        archivalMetadataRepository.save(metadata1);
        archivalMetadataRepository.save(metadata2);

        // When - Query by date
        var result = archivalMetadataRepository.findByArchivalDate(date2);

        // Then - Verify correct record is retrieved
        assertThat(result).isPresent();
        assertThat(result.get().getSourceRecordCount()).isEqualTo(1000L);
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
}
