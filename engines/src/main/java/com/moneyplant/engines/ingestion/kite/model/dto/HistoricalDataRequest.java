package com.moneyplant.engines.ingestion.kite.model.dto;

import com.moneyplant.engines.ingestion.kite.model.enums.CandleInterval;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for fetching historical OHLCV data from Kite Connect API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoricalDataRequest {
    
    /**
     * Instrument token (required).
     */
    @NotNull(message = "Instrument token is required")
    private String instrumentToken;
    
    /**
     * Exchange code (required).
     */
    @NotNull(message = "Exchange is required")
    private String exchange;
    
    /**
     * Start date for historical data (required, must be in the past or present).
     */
    @NotNull(message = "From date is required")
    @PastOrPresent(message = "From date must be in the past or present")
    private LocalDate fromDate;
    
    /**
     * End date for historical data (required, must be in the past or present).
     */
    @NotNull(message = "To date is required")
    @PastOrPresent(message = "To date must be in the past or present")
    private LocalDate toDate;
    
    /**
     * Candle interval (required).
     */
    @NotNull(message = "Interval is required")
    private CandleInterval interval;
}
