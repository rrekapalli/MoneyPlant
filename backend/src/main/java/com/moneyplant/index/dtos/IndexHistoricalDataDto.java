package com.moneyplant.index.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Data Transfer Object for Index historical data responses.
 * Used for returning index historical information to clients.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IndexHistoricalDataDto {
    private String indexName;
    private LocalDate date;
    private Float open;
    private Float high;
    private Float low;
    private Float close;
    private Float volume;
} 