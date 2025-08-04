package com.moneyplant.stock.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;

/**
 * DTO for enriched stock tick data that includes additional fields from nse_equity_master table.
 * Used by the getStockTicksByIndex endpoint to return comprehensive stock information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrichedStockTickDto {
    
    // Fields from nse_stock_tick table
    private String symbol;
    private Integer priority;
    private String identifier;
    private String series;
    private Float openPrice;
    private Float dayHigh;
    private Float dayLow;
    private Float lastPrice;
    private Float previousClose;
    private Float priceChange;
    private Float percentChange;
    private Long totalTradedVolume;
    private Float stockIndClosePrice;
    private Float totalTradedValue;
    private Float yearHigh;
    private Float ffmc;
    private Float yearLow;
    private Float nearWeekHigh;
    private Float nearWeekLow;
    private Float percentChange365d;
    private String date365dAgo;
    private String chart365dPath;
    private String date30dAgo;
    private Float percentChange30d;
    private String chart30dPath;
    private String chartTodayPath;
    private String companyName;
    private String industry;
    private Boolean isFnoSec;
    private Boolean isCaSec;
    private Boolean isSlbSec;
    private Boolean isDebtSec;
    private Boolean isSuspended;
    private Boolean isEtfSec;
    private Boolean isDelisted;
    private String isin;
    private String slbIsin;
    private String listingDate;
    private Boolean isMunicipalBond;
    private Boolean isHybridSymbol;
    private String equityTime;
    private String preOpenTime;
    private Boolean quotePreOpenFlag;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Additional fields from nse_equity_master table
    private String basicIndustry;
    private String pdSectorInd;
    private String macro;
    private String sector;
    // Note: company_name is already included from nse_stock_tick
}