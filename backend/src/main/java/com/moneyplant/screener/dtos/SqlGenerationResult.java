package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Result of SQL generation from criteria DSL.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "SQL generation result with parameterized query")
public class SqlGenerationResult {

    @JsonProperty("sql")
    @Schema(description = "Generated parameterized SQL WHERE clause", example = "market_cap > :p1 AND sector = :p2")
    private String sql;

    @JsonProperty("parameters")
    @Schema(description = "Parameter values for the SQL query")
    private Map<String, Object> parameters;

    @JsonProperty("generatedAt")
    @Schema(description = "Timestamp when SQL was generated")
    private Instant generatedAt;

    @JsonProperty("generatedBy")
    @Schema(description = "User ID who generated the SQL")
    private String generatedBy;

    @JsonProperty("dslHash")
    @Schema(description = "Hash of the DSL used for caching")
    private String dslHash;

    @JsonProperty("estimatedComplexity")
    @Schema(description = "Estimated query complexity score")
    private Integer estimatedComplexity;
}