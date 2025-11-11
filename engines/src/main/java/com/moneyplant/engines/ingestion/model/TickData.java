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
 * Immutable data model representing a single market tick.
 * Contains price, volume, and bid-ask information for a symbol at a specific timestamp.
 * 
 * Requirements: 1.2, 4.1
 */
@Data
@Builder
public class TickData implements Serializable {
    
    /**
     * Trading symbol (e.g., "RELIANCE", "TCS")
     */
    @NotBlank(message = "Symbol cannot be blank")
    private final String symbol;
    
    /**
     * Timestamp when the tick was generated (exchange time)
     */
    @NotNull(message = "Timestamp cannot be null")
    private final Instant timestamp;
    
    /**
     * Last traded price
     */
    @NotNull(message = "Price cannot be null")
    @Positive(message = "Price must be positive")
    private final BigDecimal price;
    
    /**
     * Trading volume for this tick
     */
    @NotNull(message = "Volume cannot be null")
    @PositiveOrZero(message = "Volume must be non-negative")
    private final Long volume;
    
    /**
     * Best bid price (optional)
     */
    private final BigDecimal bid;
    
    /**
     * Best ask price (optional)
     */
    private final BigDecimal ask;
    
    /**
     * Additional metadata in JSON format (optional)
     * Can contain exchange-specific fields, order book depth, etc.
     */
    private final String metadata;
    
    /**
     * Calculates bid-ask spread if both bid and ask are available
     * 
     * @return bid-ask spread or null if bid/ask not available
     */
    public BigDecimal getBidAskSpread() {
        if (bid != null && ask != null) {
            return ask.subtract(bid);
        }
        return null;
    }
    
    /**
     * Calculates mid price (average of bid and ask) if both are available
     * 
     * @return mid price or null if bid/ask not available
     */
    public BigDecimal getMidPrice() {
        if (bid != null && ask != null) {
            return bid.add(ask).divide(BigDecimal.valueOf(2));
        }
        return null;
    }
    
    /**
     * Checks if this tick has bid-ask information
     * 
     * @return true if both bid and ask are present
     */
    public boolean hasBidAsk() {
        return bid != null && ask != null;
    }
}
