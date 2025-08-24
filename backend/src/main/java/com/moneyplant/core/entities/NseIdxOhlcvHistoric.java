package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "nse_idx_ohlcv_historic", schema = "public")
public class NseIdxOhlcvHistoric {
    @EmbeddedId
    private NseIdxOhlcvHistoricId id;

    @Column(name = "open")
    private Double open;

    @Column(name = "high")
    private Double high;

    @Column(name = "low")
    private Double low;

    @Column(name = "close")
    private Double close;

    @Column(name = "volume")
    private Long volume;

    @Column(name = "total_traded_value")
    private Double totalTradedValue;

    @Column(name = "total_trades")
    private Long totalTrades;

    @Column(name = "delivery_quantity")
    private Long deliveryQuantity;

    @Column(name = "delivery_percentage")
    private Double deliveryPercentage;

    @Column(name = "vwap")
    private Double vwap;

    @Column(name = "previous_close")
    private Double previousClose;

    @Column(name = "series", length = Integer.MAX_VALUE)
    private String series;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}