package com.moneyplant.engines.ingestion.kite.model.entity;

import com.moneyplant.engines.ingestion.kite.model.enums.CandleInterval;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA Entity for kite_ohlcv_historic table.
 * Stores historical OHLCV data from Kite Connect API.
 * This table is a TimescaleDB hypertable partitioned by date.
 */
@Entity
@Table(name = "kite_ohlcv_historic",
    indexes = {
        @Index(name = "idx_ohlcv_instrument_token_date", 
            columnList = "instrument_token, date DESC"),
        @Index(name = "idx_ohlcv_exchange_date", 
            columnList = "exchange, date DESC"),
        @Index(name = "idx_ohlcv_candle_interval_date", 
            columnList = "candle_interval, date DESC"),
        @Index(name = "idx_ohlcv_instrument_exchange_interval", 
            columnList = "instrument_token, exchange, candle_interval, date DESC")
    }
)
@IdClass(KiteOhlcvHistoricId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KiteOhlcvHistoric {
    
    @Id
    @Column(name = "instrument_token", length = 50, nullable = false)
    private String instrumentToken;
    
    @Id
    @Column(name = "exchange", length = 10, nullable = false)
    private String exchange;
    
    @Id
    @Column(name = "date", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private LocalDateTime date;
    
    @Id
    @Column(name = "candle_interval", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private CandleInterval candleInterval;
    
    @Column(name = "open", nullable = false)
    private Double open;
    
    @Column(name = "high", nullable = false)
    private Double high;
    
    @Column(name = "low", nullable = false)
    private Double low;
    
    @Column(name = "close", nullable = false)
    private Double close;
    
    @Column(name = "volume", nullable = false)
    private Long volume;
    
    @Column(name = "created_at", nullable = false, updatable = false,
        insertable = false, columnDefinition = "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
