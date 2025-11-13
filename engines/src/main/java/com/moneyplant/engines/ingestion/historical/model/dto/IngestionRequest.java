package com.moneyplant.engines.ingestion.historical.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * Request DTO for triggering NSE historical data ingestion.
 * 
 * Both startDate and endDate are optional:
 * - If startDate is not provided, the system will automatically detect the last ingested date
 *   and start from the next day (incremental ingestion)
 * - If endDate is not provided, the system will use the current date
 * 
 * Requirements: 4.1, 4.2
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestionRequest implements Serializable {
    
    /**
     * Optional start date for ingestion (format: YYYY-MM-DD)
     * If not provided, uses incremental ingestion from MAX(time) + 1
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    /**
     * Optional end date for ingestion (format: YYYY-MM-DD)
     * If not provided, uses current date
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    /**
     * Validates that start date is before or equal to end date when both are provided
     */
    @AssertTrue(message = "Start date must be before or equal to end date")
    public boolean isValidDateRange() {
        if (startDate != null && endDate != null) {
            return !startDate.isAfter(endDate);
        }
        return true;
    }
}
