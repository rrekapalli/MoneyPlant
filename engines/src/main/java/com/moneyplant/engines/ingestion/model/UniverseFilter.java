package com.moneyplant.engines.ingestion.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

/**
 * Filter criteria for creating custom symbol universes.
 * Supports filtering by sector, industry, trading status, market cap, and other attributes.
 * 
 * Requirements: 7.3, 7.6
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniverseFilter {
    
    /**
     * Filter by specific sectors (e.g., "Technology", "Banking")
     */
    private Set<String> sectors;
    
    /**
     * Filter by specific industries
     */
    private Set<String> industries;
    
    /**
     * Filter by trading status (e.g., "Active", "Suspended")
     */
    private String tradingStatus;
    
    /**
     * Filter by index membership (pd_sector_ind field)
     */
    private Set<String> indices;
    
    /**
     * Filter by FNO eligibility
     */
    private Boolean isFnoEligible;
    
    /**
     * Filter by minimum market cap (if available)
     */
    private BigDecimal minMarketCap;
    
    /**
     * Filter by maximum market cap (if available)
     */
    private BigDecimal maxMarketCap;
    
    /**
     * Filter by minimum last price
     */
    private BigDecimal minPrice;
    
    /**
     * Filter by maximum last price
     */
    private BigDecimal maxPrice;
    
    /**
     * Filter by minimum volume
     */
    private Long minVolume;
    
    /**
     * Exclude suspended stocks
     */
    private Boolean excludeSuspended;
    
    /**
     * Exclude delisted stocks
     */
    private Boolean excludeDelisted;
    
    /**
     * Check if filter has any criteria set
     */
    public boolean isEmpty() {
        return (sectors == null || sectors.isEmpty()) &&
               (industries == null || industries.isEmpty()) &&
               tradingStatus == null &&
               (indices == null || indices.isEmpty()) &&
               isFnoEligible == null &&
               minMarketCap == null &&
               maxMarketCap == null &&
               minPrice == null &&
               maxPrice == null &&
               minVolume == null &&
               excludeSuspended == null &&
               excludeDelisted == null;
    }
}
