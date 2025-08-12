package com.moneyplant.engines.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Portfolio entity for managing trading portfolios
 */
@Entity
@Table(name = "portfolios", indexes = {
    @Index(name = "idx_name", columnList = "name"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "initial_capital", precision = 19, scale = 2, nullable = false)
    private BigDecimal initialCapital;

    @Column(name = "current_capital", precision = 19, scale = 2)
    private BigDecimal currentCapital;

    @Column(name = "total_pnl", precision = 19, scale = 2)
    private BigDecimal totalPnL;

    @Column(name = "total_return", precision = 19, scale = 4)
    private BigDecimal totalReturn;

    @Column(name = "status", length = 20)
    private String status; // ACTIVE, INACTIVE, CLOSED

    @Column(name = "risk_tolerance", length = 20)
    private String riskTolerance; // LOW, MEDIUM, HIGH

    @Column(name = "max_position_size", precision = 19, scale = 4)
    private BigDecimal maxPositionSize;

    @Column(name = "stop_loss_percentage", precision = 19, scale = 4)
    private BigDecimal stopLossPercentage;

    @Column(name = "take_profit_percentage", precision = 19, scale = 4)
    private BigDecimal takeProfitPercentage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
