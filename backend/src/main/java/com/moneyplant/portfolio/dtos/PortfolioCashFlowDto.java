package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioCashFlowDto {
    private Long id;
    private Long portfolioId;
    private LocalDate flowDate;
    private BigDecimal amount;
    private String flowType;
    private Long referenceTxnId;
}
