package com.moneyplant.engines.ingestion.historical.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Immutable data model representing raw NSE Bhav Copy data.
 * Contains all fields from NSE daily settlement file (bhavcopy).
 * 
 * This model stores data exactly as provided by NSE without any calculations or adjustments.
 * 
 * Requirements: 1.5
 */
@Getter
@Builder
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class BhavCopyData implements Serializable {
    
    /**
     * Trading symbol (e.g., "RELIANCE", "TCS")
     */
    @NotBlank(message = "Symbol cannot be blank")
    private final String symbol;
    
    /**
     * Series (e.g., "EQ" for equity, "BE" for B series)
     */
    @NotBlank(message = "Series cannot be blank")
    private final String series;
    
    /**
     * Trading date (parsed from DATE1 column in bhav copy)
     */
    @NotNull(message = "Date cannot be null")
    private final LocalDate date;
    
    /**
     * Timestamp (converted from date for database storage)
     */
    @NotNull(message = "Time cannot be null")
    private final Instant time;
    
    /**
     * Previous day's closing price
     */
    @PositiveOrZero(message = "Previous close must be non-negative")
    private final BigDecimal prevClose;
    
    /**
     * Opening price for the trading day
     */
    @NotNull(message = "Open price cannot be null")
    @Positive(message = "Open price must be positive")
    private final BigDecimal open;
    
    /**
     * Highest price during the trading day
     */
    @NotNull(message = "High price cannot be null")
    @Positive(message = "High price must be positive")
    private final BigDecimal high;
    
    /**
     * Lowest price during the trading day
     */
    @NotNull(message = "Low price cannot be null")
    @Positive(message = "Low price must be positive")
    private final BigDecimal low;
    
    /**
     * Last traded price
     */
    @PositiveOrZero(message = "Last price must be non-negative")
    private final BigDecimal last;
    
    /**
     * Closing price for the trading day
     */
    @NotNull(message = "Close price cannot be null")
    @Positive(message = "Close price must be positive")
    private final BigDecimal close;
    
    /**
     * Average traded price for the day
     */
    @PositiveOrZero(message = "Average price must be non-negative")
    private final BigDecimal avgPrice;
    
    /**
     * Total traded quantity (volume)
     */
    @NotNull(message = "Volume cannot be null")
    @PositiveOrZero(message = "Volume must be non-negative")
    private final Long volume;
    
    /**
     * Turnover in lakhs (1 lakh = 100,000)
     */
    @PositiveOrZero(message = "Turnover must be non-negative")
    private final BigDecimal turnoverLacs;
    
    /**
     * Number of trades executed during the day
     */
    @PositiveOrZero(message = "Number of trades must be non-negative")
    private final Integer noOfTrades;
    
    /**
     * Deliverable quantity
     */
    @PositiveOrZero(message = "Deliverable quantity must be non-negative")
    private final Long delivQty;
    
    /**
     * Deliverable percentage (percentage of volume that was delivered)
     */
    @PositiveOrZero(message = "Deliverable percentage must be non-negative")
    private final BigDecimal delivPer;
    
    /**
     * Validates that high >= low and high >= open, close and low <= open, close
     * 
     * @return true if bhav copy data is valid
     */
    public boolean isValid() {
        if (high == null || low == null || open == null || close == null) {
            return false;
        }
        
        return high.compareTo(low) >= 0
                && high.compareTo(open) >= 0
                && high.compareTo(close) >= 0
                && low.compareTo(open) <= 0
                && low.compareTo(close) <= 0;
    }
    
    /**
     * Calculates the price range (high - low) for this trading day
     * 
     * @return price range
     */
    public BigDecimal getPriceRange() {
        if (high == null || low == null) {
            return BigDecimal.ZERO;
        }
        return high.subtract(low);
    }
    
    /**
     * Calculates the price change (close - open) for this trading day
     * 
     * @return price change
     */
    public BigDecimal getPriceChange() {
        if (close == null || open == null) {
            return BigDecimal.ZERO;
        }
        return close.subtract(open);
    }
    
    /**
     * Calculates the percentage change for this trading day
     * 
     * @return percentage change as decimal (e.g., 0.05 for 5%)
     */
    public BigDecimal getPercentageChange() {
        if (open == null || close == null || open.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return close.subtract(open)
                .divide(open, 6, BigDecimal.ROUND_HALF_UP);
    }
}
