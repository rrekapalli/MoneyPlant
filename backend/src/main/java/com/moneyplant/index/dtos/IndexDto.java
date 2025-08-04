package com.moneyplant.index.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for Index entity.
 * Used for creating and updating indices.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IndexDto {
    @Size(max = 200, message = "Key category must not exceed 200 characters")
    private String keyCategory;

    @NotBlank(message = "Index name is required")
    @Size(min = 1, max = 200, message = "Index name must be between 1 and 200 characters")
    private String indexName;

    @NotBlank(message = "Index symbol is required")
    @Size(min = 1, max = 200, message = "Index symbol must be between 1 and 200 characters")
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
}