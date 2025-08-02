package com.moneyplant.index.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Data Transfer Object for Index entity responses.
 * Used for returning index information to clients.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IndexResponseDto {
    private Integer id;
    private String keyCategory;
    private String indexName;
    private String indexSymbol;
    private Float lastPrice;
    private Float variation;
    private Float percentChange;
    private Float openPrice;
    private Float highPrice;
    private Float lowPrice;
    private Float previousClose;
    private Float yearHigh;
    private Float yearLow;
    private Float indicativeClose;
    private Float peRatio;
    private Float pbRatio;
    private Float dividendYield;
    private Integer declines;
    private Integer advances;
    private Integer unchanged;
    private Float percentChange365d;
    private String date365dAgo;
    private Float percentChange30d;
    private String date30dAgo;
    private BigDecimal previousDay;
    private BigDecimal oneWeekAgo;
    private BigDecimal oneMonthAgo;
    private BigDecimal oneYearAgo;
    private Instant createdAt;
    private Instant updatedAt;
}