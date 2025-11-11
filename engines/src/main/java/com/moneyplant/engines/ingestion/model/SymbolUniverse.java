package com.moneyplant.engines.ingestion.model;

/**
 * Enum representing predefined symbol universes for market data ingestion.
 * Each universe corresponds to a specific set of stocks that can be queried
 * from the nse_eq_master table using specific criteria.
 * 
 * Requirements: 7.3, 7.6
 */
public enum SymbolUniverse {
    
    /**
     * All NSE listed equities with active trading status
     */
    ALL_NSE("All NSE Equities", 
            "trading_status = 'Active'"),
    
    /**
     * Nifty 50 index constituents
     * Query using pd_sector_ind field
     */
    NIFTY_50("Nifty 50", 
            "pd_sector_ind = 'NIFTY 50' AND trading_status = 'Active'"),
    
    /**
     * Nifty Bank index constituents
     */
    NIFTY_BANK("Nifty Bank", 
            "pd_sector_ind = 'NIFTY BANK' AND trading_status = 'Active'"),
    
    /**
     * Nifty Next 50 index constituents
     */
    NIFTY_NEXT_50("Nifty Next 50", 
            "pd_sector_ind = 'NIFTY NEXT 50' AND trading_status = 'Active'"),
    
    /**
     * Nifty Midcap 50 index constituents
     */
    NIFTY_MIDCAP_50("Nifty Midcap 50", 
            "pd_sector_ind = 'NIFTY MIDCAP 50' AND trading_status = 'Active'"),
    
    /**
     * NSE 500 index constituents (top 500 companies by market cap)
     */
    NSE_500("NSE 500", 
            "pd_sector_ind LIKE 'NIFTY%' AND trading_status = 'Active'"),
    
    /**
     * Futures & Options (F&O) eligible stocks
     * Query using is_fno_sec field
     */
    FNO_STOCKS("F&O Stocks", 
            "is_fno_sec = 'Yes' AND trading_status = 'Active'"),
    
    /**
     * Securities Lending and Borrowing (SLB) eligible stocks
     */
    SLB_STOCKS("SLB Stocks", 
            "is_slb_sec = 'Yes' AND trading_status = 'Active'"),
    
    /**
     * ETF securities
     */
    ETF_SECURITIES("ETF Securities", 
            "is_etf_sec = 'Yes' AND trading_status = 'Active'"),
    
    /**
     * Stocks in specific sector (requires parameter substitution)
     * Example: sector = 'Financial Services'
     */
    SECTOR_BASED("Sector Based", 
            "sector = ? AND trading_status = 'Active'"),
    
    /**
     * Stocks in specific industry (requires parameter substitution)
     * Example: industry = 'Banks'
     */
    INDUSTRY_BASED("Industry Based", 
            "industry = ? AND trading_status = 'Active'"),
    
    /**
     * Custom universe (requires custom query)
     */
    CUSTOM("Custom Universe", 
            "");
    
    private final String displayName;
    private final String whereClause;
    
    SymbolUniverse(String displayName, String whereClause) {
        this.displayName = displayName;
        this.whereClause = whereClause;
    }
    
    /**
     * Gets the display name for this universe
     * 
     * @return display name
     */
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Gets the SQL WHERE clause for querying this universe from nse_eq_master table
     * 
     * @return SQL WHERE clause
     */
    public String getWhereClause() {
        return whereClause;
    }
    
    /**
     * Checks if this universe requires parameter substitution
     * 
     * @return true if parameters are needed
     */
    public boolean requiresParameters() {
        return whereClause.contains("?");
    }
    
    /**
     * Gets the base SQL query for this universe
     * 
     * @return SQL query string
     */
    public String getQuery() {
        if (whereClause.isEmpty()) {
            return "SELECT symbol FROM nse_eq_master";
        }
        return "SELECT symbol FROM nse_eq_master WHERE " + whereClause;
    }
    
    /**
     * Parses a universe name to enum value
     * 
     * @param name universe name
     * @return corresponding SymbolUniverse enum
     * @throws IllegalArgumentException if name is not recognized
     */
    public static SymbolUniverse fromName(String name) {
        for (SymbolUniverse universe : values()) {
            if (universe.name().equalsIgnoreCase(name) || 
                universe.displayName.equalsIgnoreCase(name)) {
                return universe;
            }
        }
        throw new IllegalArgumentException("Unknown symbol universe: " + name);
    }
}
