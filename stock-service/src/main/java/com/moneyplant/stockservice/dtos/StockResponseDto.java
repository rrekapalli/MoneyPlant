package com.moneyplant.stockservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for Stock entity responses.
 * Used for returning stock information to clients.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockResponseDto {
    private String id;
    private String name;
    private String symbol;
}
