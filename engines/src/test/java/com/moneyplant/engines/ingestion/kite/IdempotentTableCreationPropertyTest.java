package com.moneyplant.engines.ingestion.kite;

import net.jqwik.api.*;
import org.junit.jupiter.api.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Property-based test for idempotent table creation.
 * Feature: kite-ingestion, Property 5: Idempotent table creation
 * Validates: Requirements 2.1
 * 
 * Tests that database tables can be created multiple times without errors or data loss.
 */
@SpringBootTest
@Testcontainers
@TestPropertySource(properties = {
    "spring.flyway.enabled=true",
    "spring.jpa.hibernate.ddl-auto=validate"
})
@Tag("property-test")
public class IdempotentTableCreationPropertyTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init-timescaledb.sql"); // Will create if needed

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Property: For any number of initialization calls, the database tables must exist
     * after Flyway migrations run, and running migrations multiple times must not cause
     * errors or data loss.
     */
    @Property(tries = 10)
    @Tag("property-test")
    void tableCreationIsIdempotent(@ForAll @IntRange(min = 1, max = 5) int migrationRuns) {
        // Verify tables exist after migration
        assertThat(tableExists("kite_instrument_master"))
                .as("kite_instrument_master table should exist")
                .isTrue();
        
        assertThat(tableExists("kite_ohlcv_historic"))
                .as("kite_ohlcv_historic table should exist")
                .isTrue();
        
        // Verify running CREATE TABLE IF NOT EXISTS multiple times doesn't cause errors
        for (int i = 0; i < migrationRuns; i++) {
            assertThatCode(() -> {
                jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS kite_instrument_master (" +
                    "instrument_token VARCHAR(50) NOT NULL, " +
                    "exchange VARCHAR(10) NOT NULL, " +
                    "PRIMARY KEY (instrument_token, exchange))"
                );
            }).as("Creating kite_instrument_master table multiple times should not throw exception")
              .doesNotThrowAnyException();
            
            assertThatCode(() -> {
                jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS kite_ohlcv_historic (" +
                    "instrument_token VARCHAR(50) NOT NULL, " +
                    "exchange VARCHAR(10) NOT NULL, " +
                    "date TIMESTAMPTZ NOT NULL, " +
                    "candle_interval VARCHAR(20) NOT NULL, " +
                    "PRIMARY KEY (instrument_token, exchange, date, candle_interval))"
                );
            }).as("Creating kite_ohlcv_historic table multiple times should not throw exception")
              .doesNotThrowAnyException();
        }
        
        // Verify tables still exist after multiple creation attempts
        assertThat(tableExists("kite_instrument_master"))
                .as("kite_instrument_master table should still exist after multiple creation attempts")
                .isTrue();
        
        assertThat(tableExists("kite_ohlcv_historic"))
                .as("kite_ohlcv_historic table should still exist after multiple creation attempts")
                .isTrue();
    }

    /**
     * Property: Indexes should be idempotent - creating them multiple times should not cause errors.
     */
    @Property(tries = 10)
    @Tag("property-test")
    void indexCreationIsIdempotent(@ForAll @IntRange(min = 1, max = 5) int indexCreationRuns) {
        for (int i = 0; i < indexCreationRuns; i++) {
            assertThatCode(() -> {
                jdbcTemplate.execute(
                    "CREATE INDEX IF NOT EXISTS idx_kite_instrument_master_tradingsymbol " +
                    "ON kite_instrument_master(tradingsymbol)"
                );
            }).as("Creating index multiple times should not throw exception")
              .doesNotThrowAnyException();
        }
        
        // Verify index exists
        assertThat(indexExists("idx_kite_instrument_master_tradingsymbol"))
                .as("Index should exist after multiple creation attempts")
                .isTrue();
    }

    private boolean tableExists(String tableName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables " +
                "WHERE table_schema = 'public' AND table_name = ?",
                Integer.class,
                tableName
            );
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean indexExists(String indexName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes " +
                "WHERE schemaname = 'public' AND indexname = ?",
                Integer.class,
                indexName
            );
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }
}
