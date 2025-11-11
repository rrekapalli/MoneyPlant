package com.moneyplant.engines.ingestion.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Immutable data model representing OHLCV (Open, High, Low, Close, Volume) candlestick data.
 * Used for aggregated market data across different timeframes.
 * 
 * Requirements: 2.1, 2.4
 */
@Data
@Builder
public class OhlcvData implements Serializable {
    
    /**
     * Trading symbol (e.g., "RELIANCE", "TCS")
     */
    @NotBlank(message = "Symbol cannot be blank")
    private final String symbol;
    
    /**
     * Timestamp representing the start of the candle period
     */
    @NotNull(message = "Timestamp cannot be null")
    private final Instant timestamp;
    
    /**
     * Timeframe for this candle (e.g., 1min, 5min, 1day)
     */
    @NotNull(message = "Timeframe cannot be null")
    private final Timeframe timeframe;
    
    /**
     * Opening price for the period
     */
    @NotNull(message = "Open price cannot be null")
    @Positive(message = "Open price must be positive")
    private final BigDecimal open;
    
    /**
     * Highest price during the period
     */
    @NotNull(message = "High price cannot be null")
    @Positive(message = "High price must be positive")
    private final BigDecimal high;
    
    /**
     * Lowest price during the period
     */
    @NotNull(message = "Low price cannot be null")
    @Positive(message = "Low price must be positive")
    private final BigDecimal low;
    
    /**
     * Closing price for the period
     */
    @NotNull(message = "Close price cannot be null")
    @Positive(message = "Close price must be positive")
    private final BigDecimal close;
    
    /**
     * Total trading volume during the period
     */
    @NotNull(message = "Volume cannot be null")
    @PositiveOrZero(message = "Volume must be non-negative")
    private final Long volume;
    
    /**
     * Volume-weighted average price (optional)
     */
    private final BigDecimal vwap;
    
    /**
     * Number of trades during the period (optional)
     */
    private final Integer tradeCount;
    
    /**
     * Calculates the price range (high - low) for this candle
     * 
     * @return price range
     */
    public BigDecimal getPriceRange() {
        return high.subtract(low);
    }
    
    /**
     * Calculates the body size (|close - open|) for this candle
     * 
     * @return absolute difference between close and open
     */
    public BigDecimal getBodySize() {
        return close.subtract(open).abs();
    }
    
    /**
     * Calculates the price change (close - open) for this candle
     * 
     * @return price change
     */
    public BigDecimal getPriceChange() {
        return close.subtract(open);
    }
    
    /**
     * Calculates the percentage change for this candle
     * 
     * @return percentage change as decimal (e.g., 0.05 for 5%)
     */
    public BigDecimal getPercentageChange() {
        if (open.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return close.subtract(open)
                .divide(open, 6, BigDecimal.ROUND_HALF_UP);
    }
    
    /**
     * Checks if this is a bullish candle (close > open)
     * 
     * @return true if bullish
     */
    public boolean isBullish() {
        return close.compareTo(open) > 0;
    }
    
    /**
     * Checks if this is a bearish candle (close < open)
     * 
     * @return true if bearish
     */
    public boolean isBearish() {
        return close.compareTo(open) < 0;
    }
    
    /**
     * Checks if this is a doji candle (close ≈ open)
     * 
     * @return true if doji (within 0.1% tolerance)
     */
    public boolean isDoji() {
        BigDecimal tolerance = open.multiply(BigDecimal.valueOf(0.001));
        return close.subtract(open).abs().compareTo(tolerance) <= 0;
    }
    
    /**
     * Validates that high >= low and high >= open, close and low <= open, close
     * 
     * @return true if candle data is valid
     */
    public boolean isValid() {
        return high.compareTo(low) >= 0
                && high.compareTo(open) >= 0
                && high.compareTo(close) >= 0
                && low.compareTo(open) <= 0
                && low.compareTo(close) <= 0;
    }
}
