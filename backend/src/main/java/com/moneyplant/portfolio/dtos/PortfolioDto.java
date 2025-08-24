package com.moneyplant.portfolio.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioDto {
    private Long id;
    private String name;
    private String description;
    private String baseCurrency;
    private LocalDate inceptionDate;
    private String riskProfile;
    private Boolean isActive;
}
