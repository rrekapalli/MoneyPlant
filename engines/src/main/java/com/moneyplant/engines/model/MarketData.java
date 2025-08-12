package com.moneyplant.engines.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Market data entity for storing financial instrument data
 */
@Entity
@Table(name = "market_data", indexes = {
    @Index(name = "idx_symbol_timestamp", columnList = "symbol, timestamp"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_symbol", columnList = "symbol")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "symbol", nullable = false, length = 20)
    private String symbol;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "open_price", precision = 19, scale = 4)
    private BigDecimal openPrice;

    @Column(name = "high_price", precision = 19, scale = 4)
    private BigDecimal highPrice;

    @Column(name = "low_price", precision = 19, scale = 4)
    private BigDecimal lowPrice;

    @Column(name = "close_price", precision = 19, scale = 4)
    private BigDecimal closePrice;

    @Column(name = "volume")
    private Long volume;

    @Column(name = "adjusted_close", precision = 19, scale = 4)
    private BigDecimal adjustedClose;

    @Column(name = "data_source", length = 50)
    private String dataSource;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
