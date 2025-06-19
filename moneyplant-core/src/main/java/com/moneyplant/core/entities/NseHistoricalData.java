package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.AbstractAuditable;

@Getter
@Setter
@Entity
@Table(name = "nse_historical_data", schema = "public")
public class NseHistoricalData extends AbstractAuditable {
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