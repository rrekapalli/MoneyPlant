package com.moneyplant.engines.ingestion.model;

/**
 * Enum for predefined symbol universes based on NSE indices and categories.
 * These universes are derived from nse_eq_master table using specific query criteria.
 * 
 * Requirements: 7.3, 7.6
 */
public enum PredefinedUniverse {
    
    /**
     * Nifty 50 index constituents
     * Query: pd_sector_ind = 'NIFTY 50' AND trading_status = 'Active'
     */
    NIFTY_50("NIFTY 50", "Top 50 companies by market capitalization"),
    
    /**
     * Nifty Bank index constituents
     * Query: pd_sector_ind = 'NIFTY BANK' AND trading_status = 'Active'
     */
    NIFTY_BANK("NIFTY BANK", "Banking sector stocks in Nifty Bank index"),
    
    /**
     * Nifty Next 50 index constituents
     * Query: pd_sector_ind = 'NIFTY NEXT 50' AND trading_status = 'Active'
     */
    NIFTY_NEXT_50("NIFTY NEXT 50", "Next 50 companies after Nifty 50"),
    
    /**
     * Nifty 100 index constituents
     * Query: pd_sector_ind = 'NIFTY 100' AND trading_status = 'Active'
     */
    NIFTY_100("NIFTY 100", "Top 100 companies by market capitalization"),
    
    /**
     * Nifty 200 index constituents
     * Query: pd_sector_ind = 'NIFTY 200' AND trading_status = 'Active'
     */
    NIFTY_200("NIFTY 200", "Top 200 companies by market capitalization"),
    
    /**
     * Nifty 500 index constituents
     * Query: pd_sector_ind = 'NIFTY 500' AND trading_status = 'Active'
     */
    NIFTY_500("NIFTY 500", "Top 500 companies by market capitalization"),
    
    /**
     * Nifty Midcap 50 index constituents
     * Query: pd_sector_ind = 'NIFTY MIDCAP 50' AND trading_status = 'Active'
     */
    NIFTY_MIDCAP_50("NIFTY MIDCAP 50", "Top 50 midcap companies"),
    
    /**
     * Nifty Smallcap 50 index constituents
     * Query: pd_sector_ind = 'NIFTY SMALLCAP 50' AND trading_status = 'Active'
     */
    NIFTY_SMALLCAP_50("NIFTY SMALLCAP 50", "Top 50 smallcap companies"),
    
    /**
     * Futures & Options eligible stocks
     * Query: is_fno_sec = 'Yes' AND trading_status = 'Active'
     */
    FNO_STOCKS("F&O Stocks", "Stocks eligible for Futures and Options trading"),
    
    /**
     * All actively traded stocks
     * Query: trading_status = 'Active'
     */
    ALL_ACTIVE("All Active", "All actively traded stocks on NSE");
    
    private final String indexName;
    private final String description;
    
    PredefinedUniverse(String indexName, String description) {
        this.indexName = indexName;
        this.description = description;
    }
    
    public String getIndexName() {
        return indexName;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Get the universe name for storage/identification
     */
    public String getUniverseName() {
        return this.name();
    }
}
