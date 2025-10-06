package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for field value suggestions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Field value suggestion")
public class ValueSuggestion {

    @JsonProperty("value")
    @Schema(description = "Suggested value", example = "AAPL")
    private String value;

    @JsonProperty("label")
    @Schema(description = "Human-readable label for the value", example = "Apple Inc.")
    private String label;

    @JsonProperty("description")
    @Schema(description = "Optional description of the value", example = "Technology company")
    private String description;

    @JsonProperty("category")
    @Schema(description = "Optional category for grouping suggestions", example = "Technology")
    private String category;

    @JsonProperty("metadata")
    @Schema(description = "Additional metadata for the suggestion")
    private Object metadata;
}