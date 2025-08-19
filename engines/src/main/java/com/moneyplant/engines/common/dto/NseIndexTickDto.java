package com.moneyplant.engines.common.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Simple DTO representing a single NSE index tick for WebSocket consumers.
 * This avoids sending the larger wrapper object when clients subscribe to a specific index topic.
 */
@Data
public class NseIndexTickDto {
    // Metadata
    private String timestamp;               // when this DTO was created
    private String source;                  // e.g., "Engines STOMP WebSocket"
    private Instant ingestionTimestamp;     // server-side ingestion timestamp

    // Index fields (compact subset)
    private String indexName;               // e.g., "NIFTY 50"
    private String indexSymbol;             // e.g., "NIFTY50"

    private BigDecimal lastPrice;           // current price
    private BigDecimal variation;           // absolute change
    private BigDecimal percentChange;       // percentage change

    private BigDecimal openPrice;           // session open
    private BigDecimal dayHigh;             // session high
    private BigDecimal dayLow;              // session low
    private BigDecimal previousClose;       // previous close

    private BigDecimal yearHigh;            // 52w high (optional)
    private BigDecimal yearLow;             // 52w low (optional)

    // Tick timestamp for this index value
    private Instant tickTimestamp;
}
