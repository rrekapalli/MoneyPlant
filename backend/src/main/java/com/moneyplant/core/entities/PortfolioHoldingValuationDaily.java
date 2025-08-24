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
@Table(name = "portfolio_holding_valuation_daily", schema = "public")
public class PortfolioHoldingValuationDaily {
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
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "quantity", nullable = false, precision = 20, scale = 6)
    private BigDecimal quantity;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "market_price", nullable = false, precision = 20, scale = 6)
    private BigDecimal marketPrice;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "market_value", nullable = false, precision = 20, scale = 6)
    private BigDecimal marketValue;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "cost_basis", nullable = false, precision = 20, scale = 6)
    private BigDecimal costBasis;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "pnl_daily", nullable = false, precision = 20, scale = 6)
    private BigDecimal pnlDaily;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "pnl_total", nullable = false, precision = 20, scale = 6)
    private BigDecimal pnlTotal;

    @Column(name = "weight_pct", precision = 10, scale = 6)
    private BigDecimal weightPct;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

}