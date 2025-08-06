package com.moneyplant.stock.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO for NSE indices data received from WebSocket streams.
 * Represents the structure of data from wss://www.nseindia.com/streams/indices/high/drdMkt
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IndicesDto {
    
    private String timestamp;
    private List<IndexDataDto> indices;
    private MarketStatusDto marketStatus;
    private String source;
    
    /**
     * Individual index data DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IndexDataDto {
        
        @JsonProperty("key")
        private String key;
        
        @JsonProperty("index")
        private String indexName;
        
        @JsonProperty("indexSymbol")
        private String indexSymbol;
        
        @JsonProperty("last")
        private Float lastPrice;
        
        @JsonProperty("variation")
        private Float variation;
        
        @JsonProperty("percentChange")
        private Float percentChange;
        
        @JsonProperty("open")
        private Float openPrice;
        
        @JsonProperty("dayHigh")
        private Float dayHigh;
        
        @JsonProperty("dayLow")
        private Float dayLow;
        
        @JsonProperty("previousClose")
        private Float previousClose;
        
        @JsonProperty("yearHigh")
        private Float yearHigh;
        
        @JsonProperty("yearLow")
        private Float yearLow;
        
        @JsonProperty("indicativeClose")
        private Float indicativeClose;
        
        @JsonProperty("pe")
        private Float peRatio;
        
        @JsonProperty("pb")
        private Float pbRatio;
        
        @JsonProperty("dy")
        private Float dividendYield;
        
        @JsonProperty("declines")
        private Integer declines;
        
        @JsonProperty("advances")
        private Integer advances;
        
        @JsonProperty("unchanged")
        private Integer unchanged;
        
        @JsonProperty("perChange365d")
        private Float percentChange365d;
        
        @JsonProperty("date365dAgo")
        private String date365dAgo;
        
        @JsonProperty("chart365dPath")
        private String chart365dPath;
        
        @JsonProperty("date30dAgo")
        private String date30dAgo;
        
        @JsonProperty("perChange30d")
        private Float percentChange30d;
        
        @JsonProperty("chart30dPath")
        private String chart30dPath;
        
        @JsonProperty("chartTodayPath")
        private String chartTodayPath;
    }
    
    /**
     * Market status information DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketStatusDto {
        
        @JsonProperty("marketStatus")
        private String status;
        
        @JsonProperty("marketStatusMessage")
        private String message;
        
        @JsonProperty("tradeDate")
        private String tradeDate;
        
        @JsonProperty("index")
        private String index;
        
        @JsonProperty("last")
        private Float last;
        
        @JsonProperty("variation")
        private Float variation;
        
        @JsonProperty("percentChange")
        private Float percentChange;
        
        @JsonProperty("marketStatusTime")
        private String marketStatusTime;
    }
}