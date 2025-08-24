package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioMetricsDailyDto {
    private Long id;
    private Long portfolioId;
    private LocalDate date;
    private BigDecimal nav;
    private BigDecimal twrDailyPct;
    private BigDecimal twrCumulativePct;
    private BigDecimal mwrCumulativePct;
    private BigDecimal irrToDatePct;
    private BigDecimal irrAnnualizedPct;
    private BigDecimal xirrToDatePct;
    private BigDecimal xirrAnnualizedPct;
    private BigDecimal cagrPct;
    private BigDecimal ytdReturnPct;
    private BigDecimal return1mPct;
    private BigDecimal return3mPct;
    private BigDecimal return6mPct;
    private BigDecimal return1yPct;
    private BigDecimal return3yAnnualizedPct;
    private BigDecimal return5yAnnualizedPct;
    private BigDecimal drawdownPct;
    private BigDecimal maxDrawdownPct;
    private BigDecimal volatility30dPct;
    private BigDecimal volatility90dPct;
    private BigDecimal downsideDeviation30dPct;
    private BigDecimal sharpe30d;
    private BigDecimal sortino30d;
    private BigDecimal calmar1y;
    private BigDecimal treynor30d;
    private BigDecimal beta30d;
    private BigDecimal alpha30d;
    private BigDecimal trackingError30d;
    private BigDecimal informationRatio30d;
    private BigDecimal var9530d;
    private BigDecimal cvar9530d;
    private BigDecimal upsideCapture1y;
    private BigDecimal downsideCapture1y;
    private BigDecimal activeReturn30dPct;
}
