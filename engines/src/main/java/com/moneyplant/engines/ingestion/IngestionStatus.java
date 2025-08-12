package com.moneyplant.engines.ingestion;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Status tracking for data ingestion jobs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngestionStatus {

    private String symbol;
    private String status; // PENDING, IN_PROGRESS, COMPLETED, FAILED
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalRecords;
    private Integer processedRecords;
    private Integer failedRecords;
    private String errorMessage;
    private String dataSource;
    private LocalDateTime lastUpdated;
}
