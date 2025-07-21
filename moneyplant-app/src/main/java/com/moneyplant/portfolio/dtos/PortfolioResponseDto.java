package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for Portfolio entity responses.
 * Used for returning portfolio information to clients.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioResponseDto {
    private String id;
    private String name;
    private String description;
}
