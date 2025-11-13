package com.moneyplant.engines.ingestion.historical.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * Simple POJO representing a date range for historical data ingestion.
 * Contains start and end dates for the ingestion period.
 * 
 * This model is used by DateRangeResolver to return resolved date ranges
 * based on existing data and user input.
 * 
 * Requirements: 3.1
 */
@Getter
@Builder
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class DateRange implements Serializable {
    
    /**
     * Start date of the ingestion range (inclusive)
     */
    private final LocalDate start;
    
    /**
     * End date of the ingestion range (inclusive)
     */
    private final LocalDate end;
    
    /**
     * Checks if this date range is empty (start date is after end date)
     * 
     * @return true if the range is empty
     */
    public boolean isEmpty() {
        return start != null && end != null && start.isAfter(end);
    }
    
    /**
     * Checks if this date range is valid (start date is not after end date)
     * 
     * @return true if the range is valid
     */
    public boolean isValid() {
        return start != null && end != null && !start.isAfter(end);
    }
    
    /**
     * Calculates the number of days in this date range (inclusive)
     * 
     * @return number of days, or 0 if range is invalid
     */
    public long getDayCount() {
        if (!isValid()) {
            return 0;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
    }
}
