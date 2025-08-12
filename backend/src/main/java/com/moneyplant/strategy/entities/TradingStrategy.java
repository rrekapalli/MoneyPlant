package com.moneyplant.strategy.entities;

import com.moneyplant.core.entities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a trading strategy.
 */
@Entity
@Table(name = "trading_strategies")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradingStrategy extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StrategyType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StrategyStatus status;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal riskLevel;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal expectedReturn;
    
    @Column
    private LocalDateTime lastExecuted;
    
    @Column
    private Boolean isActive;
    
    public enum StrategyType {
        MOMENTUM, MEAN_REVERSION, ARBITRAGE, TREND_FOLLOWING, SCALPING
    }
    
    public enum StrategyStatus {
        DRAFT, ACTIVE, PAUSED, ARCHIVED
    }
}
