package com.moneyplant.portfolio.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PortfolioUpdateRequest {
    private String name; // required for PUT
    private String baseCurrency; // required for PUT

    private String description; // optional
    private LocalDate inceptionDate; // optional
    private String riskProfile; // optional
    private Boolean isActive; // optional
}