package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.AbstractAuditable;

@Getter
@Setter
@Entity
@Table(name = "nse_equity_instruments", schema = "public")
public class NseEquityInstrument extends AbstractAuditable {
    @Id
    @Column(name = "tradingsymbol", length = 50)
    private String tradingsymbol;

    @Column(name = "instrument_token")
    private Long instrumentToken;

    @Column(name = "exchange_token", length = Integer.MAX_VALUE)
    private String exchangeToken;

    @Column(name = "name", length = 512)
    private String name;

    @Column(name = "last_price")
    private Double lastPrice;

    @Column(name = "expiry", length = 50)
    private String expiry;

    @Column(name = "strike")
    private Double strike;

    @Column(name = "tick_size")
    private Double tickSize;

    @Column(name = "lot_size")
    private Long lotSize;

    @Column(name = "instrument_type", length = 50)
    private String instrumentType;

    @Column(name = "segment", length = 50)
    private String segment;

    @Column(name = "exchange", length = 50)
    private String exchange;

}