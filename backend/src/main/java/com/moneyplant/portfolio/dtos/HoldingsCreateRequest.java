package com.moneyplant.portfolio.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class HoldingsCreateRequest {
    // list of symbols to create holdings
    private List<String> symbols; // required (at least one symbol)

    // optional defaults applied to all created holdings
    private BigDecimal quantity; // default 0
    private BigDecimal avgCost; // default 0
}