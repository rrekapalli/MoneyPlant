package com.moneyplant.portfolio.dtos;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PortfolioCreateRequest {
    private Long userId; // required
    private String name; // required
    private String baseCurrency; // optional

    private String description; // optional
    private LocalDate inceptionDate; // optional
    private String riskProfile; // optional
    private Boolean isActive; // optional

    // Optional: Symbols to seed holdings for this new portfolio
    private List<String> symbols; // optional
}