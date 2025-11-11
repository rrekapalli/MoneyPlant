package com.moneyplant.engines.ingestion.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for parsing NSE Historical Data API response.
 * 
 * NSE API Endpoint: https://www.nseindia.com/api/historical/cm/equity
 * Query params: symbol={SYMBOL}&series=[EQ]&from={DD-MM-YYYY}&to={DD-MM-YYYY}
 * 
 * Requirements: 2.1, 2.2
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NseHistoricalDataDto implements Serializable {
    
    /**
     * List of historical data records
     */
    @JsonProperty("data")
    private List<HistoricalRecord> data;
    
    /**
     * Nested DTO for individual historical data record
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HistoricalRecord {
        @JsonProperty("CH_SYMBOL")
        private String symbol;
        
        @JsonProperty("CH_SERIES")
        private String series;
        
        @JsonProperty("CH_TIMESTAMP")
        private String timestamp;
        
        @JsonProperty("CH_OPENING_PRICE")
        private String openPrice;
        
        @JsonProperty("CH_TRADE_HIGH_PRICE")
        private String highPrice;
        
        @JsonProperty("CH_TRADE_LOW_PRICE")
        private String lowPrice;
        
        @JsonProperty("CH_CLOSING_PRICE")
        private String closePrice;
        
        @JsonProperty("CH_LAST_TRADED_PRICE")
        private String lastTradedPrice;
        
        @JsonProperty("CH_PREVIOUS_CLS_PRICE")
        private String previousClosePrice;
        
        @JsonProperty("CH_TOT_TRADED_QTY")
        private String totalTradedQty;
        
        @JsonProperty("CH_TOT_TRADED_VAL")
        private String totalTradedValue;
        
        @JsonProperty("CH_52WEEK_HIGH_PRICE")
        private String week52HighPrice;
        
        @JsonProperty("CH_52WEEK_LOW_PRICE")
        private String week52LowPrice;
        
        @JsonProperty("VWAP")
        private String vwap;
        
        @JsonProperty("mTIMESTAMP")
        private String mTimestamp;
    }
}
