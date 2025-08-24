package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioValuationDailyDto {
    private Long id;
    private Long portfolioId;
    private LocalDate date;
    private BigDecimal totalMarketValue;
    private BigDecimal totalCostBasis;
    private BigDecimal cashBalance;
    private BigDecimal netInvested;
    private BigDecimal pnlDaily;
    private BigDecimal pnlTotal;
    private BigDecimal returnDailyPct;
    private BigDecimal returnCumulativePct;
    private BigDecimal twrDailyPct;
    private BigDecimal twrCumulativePct;
    private BigDecimal mwrCumulativePct;
}
