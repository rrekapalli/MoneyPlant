package com.moneyplant.engines.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Backtest result entity for storing strategy backtesting results
 */
@Entity
@Table(name = "backtest_results", indexes = {
    @Index(name = "idx_strategy_id", columnList = "strategy_id"),
    @Index(name = "idx_symbol", columnList = "symbol"),
    @Index(name = "idx_start_date", columnList = "start_date"),
    @Index(name = "idx_end_date", columnList = "end_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BacktestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "strategy_id", nullable = false)
    private Long strategyId;

    @Column(name = "strategy_name", length = 100)
    private String strategyName;

    @Column(name = "symbol", length = 20)
    private String symbol;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "initial_capital", precision = 19, scale = 2)
    private BigDecimal initialCapital;

    @Column(name = "final_capital", precision = 19, scale = 2)
    private BigDecimal finalCapital;

    @Column(name = "total_return", precision = 19, scale = 4)
    private BigDecimal totalReturn;

    @Column(name = "annualized_return", precision = 19, scale = 4)
    private BigDecimal annualizedReturn;

    @Column(name = "sharpe_ratio", precision = 19, scale = 4)
    private BigDecimal sharpeRatio;

    @Column(name = "max_drawdown", precision = 19, scale = 4)
    private BigDecimal maxDrawdown;

    @Column(name = "win_rate", precision = 19, scale = 4)
    private BigDecimal winRate;

    @Column(name = "total_trades")
    private Integer totalTrades;

    @Column(name = "winning_trades")
    private Integer winningTrades;

    @Column(name = "losing_trades")
    private Integer losingTrades;

    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
