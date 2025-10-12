package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Contextual suggestion for DSL completion or improvement.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Contextual suggestion for DSL completion")
public class ValidationSuggestion {

    @JsonProperty("type")
    @Schema(description = "Type of suggestion", allowableValues = {"FIELD", "OPERATOR", "VALUE", "FUNCTION", "COMPLETION"})
    private String type;

    @JsonProperty("message")
    @Schema(description = "Human-readable suggestion message")
    private String message;

    @JsonProperty("path")
    @Schema(description = "JSON path where suggestion applies")
    private String path;

    @JsonProperty("options")
    @Schema(description = "Available options for the suggestion")
    private Object options;

    @JsonProperty("priority")
    @Schema(description = "Suggestion priority (higher = more important)")
    @Builder.Default
    private int priority = 1;
}