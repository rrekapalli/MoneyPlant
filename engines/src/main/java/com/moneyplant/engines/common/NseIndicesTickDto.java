package com.moneyplant.engines.common;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for NSE indices tick data to be sent to Kafka topics.
 * Represents the structure of data from NSE indices WebSocket stream.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NseIndicesTickDto {
    
    @JsonProperty("timestamp")
    private String timestamp;
    
    @JsonProperty("indices")
    private IndexTickDataDto[] indices;
    
    @JsonProperty("marketStatus")
    private MarketStatusTickDto marketStatus;
    
    @JsonProperty("source")
    private String source;
    
    @JsonProperty("ingestionTimestamp")
    private Instant ingestionTimestamp;
    
    /**
     * Individual index tick data DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IndexTickDataDto {
        
        @JsonProperty("key")
        private String key;
        
        @JsonProperty("index")
        private String indexName;
        
        @JsonProperty("indexSymbol")
        private String indexSymbol;
        
        @JsonProperty("last")
        private BigDecimal lastPrice;
        
        @JsonProperty("variation")
        private BigDecimal variation;
        
        @JsonProperty("percentChange")
        private BigDecimal percentChange;
        
        @JsonProperty("open")
        private BigDecimal openPrice;
        
        @JsonProperty("dayHigh")
        private BigDecimal dayHigh;
        
        @JsonProperty("dayLow")
        private BigDecimal dayLow;
        
        @JsonProperty("previousClose")
        private BigDecimal previousClose;
        
        @JsonProperty("yearHigh")
        private BigDecimal yearHigh;
        
        @JsonProperty("yearLow")
        private BigDecimal yearLow;
        
        @JsonProperty("indicativeClose")
        private BigDecimal indicativeClose;
        
        @JsonProperty("pe")
        private BigDecimal peRatio;
        
        @JsonProperty("pb")
        private BigDecimal pbRatio;
        
        @JsonProperty("dy")
        private BigDecimal dividendYield;
        
        @JsonProperty("declines")
        private Integer declines;
        
        @JsonProperty("advances")
        private Integer advances;
        
        @JsonProperty("unchanged")
        private Integer unchanged;
        
        @JsonProperty("perChange365d")
        private BigDecimal percentChange365d;
        
        @JsonProperty("date365dAgo")
        private String date365dAgo;
        
        @JsonProperty("chart365dPath")
        private String chart365dPath;
        
        @JsonProperty("date30dAgo")
        private String date30dAgo;
        
        @JsonProperty("perChange30d")
        private BigDecimal percentChange30d;
        
        @JsonProperty("chart30dPath")
        private String chart30dPath;
        
        @JsonProperty("chartTodayPath")
        private String chartTodayPath;
        
        @JsonProperty("tickTimestamp")
        private Instant tickTimestamp;
    }
    
    /**
     * Market status information DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketStatusTickDto {
        
        @JsonProperty("marketStatus")
        private String status;
        
        @JsonProperty("marketStatusMessage")
        private String message;
        
        @JsonProperty("tradeDate")
        private String tradeDate;
        
        @JsonProperty("index")
        private String index;
        
        @JsonProperty("last")
        private BigDecimal last;
        
        @JsonProperty("variation")
        private BigDecimal variation;
        
        @JsonProperty("percentChange")
        private BigDecimal percentChange;
        
        @JsonProperty("marketStatusTime")
        private String marketStatusTime;
    }
}
