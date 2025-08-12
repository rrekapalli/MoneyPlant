package com.moneyplant.backtest.entities;

import com.moneyplant.core.entities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing the results of a strategy backtest.
 */
@Entity
@Table(name = "backtest_results")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BacktestResult extends BaseEntity {
    
    @Column(nullable = false)
    private String strategyName;
    
    @Column(nullable = false)
    private LocalDateTime startDate;
    
    @Column(nullable = false)
    private LocalDateTime endDate;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal totalReturn;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal annualizedReturn;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal sharpeRatio;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal maxDrawdown;
    
    @Column
    private Integer totalTrades;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal winRate;
    
    @Column(length = 1000)
    private String notes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BacktestStatus status;
    
    public enum BacktestStatus {
        RUNNING, COMPLETED, FAILED, CANCELLED
    }
}
