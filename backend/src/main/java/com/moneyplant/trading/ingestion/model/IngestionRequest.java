package com.moneyplant.trading.ingestion.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestionRequest {
    private List<String> symbols;
    private String dataSource;
    private String frequency;
    private boolean realTime;
    private String startDate;
    private String endDate;
}
