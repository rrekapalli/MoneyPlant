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
@Table(name = "portfolio_metrics_daily", schema = "public")
public class PortfolioMetricsDaily {
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

    @Column(name = "nav", precision = 20, scale = 8)
    private BigDecimal nav;

    @Column(name = "twr_daily_pct", precision = 12, scale = 6)
    private BigDecimal twrDailyPct;

    @Column(name = "twr_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal twrCumulativePct;

    @Column(name = "mwr_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal mwrCumulativePct;

    @Column(name = "irr_to_date_pct", precision = 12, scale = 6)
    private BigDecimal irrToDatePct;

    @Column(name = "irr_annualized_pct", precision = 12, scale = 6)
    private BigDecimal irrAnnualizedPct;

    @Column(name = "xirr_to_date_pct", precision = 12, scale = 6)
    private BigDecimal xirrToDatePct;

    @Column(name = "xirr_annualized_pct", precision = 12, scale = 6)
    private BigDecimal xirrAnnualizedPct;

    @Column(name = "cagr_pct", precision = 12, scale = 6)
    private BigDecimal cagrPct;

    @Column(name = "ytd_return_pct", precision = 12, scale = 6)
    private BigDecimal ytdReturnPct;

    @Column(name = "return_1m_pct", precision = 12, scale = 6)
    private BigDecimal return1mPct;

    @Column(name = "return_3m_pct", precision = 12, scale = 6)
    private BigDecimal return3mPct;

    @Column(name = "return_6m_pct", precision = 12, scale = 6)
    private BigDecimal return6mPct;

    @Column(name = "return_1y_pct", precision = 12, scale = 6)
    private BigDecimal return1yPct;

    @Column(name = "return_3y_annualized_pct", precision = 12, scale = 6)
    private BigDecimal return3yAnnualizedPct;

    @Column(name = "return_5y_annualized_pct", precision = 12, scale = 6)
    private BigDecimal return5yAnnualizedPct;

    @Column(name = "drawdown_pct", precision = 12, scale = 6)
    private BigDecimal drawdownPct;

    @Column(name = "max_drawdown_pct", precision = 12, scale = 6)
    private BigDecimal maxDrawdownPct;

    @Column(name = "volatility_30d_pct", precision = 12, scale = 6)
    private BigDecimal volatility30dPct;

    @Column(name = "volatility_90d_pct", precision = 12, scale = 6)
    private BigDecimal volatility90dPct;

    @Column(name = "downside_deviation_30d_pct", precision = 12, scale = 6)
    private BigDecimal downsideDeviation30dPct;

    @Column(name = "sharpe_30d", precision = 14, scale = 6)
    private BigDecimal sharpe30d;

    @Column(name = "sortino_30d", precision = 14, scale = 6)
    private BigDecimal sortino30d;

    @Column(name = "calmar_1y", precision = 14, scale = 6)
    private BigDecimal calmar1y;

    @Column(name = "treynor_30d", precision = 14, scale = 6)
    private BigDecimal treynor30d;

    @Column(name = "beta_30d", precision = 14, scale = 6)
    private BigDecimal beta30d;

    @Column(name = "alpha_30d", precision = 14, scale = 6)
    private BigDecimal alpha30d;

    @Column(name = "tracking_error_30d", precision = 14, scale = 6)
    private BigDecimal trackingError30d;

    @Column(name = "information_ratio_30d", precision = 14, scale = 6)
    private BigDecimal informationRatio30d;

    @Column(name = "var_95_30d", precision = 20, scale = 6)
    private BigDecimal var9530d;

    @Column(name = "cvar_95_30d", precision = 20, scale = 6)
    private BigDecimal cvar9530d;

    @Column(name = "upside_capture_1y", precision = 12, scale = 6)
    private BigDecimal upsideCapture1y;

    @Column(name = "downside_capture_1y", precision = 12, scale = 6)
    private BigDecimal downsideCapture1y;

    @Column(name = "active_return_30d_pct", precision = 12, scale = 6)
    private BigDecimal activeReturn30dPct;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

}