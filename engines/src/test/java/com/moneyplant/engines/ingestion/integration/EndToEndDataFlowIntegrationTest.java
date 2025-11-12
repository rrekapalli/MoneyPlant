package com.moneyplant.engines.ingestion.integration;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import com.moneyplant.engines.ingestion.processor.DataNormalizer;
import com.moneyplant.engines.ingestion.processor.DataValidator;
import com.moneyplant.engines.ingestion.publisher.KafkaPublisher;
import com.moneyplant.engines.ingestion.repository.OhlcvRepository;
import com.moneyplant.engines.ingestion.repository.TimescaleRepository;
import com.moneyplant.engines.ingestion.service.IngestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end integration tests for complete data flow:
 * Provider → Validator → Normalizer → Publisher → Storage
 */
@SpringBootTest(properties = {
    "spring.kafka.enabled=true",
    "ingestion.auto-start.enabled=false",
    "nse.websocket.enabled=false",
    "nse.auto-start.enabled=false"
})
@ActiveProfiles("test")
@Testcontainers
class EndToEndDataFlowIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("timescale/timescaledb:latest-pg15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("test-schema.sql");

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"))
            .withEmbeddedZookeeper();

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // PostgreSQL
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        
        // Kafka
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("spring.kafka.producer.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired
    private IngestionService ingestionService;

    @Autowired
    private DataValidator dataValidator;

    @Autowired
    private DataNormalizer dataNormalizer;

    @Autowired
    private KafkaPublisher kafkaPublisher;

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
    void testCompleteTickDataFlow() {
        // Given - Raw tick data
        TickData rawTickData = TickData.builder()
                .symbol("RELIANCE")
                .timestamp(Instant.now())
                .price(new BigDecimal("2450.50"))
                .volume(1000000L)
                .bid(new BigDecimal("2450.00"))
                .ask(new BigDecimal("2451.00"))
                .build();

        // When - Process through complete pipeline
        Mono<TickData> pipeline = Mono.just(rawTickData)
                .filter(tick -> dataValidator.validatePrice(tick.getPrice(), tick.getSymbol()))
                .filter(tick -> dataValidator.validateVolume(tick.getVolume()))
                .map(tick -> dataNormalizer.normalizeTickData(tick))
                .flatMap(tick -> kafkaPublisher.publishTick(tick).thenReturn(tick))
                .map(tick -> {
                    timescaleRepository.save(tick);
                    return tick;
                });

        // Then - Verify data flows through all stages
        StepVerifier.create(pipeline)
                .assertNext(savedTick -> {
                    assertThat(savedTick.getSymbol()).isEqualTo("RELIANCE");
                    assertThat(savedTick.getPrice()).isEqualByComparingTo(new BigDecimal("2450.50"));
                    assertThat(savedTick.getVolume()).isEqualTo(1000000L);
                })
                .verifyComplete();

        // Verify data is persisted in database
        LocalDate today = LocalDate.now();
        List<TickData> result = timescaleRepository.getTickDataForDate(today);
        assertThat(result).hasSize(1);
    }

    @Test
    void testCompleteOhlcvDataFlow() {
        // Given - Raw OHLCV data
        OhlcvData rawOhlcvData = OhlcvData.builder()
                .symbol("TCS")
                .timestamp(Instant.now())
                .timeframe(Timeframe.ONE_DAY)
                .open(new BigDecimal("3500.00"))
                .high(new BigDecimal("3510.00"))
                .low(new BigDecimal("3495.00"))
                .close(new BigDecimal("3505.00"))
                .volume(5000000L)
                .build();

        // When - Process through complete pipeline
        Mono<OhlcvData> pipeline = Mono.just(rawOhlcvData)
                .filter(ohlcv -> dataValidator.validateVolume(ohlcv.getVolume()))
                .map(ohlcv -> dataNormalizer.normalizeOhlcvData(ohlcv))
                .flatMap(ohlcv -> kafkaPublisher.publishCandle(ohlcv).thenReturn(ohlcv))
                .map(ohlcv -> {
                    ohlcvRepository.save(ohlcv);
                    return ohlcv;
                });

        // Then - Verify data flows through all stages
        StepVerifier.create(pipeline)
                .assertNext(savedOhlcv -> {
                    assertThat(savedOhlcv.getSymbol()).isEqualTo("TCS");
                    assertThat(savedOhlcv.getClose()).isEqualByComparingTo(new BigDecimal("3505.00"));
                    assertThat(savedOhlcv.getVolume()).isEqualTo(5000000L);
                })
                .verifyComplete();
    }

    @Test
    void testBatchDataProcessing() {
        // Given - Multiple tick data points
        List<TickData> tickDataList = List.of(
                createTickData("RELIANCE", "2450.50", 1000000L),
                createTickData("TCS", "3500.75", 500000L),
                createTickData("INFY", "1450.25", 750000L),
                createTickData("HDFC", "1650.00", 600000L),
                createTickData("ICICI", "950.50", 800000L)
        );

        // When - Process batch through pipeline
        Flux<TickData> pipeline = Flux.fromIterable(tickDataList)
                .filter(tick -> dataValidator.validateVolume(tick.getVolume()))
                .map(tick -> dataNormalizer.normalizeTickData(tick))
                .flatMap(tick -> kafkaPublisher.publishTick(tick).thenReturn(tick))
                .collectList()
                .flatMapMany(ticks -> {
                    timescaleRepository.batchInsert(ticks);
                    return Flux.fromIterable(ticks);
                });

        // Then - Verify all data is processed
        StepVerifier.create(pipeline)
                .expectNextCount(5)
                .verifyComplete();

        // Verify all data is persisted
        LocalDate today = LocalDate.now();
        List<TickData> result = timescaleRepository.getTickDataForDate(today);
        assertThat(result).hasSize(5);
    }

    @Test
    void testDataValidationInPipeline() {
        // Given - Invalid tick data (negative volume)
        TickData invalidTickData = TickData.builder()
                .symbol("INVALID")
                .timestamp(Instant.now())
                .price(new BigDecimal("100.00"))
                .volume(-1000L)  // Invalid negative volume
                .build();

        // When - Process through pipeline with validation
        Mono<TickData> pipeline = Mono.just(invalidTickData)
                .filter(tick -> dataValidator.validateVolume(tick.getVolume()))
                .map(tick -> {
                    timescaleRepository.save(tick);
                    return tick;
                });

        // Then - Verify invalid data is filtered out
        StepVerifier.create(pipeline)
                .expectNextCount(0)
                .verifyComplete();

        // Verify no data is persisted
        LocalDate today = LocalDate.now();
        List<TickData> result = timescaleRepository.getTickDataForDate(today);
        assertThat(result).isEmpty();
    }

    @Test
    void testHistoricalDataBackfill() {
        // Given - Historical OHLCV data for backfill
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now().plusDays(1);
        String symbol = "RELIANCE";

        List<OhlcvData> historicalData = List.of(
                createOhlcvData(symbol, "2450.00", "2460.00", "2445.00", "2455.00"),
                createOhlcvData(symbol, "2455.00", "2465.00", "2450.00", "2460.00"),
                createOhlcvData(symbol, "2460.00", "2470.00", "2455.00", "2465.00")
        );

        // When - Backfill historical data
        Mono<Integer> backfillResult = Flux.fromIterable(historicalData)
                .map(ohlcv -> dataNormalizer.normalizeOhlcvData(ohlcv))
                .collectList()
                .map(ohlcvList -> {
                    int[] results = ohlcvRepository.batchInsert(ohlcvList);
                    return results.length;
                });

        // Then - Verify backfill completes successfully
        StepVerifier.create(backfillResult)
                .expectNext(3)
                .verifyComplete();

        // Verify data can be queried
        List<OhlcvData> result = ohlcvRepository.findBySymbolAndTimeframeAndDateRange(
                symbol, Timeframe.ONE_DAY, startDate, endDate);
        assertThat(result).hasSize(3);
    }

    @Test
    void testConcurrentDataProcessing() {
        // Given - Multiple symbols with concurrent data
        List<TickData> concurrentData = List.of(
                createTickData("SYM1", "100.00", 1000L),
                createTickData("SYM2", "200.00", 2000L),
                createTickData("SYM3", "300.00", 3000L),
                createTickData("SYM4", "400.00", 4000L),
                createTickData("SYM5", "500.00", 5000L)
        );

        // When - Process concurrently
        Flux<TickData> pipeline = Flux.fromIterable(concurrentData)
                .parallel()
                .runOn(reactor.core.scheduler.Schedulers.parallel())
                .map(tick -> dataNormalizer.normalizeTickData(tick))
                .flatMap(tick -> kafkaPublisher.publishTick(tick).thenReturn(tick))
                .sequential()
                .collectList()
                .flatMapMany(ticks -> {
                    timescaleRepository.batchInsert(ticks);
                    return Flux.fromIterable(ticks);
                });

        // Then - Verify all data is processed
        StepVerifier.create(pipeline)
                .expectNextCount(5)
                .verifyComplete();
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
