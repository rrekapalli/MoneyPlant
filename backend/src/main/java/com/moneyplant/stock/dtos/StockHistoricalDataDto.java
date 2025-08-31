package com.moneyplant.stock.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object for Stock historical OHLCV data responses.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockHistoricalDataDto {
    private String symbol;
    private LocalDate date;
    private Float open;
    private Float high;
    private Float low;
    private Float close;
    private Float volume;
}
