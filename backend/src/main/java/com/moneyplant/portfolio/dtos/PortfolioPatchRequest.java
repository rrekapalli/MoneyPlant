package com.moneyplant.portfolio.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PortfolioPatchRequest {
    private String name; // optional
    private String baseCurrency; // optional

    private String description; // optional
    private LocalDate inceptionDate; // optional
    private String riskProfile; // optional
    private Boolean isActive; // optional
}