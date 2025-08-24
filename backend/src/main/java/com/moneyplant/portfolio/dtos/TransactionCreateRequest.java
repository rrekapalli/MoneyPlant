package com.moneyplant.portfolio.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class TransactionCreateRequest {
    private String symbol; // optional (e.g., for cash transactions)
    private LocalDate tradeDate; // required
    private OffsetDateTime tradeTime; // optional
    private String txnType; // required
    private BigDecimal quantity; // required
    private BigDecimal price; // required
    private BigDecimal fees; // optional default 0
    private BigDecimal taxes; // optional default 0
    private String notes; // optional
}