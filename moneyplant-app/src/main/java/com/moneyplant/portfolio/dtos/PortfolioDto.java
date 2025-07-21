package com.moneyplant.portfolio.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for Portfolio entity.
 * Used for creating and updating portfolios.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioDto {
    @NotBlank(message = "Portfolio name is required")
    @Size(min = 1, max = 100, message = "Portfolio name must be between 1 and 100 characters")
    private String name;

    @NotBlank(message = "Portfolio description is required")
    @Size(min = 1, max = 500, message = "Portfolio description must be between 1 and 500 characters")
    private String description;
}
