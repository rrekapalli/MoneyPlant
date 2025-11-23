package com.moneyplant.engines.ingestion.kite.model.dto;

import com.moneyplant.engines.ingestion.kite.model.enums.CandleInterval;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Request DTO for batch fetching historical OHLCV data for multiple instruments.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchHistoricalDataRequest {
    
    /**
     * List of instrument tokens (required, must not be empty).
     */
    @NotEmpty(message = "Instrument tokens list must not be empty")
    private List<String> instrumentTokens;
    
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
