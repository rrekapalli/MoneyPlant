package com.moneyplant.stock.dtos;

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
    @NotBlank(message = "Stock symbol is required")
    @Size(min = 1, max = 10, message = "Stock symbol must be between 1 and 10 characters")
    private String symbol;

    @NotBlank(message = "Company name is required")
    @Size(min = 1, max = 255, message = "Company name must be between 1 and 255 characters")
    private String companyName;

    @Size(max = 255, message = "Industry must not exceed 255 characters")
    private String industry;

    @Size(max = 255, message = "Sector indicator must not exceed 255 characters")
    private String pdSectorInd;
}
