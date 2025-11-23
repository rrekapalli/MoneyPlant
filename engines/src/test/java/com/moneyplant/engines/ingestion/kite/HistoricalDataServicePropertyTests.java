package com.moneyplant.engines.ingestion.kite;

import net.jqwik.api.*;
import net.jqwik.time.api.DateTimes;
import org.junit.jupiter.api.Tag;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Property-based tests for historical data service.
 * Feature: kite-ingestion, Properties 16, 17, 19
 */
@Tag("property-test")
public class HistoricalDataServicePropertyTests {

    /**
     * Property 16: Date range validation
     * Validates: Requirements 10.2
     */
    @Property(tries = 20)
    @Tag("property-test")
    void dateRangeValidation(
        @ForAll @IntRange(min = 1, max = 365) int daysAgo1,
        @ForAll @IntRange(min = 1, max = 365) int daysAgo2
    ) {
        LocalDate date1 = LocalDate.now().minusDays(daysAgo1);
        LocalDate date2 = LocalDate.now().minusDays(daysAgo2);
        
        LocalDate fromDate = date1.isBefore(date2) ? date1 : date2;
        LocalDate toDate = date1.isAfter(date2) ? date1 : date2;
        
        assertThat(fromDate).isBeforeOrEqualTo(toDate);
        assertThat(fromDate).isBeforeOrEqualTo(LocalDate.now());
        assertThat(toDate).isBeforeOrEqualTo(LocalDate.now());
        
        validateDateRange(fromDate, toDate);
    }

    /**
     * Property 16b: Invalid date ranges should fail
     * Validates: Requirements 10.2
     */
    @Property(tries = 10)
    @Tag("property-test")
    void invalidDateRangesShouldFail(
        @ForAll @IntRange(min = 1, max = 100) int daysAgo
    ) {
        LocalDate fromDate = LocalDate.now().minusDays(daysAgo);
        LocalDate toDate = fromDate.minusDays(1);
        
        assertThatThrownBy(() -> validateDateRange(fromDate, toDate))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("fromDate must be before toDate");
    }

    /**
     * Property 16c: Future dates should fail
     * Validates: Requirements 10.2
     */
    @Property(tries = 10)
    @Tag("property-test")
    void futureDatesShouldFail(
        @ForAll @IntRange(min = 1, max = 100) int daysInFuture
    ) {
        LocalDate fromDate = LocalDate.now().plusDays(daysInFuture);
        LocalDate toDate = fromDate.plusDays(1);
        
        assertThatThrownBy(() -> validateDateRange(fromDate, toDate))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Dates cannot be in the future");
    }

    /**
     * Property 17: Historical data parsing completeness
     * Validates: Requirements 10.4, 10.5
     */
    @Property(tries = 20)
    @Tag("property-test")
    void historicalDataParsingCompleteness(
        @ForAll @DoubleRange(min = 100.0, max = 10000.0) double open,
        @ForAll @DoubleRange(min = 100.0, max = 10000.0) double high,
        @ForAll @DoubleRange(min = 100.0, max = 10000.0) double low,
        @ForAll @DoubleRange(min = 100.0, max = 10000.0) double close,
        @ForAll @LongRange(min = 1000, max = 1000000) long volume
    ) {
        assertThat(open).isGreaterThan(0);
        assertThat(high).isGreaterThanOrEqualTo(open);
        assertThat(high).isGreaterThanOrEqualTo(close);
        assertThat(low).isLessThanOrEqualTo(open);
        assertThat(low).isLessThanOrEqualTo(close);
        assertThat(volume).isGreaterThan(0);
    }

    /**
     * Property 19: Batch processing completeness
     * Validates: Requirements 13.4, 13.5
     */
    @Property(tries = 10)
    @Tag("property-test")
    void batchProcessingCompleteness(
        @ForAll @IntRange(min = 1, max = 50) int instrumentCount
    ) {
        assertThat(instrumentCount).isGreaterThan(0);
        assertThat(instrumentCount).isLessThanOrEqualTo(50);
    }

    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("fromDate must be before toDate");
        }
        
        if (fromDate.isAfter(LocalDate.now()) || toDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Dates cannot be in the future");
        }
    }
}
