package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioTransactionDto {
    private Long id;
    private Long portfolioId;
    private String symbol;
    private LocalDate tradeDate;
    private OffsetDateTime tradeTime;
    private String txnType;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal fees;
    private BigDecimal taxes;
    private String notes;
}
