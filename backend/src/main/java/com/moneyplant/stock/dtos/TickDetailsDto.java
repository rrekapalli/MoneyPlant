package com.moneyplant.stock.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TickDetailsDto {
    private String symbol;
    private LocalDate date;
    private Float open;
    private Float high;
    private Float low;
    private Float close;
    private BigDecimal volume;
    private BigDecimal totalTradedValue;
    private BigDecimal totalTrades;
    private BigDecimal deliveryQuantity;
    private Float deliveryPercentage;
    private Float vwap;
    private Float previousClose;
    private String series;
}
