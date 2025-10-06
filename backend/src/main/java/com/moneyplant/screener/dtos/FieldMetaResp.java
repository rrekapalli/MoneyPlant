package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for field metadata information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Field metadata information")
public class FieldMetaResp {

    @JsonProperty("id")
    @Schema(description = "Unique field identifier", example = "market_cap")
    private String id;

    @JsonProperty("label")
    @Schema(description = "Human-readable field label", example = "Market Capitalization")
    private String label;

    @JsonProperty("dbColumn")
    @Schema(description = "Database column name", example = "market_cap")
    private String dbColumn;

    @JsonProperty("dataType")
    @Schema(description = "Field data type", allowableValues = {"STRING", "NUMBER", "INTEGER", "DATE", "BOOLEAN", "ENUM", "PERCENT", "CURRENCY"})
    private String dataType;

    @JsonProperty("allowedOps")
    @Schema(description = "List of allowed operators for this field")
    private List<String> allowedOps;

    @JsonProperty("category")
    @Schema(description = "Field category for grouping", example = "Financial")
    private String category;

    @JsonProperty("description")
    @Schema(description = "Field description", example = "Total market value of company shares")
    private String description;

    @JsonProperty("example")
    @Schema(description = "Example value", example = "1000000000")
    private String example;

    @JsonProperty("suggestionsApi")
    @Schema(description = "Optional API endpoint for value suggestions")
    private String suggestionsApi;

    @JsonProperty("validationRules")
    @Schema(description = "Field-specific validation rules")
    private Object validationRules;
}