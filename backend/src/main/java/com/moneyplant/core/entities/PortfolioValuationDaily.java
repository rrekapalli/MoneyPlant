package com.moneyplant.core.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "portfolio_valuation_daily", schema = "public")
public class PortfolioValuationDaily {
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
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_market_value", nullable = false, precision = 20, scale = 6)
    private BigDecimal totalMarketValue;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "total_cost_basis", nullable = false, precision = 20, scale = 6)
    private BigDecimal totalCostBasis;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "cash_balance", nullable = false, precision = 20, scale = 6)
    private BigDecimal cashBalance;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "net_invested", nullable = false, precision = 20, scale = 6)
    private BigDecimal netInvested;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "pnl_daily", nullable = false, precision = 20, scale = 6)
    private BigDecimal pnlDaily;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "pnl_total", nullable = false, precision = 20, scale = 6)
    private BigDecimal pnlTotal;

    @Column(name = "return_daily_pct", precision = 12, scale = 6)
    private BigDecimal returnDailyPct;

    @Column(name = "return_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal returnCumulativePct;

    @Column(name = "twr_daily_pct", precision = 12, scale = 6)
    private BigDecimal twrDailyPct;

    @Column(name = "twr_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal twrCumulativePct;

    @Column(name = "mwr_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal mwrCumulativePct;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

}