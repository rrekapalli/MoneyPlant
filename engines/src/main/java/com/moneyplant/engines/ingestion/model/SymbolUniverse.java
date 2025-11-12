package com.moneyplant.engines.ingestion.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

/**
 * Represents a universe of symbols (stocks) grouped by specific criteria.
 * Used for managing symbol subscriptions and filtering.
 * 
 * Requirements: 7.3, 7.6
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymbolUniverse {
    
    /**
     * Unique name of the universe (e.g., "NIFTY_50", "FNO_STOCKS", "CUSTOM_TECH")
     */
    private String name;
    
    /**
     * Human-readable description of the universe
     */
    private String description;
    
    /**
     * Set of symbols in this universe
     */
    private Set<String> symbols;
    
    /**
     * Type of universe (predefined or custom)
     */
    private UniverseType type;
    
    /**
     * Filter criteria used to create this universe (for custom universes)
     */
    private UniverseFilter filter;
    
    /**
     * Timestamp when this universe was created
     */
    private Instant createdAt;
    
    /**
     * Timestamp when this universe was last updated
     */
    private Instant updatedAt;
    
    /**
     * Number of symbols in the universe
     */
    public int getSymbolCount() {
        return symbols != null ? symbols.size() : 0;
    }
    
    /**
     * Enum for universe types
     */
    public enum UniverseType {
        PREDEFINED,  // Built-in universes like NIFTY_50, FNO_STOCKS
        CUSTOM       // User-defined universes with custom filters
    }
}
