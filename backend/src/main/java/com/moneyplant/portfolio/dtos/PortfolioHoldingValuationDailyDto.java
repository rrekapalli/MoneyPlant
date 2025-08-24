package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioHoldingValuationDailyDto {
    private Long id;
    private Long portfolioId;
    private String symbol;
    private LocalDate date;
    private BigDecimal quantity;
    private BigDecimal marketPrice;
    private BigDecimal marketValue;
    private BigDecimal costBasis;
    private BigDecimal pnlDaily;
    private BigDecimal pnlTotal;
    private BigDecimal weightPct;
}
