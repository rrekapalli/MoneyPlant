package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioHoldingDto {
    private Long id;
    private Long portfolioId;
    private String symbol;
    private BigDecimal quantity;
    private BigDecimal avgCost;
    private BigDecimal realizedPnl;
    private OffsetDateTime lastUpdated;
}
