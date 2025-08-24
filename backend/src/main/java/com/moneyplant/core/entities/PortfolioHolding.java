package com.moneyplant.core.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "portfolio_holdings", schema = "public")
public class PortfolioHolding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "symbol", nullable = false)
    private NseEquityMaster symbol;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "quantity", nullable = false, precision = 20, scale = 6)
    private BigDecimal quantity;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "avg_cost", nullable = false, precision = 20, scale = 6)
    private BigDecimal avgCost;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "realized_pnl", nullable = false, precision = 20, scale = 6)
    private BigDecimal realizedPnl;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "last_updated", nullable = false)
    private OffsetDateTime lastUpdated;

}