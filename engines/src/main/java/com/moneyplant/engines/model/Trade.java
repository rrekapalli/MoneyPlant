package com.moneyplant.engines.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Trade entity for storing trading transactions
 */
@Entity
@Table(name = "trades", indexes = {
    @Index(name = "idx_strategy_id", columnList = "strategy_id"),
    @Index(name = "idx_symbol", columnList = "symbol"),
    @Index(name = "idx_trade_date", columnList = "trade_date"),
    @Index(name = "idx_trade_type", columnList = "trade_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "strategy_id")
    private Long strategyId;

    @Column(name = "symbol", nullable = false, length = 20)
    private String symbol;

    @Column(name = "trade_date", nullable = false)
    private LocalDateTime tradeDate;

    @Column(name = "trade_type", nullable = false, length = 10)
    private String tradeType; // BUY, SELL

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "price", precision = 19, scale = 4, nullable = false)
    private BigDecimal price;

    @Column(name = "commission", precision = 19, scale = 4)
    private BigDecimal commission;

    @Column(name = "slippage", precision = 19, scale = 4)
    private BigDecimal slippage;

    @Column(name = "total_amount", precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Column(name = "backtest_id")
    private Long backtestId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
