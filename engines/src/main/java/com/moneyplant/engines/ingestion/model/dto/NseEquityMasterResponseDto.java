package com.moneyplant.engines.ingestion.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for parsing NSE Equity Master API response wrapper.
 * The NSE API returns data wrapped in a response object with metadata.
 * 
 * Example response structure:
 * {
 *   "data": [ {...equity data...}, {...equity data...} ],
 *   "metadata": { "indexName": "SECURITIES IN F&O", "last": "..." }
 * }
 * 
 * Requirements: 7.3, 7.6
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NseEquityMasterResponseDto implements Serializable {
    
    /**
     * List of equity master data
     */
    @JsonProperty("data")
    private List<NseEquityMasterDto> data;
    
    /**
     * Response metadata
     */
    @JsonProperty("metadata")
    private Metadata metadata;
    
    /**
     * Nested DTO for response metadata
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metadata {
        @JsonProperty("indexName")
        private String indexName;
        
        @JsonProperty("last")
        private String last;
        
        @JsonProperty("totalCount")
        private Integer totalCount;
    }
}
