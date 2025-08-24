package com.moneyplant.engines.common.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Simple entity representing a single NSE index tick.
 * Currently designed as a plain Java object for minimal persistence needs.
 * You can later annotate it with @Entity and persistence mappings if storage is required.
 */
@Data
public class NseIndexTick {
    private String id;                      // optional identifier if persisted

    // Metadata
    private String timestamp;               // when this entity was created
    private String source;                  // data source
    private Instant ingestionTimestamp;     // server-side ingestion timestamp

    // Index data
    private String indexName;
    private String indexSymbol;

    private BigDecimal lastPrice;
    private BigDecimal variation;
    private BigDecimal percentChange;

    private BigDecimal openPrice;
    private BigDecimal dayHigh;
    private BigDecimal dayLow;
    private BigDecimal previousClose;

    private BigDecimal yearHigh;
    private BigDecimal yearLow;

    private Instant tickTimestamp;
}
