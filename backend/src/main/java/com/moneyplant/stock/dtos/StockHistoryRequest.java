package com.moneyplant.stock.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Request payload for fetching historical stock OHLCV data.
 * Accepts dates in yyyy-MM-dd format and converts them to LocalDate.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockHistoryRequest {
    private String symbol; // optional; if provided should match the path symbol
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String startDate; // inclusive, format: yyyy-MM-dd
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String endDate;   // inclusive, format: yyyy-MM-dd
    
    /**
     * Get start date as LocalDate, parsing from string format yyyy-MM-dd
     * @return LocalDate representation of startDate
     * @throws IllegalArgumentException if startDate is in invalid format
     */
    public LocalDate getStartDateAsLocalDate() {
        if (startDate == null || startDate.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(startDate.trim(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid startDate format. Expected yyyy-MM-dd, got: " + startDate);
        }
    }
    
    /**
     * Get end date as LocalDate, parsing from string format yyyy-MM-dd
     * @return LocalDate representation of endDate
     * @throws IllegalArgumentException if endDate is in invalid format
     */
    public LocalDate getEndDateAsLocalDate() {
        if (endDate == null || endDate.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(endDate.trim(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid endDate format. Expected yyyy-MM-dd, got: " + endDate);
        }
    }
    
    /**
     * Validate that the request has valid date formats
     * @throws IllegalArgumentException if any date is in invalid format
     */
    public void validateDates() {
        if (startDate != null && !startDate.trim().isEmpty()) {
            getStartDateAsLocalDate(); // This will throw exception if invalid
        }
        if (endDate != null && !endDate.trim().isEmpty()) {
            getEndDateAsLocalDate(); // This will throw exception if invalid
        }
    }
}
