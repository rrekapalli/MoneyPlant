package com.moneyplant.engines.ingestion.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Map;

/**
 * DTO for parsing NSE Quote API response.
 * 
 * NSE API Endpoint: https://www.nseindia.com/api/quote-equity?symbol={SYMBOL}
 * 
 * Requirements: 1.2, 4.1
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NseQuoteDto implements Serializable {
    
    @JsonProperty("info")
    private Info info;
    
    @JsonProperty("metadata")
    private Metadata metadata;
    
    @JsonProperty("priceInfo")
    private PriceInfo priceInfo;
    
    @JsonProperty("preOpenMarket")
    private PreOpenMarket preOpenMarket;
    
    /**
     * Nested DTO for symbol info
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Info {
        @JsonProperty("symbol")
        private String symbol;
        
        @JsonProperty("companyName")
        private String companyName;
        
        @JsonProperty("industry")
        private String industry;
        
        @JsonProperty("activeSeries")
        private String[] activeSeries;
        
        @JsonProperty("isin")
        private String isin;
    }
    
    /**
     * Nested DTO for metadata
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metadata {
        @JsonProperty("series")
        private String series;
        
        @JsonProperty("symbol")
        private String symbol;
        
        @JsonProperty("isin")
        private String isin;
        
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("listingDate")
        private String listingDate;
        
        @JsonProperty("industry")
        private String industry;
        
        @JsonProperty("lastUpdateTime")
        private String lastUpdateTime;
        
        @JsonProperty("pdSectorPe")
        private Float pdSectorPe;
        
        @JsonProperty("pdSymbolPe")
        private Float pdSymbolPe;
        
        @JsonProperty("pdSectorInd")
        private String pdSectorInd;
    }
    
    /**
     * Nested DTO for price information
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PriceInfo {
        @JsonProperty("lastPrice")
        private Float lastPrice;
        
        @JsonProperty("change")
        private Float change;
        
        @JsonProperty("pChange")
        private Float pChange;
        
        @JsonProperty("previousClose")
        private Float previousClose;
        
        @JsonProperty("open")
        private Float open;
        
        @JsonProperty("close")
        private Float close;
        
        @JsonProperty("vwap")
        private Float vwap;
        
        @JsonProperty("lowerCP")
        private String lowerCp;
        
        @JsonProperty("upperCP")
        private String upperCp;
        
        @JsonProperty("pPriceBand")
        private String pPriceBand;
        
        @JsonProperty("basePrice")
        private Float basePrice;
        
        @JsonProperty("intraDayHighLow")
        private Map<String, Float> intraDayHighLow;
        
        @JsonProperty("weekHighLow")
        private Map<String, Object> weekHighLow;
    }
    
    /**
     * Nested DTO for pre-open market data
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PreOpenMarket {
        @JsonProperty("preopen")
        private PreOpenData[] preopen;
        
        @JsonProperty("ato")
        private AtoData ato;
        
        @JsonProperty("IEP")
        private Float iep;
        
        @JsonProperty("totalTradedVolume")
        private Float totalTradedVolume;
        
        @JsonProperty("finalPrice")
        private Float finalPrice;
        
        @JsonProperty("finalQuantity")
        private Float finalQuantity;
        
        @JsonProperty("lastUpdateTime")
        private String lastUpdateTime;
        
        @JsonProperty("totalBuyQuantity")
        private Float totalBuyQuantity;
        
        @JsonProperty("totalSellQuantity")
        private Float totalSellQuantity;
        
        @JsonProperty("atoBuyQty")
        private Float atoBuyQty;
        
        @JsonProperty("atoSellQty")
        private Float atoSellQty;
    }
    
    /**
     * Nested DTO for pre-open data
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PreOpenData {
        @JsonProperty("price")
        private Float price;
        
        @JsonProperty("buyQty")
        private Integer buyQty;
        
        @JsonProperty("sellQty")
        private Integer sellQty;
    }
    
    /**
     * Nested DTO for ATO (At The Open) data
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AtoData {
        @JsonProperty("buy")
        private Float buy;
        
        @JsonProperty("sell")
        private Float sell;
    }
}
