package com.moneyplant.engines.ingestion.kite.model.entity;

import com.moneyplant.engines.ingestion.kite.model.enums.CandleInterval;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Composite primary key for KiteOhlcvHistoric entity.
 * Consists of instrument_token, exchange, date, and candle_interval.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KiteOhlcvHistoricId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private String instrumentToken;
    private String exchange;
    private LocalDateTime date;
    private CandleInterval candleInterval;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        KiteOhlcvHistoricId that = (KiteOhlcvHistoricId) o;
        return Objects.equals(instrumentToken, that.instrumentToken) &&
               Objects.equals(exchange, that.exchange) &&
               Objects.equals(date, that.date) &&
               candleInterval == that.candleInterval;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(instrumentToken, exchange, date, candleInterval);
    }
}
