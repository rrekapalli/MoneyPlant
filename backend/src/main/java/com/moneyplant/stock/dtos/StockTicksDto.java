package com.moneyplant.stock.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockTicksDto {

    private String symbol;
    private String timestamp;
    private Float open;

    private Float high;

    private Float low;

    private Float close;

    private Float volume;
}

/*

    private String name;
    private AdvanceDto advance;
    private String timestamp;
    private List<StockDataDto> data;
    private MetadataDto metadata;
    private MarketStatusDto marketStatus;
    private String date30dAgo;
    private String date365dAgo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvanceDto {
        private String declines;
        private String advances;
        private String unchanged;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockDataDto {
        private Integer priority;
        private String symbol;
        private String identifier;
        private String series; // Optional field
        private Double open;
        private Double dayHigh;
        private Double dayLow;
        private Double lastPrice;
        private Double previousClose;
        private Double change;
        private Double pChange;
        private Double ffmc;
        private Double yearHigh;
        private Double yearLow;
        private Long totalTradedVolume;
        private Double stockIndClosePrice;
        private Double totalTradedValue;
        private String lastUpdateTime;
        private Double nearWKH;
        private Double nearWKL;
        private Double perChange365d;
        private String date365dAgo;
        private String chart365dPath;
        private String date30dAgo;
        private Double perChange30d;
        private String chart30dPath;
        private String chartTodayPath;
        private MetaDto meta; // Optional field

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class MetaDto {
            private String symbol;
            private String companyName;
            private String industry;
            private List<String> activeSeries;
            private List<String> debtSeries;
            private Boolean isFNOSec;
            private Boolean isCASec;
            private Boolean isSLBSec;
            private Boolean isDebtSec;
            private Boolean isSuspended;
            private List<String> tempSuspendedSeries;
            private Boolean isETFSec;
            private Boolean isDelisted;
            private String isin;
            @JsonProperty("slb_isin")
            private String slbIsin;
            private String listingDate;
            private Boolean isMunicipalBond;
            private Boolean isHybridSymbol;
            private QuotePreOpenStatusDto quotepreopenstatus;

            @Data
            @NoArgsConstructor
            @AllArgsConstructor
            public static class QuotePreOpenStatusDto {
                private String equityTime;
                private String preOpenTime;
                @JsonProperty("QuotePreOpenFlag")
                private Boolean quotePreOpenFlag;
            }
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetadataDto {
        private String indexName;
        private Double open;
        private Double high;
        private Double low;
        private Double previousClose;
        private Double last;
        private Double percChange;
        private Double change;
        private String timeVal;
        private Double yearHigh;
        private Double yearLow;
        private Double indicativeClose;
        private Long totalTradedVolume;
        private Double totalTradedValue;
        @JsonProperty("ffmc_sum")
        private Double ffmcSum;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketStatusDto {
        private String market;
        private String marketStatus;
        private String tradeDate;
        private String index;
        private Double last;
        private Double variation;
        private Double percentChange;
        private String marketStatusMessage;
    }
}


/*
{
    "name": "NIFTY 50",
    "advance": {
        "declines": "22",
        "advances": "28",
        "unchanged": "0"
    },
    "timestamp": "29-Jul-2025 12:43:39",
    "data": [
        {
            "priority": 1,
            "symbol": "NIFTY 50",
            "identifier": "NIFTY 50",
            "open": 24609.65,
            "dayHigh": 24727.15,
            "dayLow": 24598.6,
            "lastPrice": 24694.4,
            "previousClose": 24680.9,
            "change": 13.5,
            "pChange": 0.05,
            "ffmc": 1118137117.75,
            "yearHigh": 26277.35,
            "yearLow": 21743.65,
            "totalTradedVolume": 151766578,
            "stockIndClosePrice": 0,
            "totalTradedValue": 132040710404.86,
            "lastUpdateTime": "29-Jul-2025 12:43:39",
            "nearWKH": 6.0240092703411765,
            "nearWKL": -13.570628666300275,
            "perChange365d": -0.62,
            "date365dAgo": "26-Jul-2024",
            "chart365dPath": "https://nsearchives.nseindia.com/365d/NIFTY-50.svg",
            "date30dAgo": "27-Jun-2025",
            "perChange30d": -3.73,
            "chart30dPath": "https://nsearchives.nseindia.com/30d/NIFTY-50.svg",
            "chartTodayPath": "https://nsearchives.nseindia.com/today/NIFTY-50.svg"
        },
        {
            "priority": 0,
            "symbol": "AXISBANK",
            "identifier": "AXISBANKEQN",
            "series": "EQ",
            "open": 1070.9,
            "dayHigh": 1078.7,
            "dayLow": 1055.4,
            "lastPrice": 1060.4,
            "previousClose": 1073.6,
            "change": -13.2,
            "pChange": -1.23,
            "totalTradedVolume": 9090430,
            "stockIndClosePrice": 0,
            "totalTradedValue": 9657400119.1,
            "yearHigh": 1281.65,
            "ffmc": 3025663643395.47,
            "yearLow": 933.5,
            "nearWKH": 17.262903288729373,
            "nearWKL": -13.594001071237289,
            "perChange365d": -8.81,
            "date365dAgo": "26-Jul-2024",
            "chart365dPath": "https://nsearchives.nseindia.com/365d/AXISBANK-EQ.svg",
            "date30dAgo": "27-Jun-2025",
            "perChange30d": -12.37,
            "chart30dPath": "https://nsearchives.nseindia.com/30d/AXISBANK-EQ.svg",
            "chartTodayPath": "https://nsearchives.nseindia.com/today/AXISBANKEQN.svg",
            "meta": {
                "symbol": "AXISBANK",
                "companyName": "Axis Bank Limited",
                "industry": "Private Sector Bank",
                "activeSeries": [
                    "EQ"
                ],
                "debtSeries": [],
                "isFNOSec": true,
                "isCASec": false,
                "isSLBSec": true,
                "isDebtSec": true,
                "isSuspended": false,
                "tempSuspendedSeries": [
                    "IL"
                ],
                "isETFSec": false,
                "isDelisted": false,
                "isin": "INE238A01034",
                "slb_isin": "INE238A01034",
                "listingDate": "1998-11-16",
                "isMunicipalBond": false,
                "isHybridSymbol": false,
                "quotepreopenstatus": {
                    "equityTime": "29-Jul-2025 12:43:29",
                    "preOpenTime": "29-Jul-2025 09:07:15",
                    "QuotePreOpenFlag": false
                }
            }
        }
    ],
    "metadata": {
        "indexName": "NIFTY 50",
        "open": 24609.65,
        "high": 24727.15,
        "low": 24598.6,
        "previousClose": 24680.9,
        "last": 24694.4,
        "percChange": 0.05,
        "change": 13.5,
        "timeVal": "29-Jul-2025 18:13:30",
        "yearHigh": 26277.35,
        "yearLow": 21743.65,
        "indicativeClose": 0,
        "totalTradedVolume": 151766578,
        "totalTradedValue": 132040710404.86,
        "ffmc_sum": 1118137117.75
    },
    "marketStatus": {
        "market": "Capital Market",
        "marketStatus": "Open",
        "tradeDate": "29-Jul-2025 12:43",
        "index": "NIFTY 50",
        "last": 24693.1,
        "variation": 12.19999999999709,
        "percentChange": 0.05,
        "marketStatusMessage": "Normal Market is Open"
    },
    "date30dAgo": "27-Jun-2025",
    "date365dAgo": "26-Jul-2024"
}
 */