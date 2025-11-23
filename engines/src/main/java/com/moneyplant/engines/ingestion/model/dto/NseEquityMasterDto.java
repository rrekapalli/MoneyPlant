package com.moneyplant.engines.ingestion.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * DTO for parsing NSE Equity Master API response.
 * Maps to the JSON structure returned by NSE API endpoints.
 * 
 * NSE API Endpoint: https://www.nseindia.com/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O
 * 
 * Requirements: 7.3, 7.6
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NseEquityMasterDto implements Serializable {
    
    @JsonProperty("symbol")
    private String symbol;
    
    @JsonProperty("companyName")
    private String companyName;
    
    @JsonProperty("industry")
    private String industry;
    
    @JsonProperty("activeSeries")
    private String[] activeSeries;
    
    @JsonProperty("debtSeries")
    private String[] debtSeries;
    
    @JsonProperty("tempSuspendedSeries")
    private String[] tempSuspendedSeries;
    
    @JsonProperty("isFNOSec")
    private Boolean isFnoSec;
    
    @JsonProperty("isCASec")
    private Boolean isCaSec;
    
    @JsonProperty("isSLBSec")
    private Boolean isSlbSec;
    
    @JsonProperty("isDebtSec")
    private Boolean isDebtSec;
    
    @JsonProperty("isSuspended")
    private Boolean isSuspended;
    
    @JsonProperty("isETFSec")
    private Boolean isEtfSec;
    
    @JsonProperty("isDelisted")
    private Boolean isDelisted;
    
    @JsonProperty("isin")
    private String isin;
    
    @JsonProperty("slb_isin")
    private String slbIsin;
    
    @JsonProperty("listingDate")
    private String listingDate;
    
    @JsonProperty("identifier")
    private String identifier;
    
    @JsonProperty("series")
    private String series;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("lastUpdateTime")
    private String lastUpdateTime;
    
    @JsonProperty("pdSectorPe")
    private Float pdSectorPe;
    
    @JsonProperty("pdSymbolPe")
    private Float pdSymbolPe;
    
    @JsonProperty("pdSectorInd")
    private String pdSectorInd;
    
    @JsonProperty("boardStatus")
    private String boardStatus;
    
    @JsonProperty("tradingStatus")
    private String tradingStatus;
    
    @JsonProperty("tradingSegment")
    private String tradingSegment;
    
    @JsonProperty("sessionNo")
    private String sessionNo;
    
    @JsonProperty("slb")
    private String slb;
    
    @JsonProperty("classOfShare")
    private String classOfShare;
    
    @JsonProperty("derivatives")
    private String derivatives;
    
    @JsonProperty("faceValue")
    private Float faceValue;
    
    @JsonProperty("issuedSize")
    private Float issuedSize;
    
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
    private IntraDayHighLow intraDayHighLow;
    
    @JsonProperty("weekHighLow")
    private WeekHighLow weekHighLow;
    
    @JsonProperty("iNavValue")
    private Float iNavValue;
    
    @JsonProperty("checkINAV")
    private String checkInav;
    
    @JsonProperty("tickSize")
    private Float tickSize;
    
    @JsonProperty("macro")
    private String macro;
    
    @JsonProperty("sector")
    private String sector;
    
    @JsonProperty("basicIndustry")
    private String basicIndustry;
    
    @JsonProperty("totalTradedVolume")
    private Float totalTradedVolume;
    
    @JsonProperty("totalBuyQuantity")
    private Float totalBuyQuantity;
    
    @JsonProperty("totalSellQuantity")
    private Float totalSellQuantity;
    
    @JsonProperty("atoBuyQty")
    private Float atoBuyQty;
    
    @JsonProperty("atoSellQty")
    private Float atoSellQty;
    
    /**
     * Nested DTO for intraday high/low data
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class IntraDayHighLow {
        @JsonProperty("min")
        private Float min;
        
        @JsonProperty("max")
        private Float max;
        
        @JsonProperty("value")
        private Float value;
    }
    
    /**
     * Nested DTO for 52-week high/low data
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WeekHighLow {
        @JsonProperty("min")
        private Float min;
        
        @JsonProperty("minDate")
        private String minDate;
        
        @JsonProperty("max")
        private Float max;
        
        @JsonProperty("maxDate")
        private String maxDate;
    }
}
