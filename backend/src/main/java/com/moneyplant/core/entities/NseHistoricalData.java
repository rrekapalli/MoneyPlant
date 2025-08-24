package com.moneyplant.core.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
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

    @Column(name = "volume")
    private Float volume;
}
