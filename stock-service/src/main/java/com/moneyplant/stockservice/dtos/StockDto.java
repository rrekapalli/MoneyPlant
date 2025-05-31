package com.moneyplant.stockservice.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for Stock entity.
 * Used for creating and updating stocks.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockDto {
    @NotBlank(message = "Stock name is required")
    @Size(min = 1, max = 100, message = "Stock name must be between 1 and 100 characters")
    private String name;

    @NotBlank(message = "Stock symbol is required")
    @Size(min = 1, max = 10, message = "Stock symbol must be between 1 and 10 characters")
    private String symbol;
}
