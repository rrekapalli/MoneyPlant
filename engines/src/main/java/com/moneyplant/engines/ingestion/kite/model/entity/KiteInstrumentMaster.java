package com.moneyplant.engines.ingestion.kite.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity for kite_instrument_master table.
 * Stores master data for all tradable instruments from Kite Connect API.
 */
@Entity
@Table(name = "kite_instrument_master",
    indexes = {
        @Index(name = "idx_kite_instrument_master_tradingsymbol", columnList = "tradingsymbol"),
        @Index(name = "idx_kite_instrument_master_exchange", columnList = "exchange"),
        @Index(name = "idx_kite_instrument_master_instrument_type", columnList = "instrument_type"),
        @Index(name = "idx_kite_instrument_master_segment", columnList = "segment")
    }
)
@IdClass(KiteInstrumentMasterId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KiteInstrumentMaster {
    
    @Id
    @Column(name = "instrument_token", length = 50, nullable = false)
    private String instrumentToken;
    
    @Id
    @Column(name = "exchange", length = 10, nullable = false)
    private String exchange;
    
    @Column(name = "exchange_token", length = 50)
    private String exchangeToken;
    
    @Column(name = "tradingsymbol", length = 100, nullable = false)
    private String tradingsymbol;
    
    @Column(name = "name", length = 255)
    private String name;
    
    @Column(name = "last_price")
    private Double lastPrice;
    
    @Column(name = "expiry")
    private LocalDate expiry;
    
    @Column(name = "strike")
    private Double strike;
    
    @Column(name = "tick_size")
    private Double tickSize;
    
    @Column(name = "lot_size")
    private Integer lotSize;
    
    @Column(name = "instrument_type", length = 10)
    private String instrumentType;
    
    @Column(name = "segment", length = 20)
    private String segment;
    
    @Column(name = "last_updated", nullable = false, updatable = false,
        insertable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime lastUpdated;
    
    @Column(name = "created_at", nullable = false, updatable = false,
        insertable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
