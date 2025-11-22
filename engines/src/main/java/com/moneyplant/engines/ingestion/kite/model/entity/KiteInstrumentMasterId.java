package com.moneyplant.engines.ingestion.kite.model.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite primary key for KiteInstrumentMaster entity.
 * Consists of instrument_token and exchange.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KiteInstrumentMasterId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private String instrumentToken;
    private String exchange;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        KiteInstrumentMasterId that = (KiteInstrumentMasterId) o;
        return Objects.equals(instrumentToken, that.instrumentToken) &&
               Objects.equals(exchange, that.exchange);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(instrumentToken, exchange);
    }
}
