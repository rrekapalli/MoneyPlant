package com.moneyplant.portfolio.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class HoldingUpdateRequest {
    private BigDecimal quantity; // optional for PATCH; required for PUT
    private BigDecimal avgCost; // optional for PATCH; required for PUT
    private BigDecimal realizedPnl; // optional
}