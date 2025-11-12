package com.moneyplant.engines.ingestion.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

/**
 * Event representing changes to a symbol universe.
 * Published to Kafka when symbols are added or removed from a universe.
 * 
 * Requirements: 7.4, 7.5, 7.7
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniverseChangeEvent {
    
    /**
     * Name of the universe that changed
     */
    private String universeName;
    
    /**
     * Type of change
     */
    private ChangeType changeType;
    
    /**
     * Symbols that were added (for ADD and UPDATE events)
     */
    private Set<String> addedSymbols;
    
    /**
     * Symbols that were removed (for REMOVE and UPDATE events)
     */
    private Set<String> removedSymbols;
    
    /**
     * Current total number of symbols in the universe
     */
    private int totalSymbols;
    
    /**
     * Timestamp when the change occurred
     */
    private Instant timestamp;
    
    /**
     * Optional description of the change
     */
    private String description;
    
    /**
     * Enum for change types
     */
    public enum ChangeType {
        CREATED,   // Universe was created
        UPDATED,   // Universe was updated (symbols added/removed)
        DELETED,   // Universe was deleted
        REFRESHED  // Universe was refreshed from source
    }
    
    /**
     * Get the number of symbols added
     */
    public int getAddedCount() {
        return addedSymbols != null ? addedSymbols.size() : 0;
    }
    
    /**
     * Get the number of symbols removed
     */
    public int getRemovedCount() {
        return removedSymbols != null ? removedSymbols.size() : 0;
    }
}
