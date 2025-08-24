package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioBenchmarkDto {
    private Long portfolioId;
    private String indexName;
    private BigDecimal weightPct;
}
