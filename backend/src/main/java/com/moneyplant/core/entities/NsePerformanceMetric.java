package com.moneyplant.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "nse_performance_metrics", schema = "public")
public class NsePerformanceMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ColumnDefault("CURRENT_DATE")
    @Column(name = "execution_date")
    private LocalDate executionDate;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "total_symbols")
    private Integer totalSymbols;

    @Column(name = "processed_symbols")
    private Integer processedSymbols;

    @Column(name = "successful_fetches")
    private Integer successfulFetches;

    @Column(name = "failed_fetches")
    private Integer failedFetches;

    @Column(name = "total_records")
    private Long totalRecords;

    @Column(name = "execution_time_seconds")
    private Double executionTimeSeconds;

    @Column(name = "symbols_per_minute")
    private Double symbolsPerMinute;

    @Column(name = "records_per_minute")
    private Double recordsPerMinute;

    @Column(name = "success_rate")
    private Double successRate;

    @Column(name = "system_resources")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> systemResources;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

}