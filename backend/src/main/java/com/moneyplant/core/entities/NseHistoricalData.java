package com.moneyplant.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Getter
@Setter
@Entity
@Table(name = "nse_eq_ohlcv_historic", schema = "public")
public class NseHistoricalData implements Serializable {
    @EmbeddedId
    private NseHistoricalDataId id;

    @Column(name = "open")
    private Float open;

    @Column(name = "high")
    private Float high;

    @Column(name = "low")
    private Float low;

    @Column(name = "close")
    private Float close;

    // volume is numeric(20)
    @Column(name = "volume")
    private BigDecimal volume;

    @Column(name = "total_traded_value")
    private BigDecimal totalTradedValue;

    @Column(name = "total_trades")
    private BigDecimal totalTrades;

    @Column(name = "delivery_quantity")
    private BigDecimal deliveryQuantity;

    @Column(name = "delivery_percentage")
    private Float deliveryPercentage;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "vwap")
    private Float vwap;

    @Column(name = "previous_close")
    private Float previousClose;

    @Column(name = "series")
    private String series;
}
