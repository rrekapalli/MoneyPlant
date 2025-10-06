package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for function metadata information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Function metadata information")
public class FunctionMetaResp {

    @JsonProperty("id")
    @Schema(description = "Unique function identifier", example = "avg")
    private String id;

    @JsonProperty("label")
    @Schema(description = "Human-readable function label", example = "Average")
    private String label;

    @JsonProperty("returnType")
    @Schema(description = "Function return type", allowableValues = {"STRING", "NUMBER", "INTEGER", "DATE", "BOOLEAN"})
    private String returnType;

    @JsonProperty("sqlTemplate")
    @Schema(description = "SQL template for function execution")
    private String sqlTemplate;

    @JsonProperty("category")
    @Schema(description = "Function category for grouping", example = "Aggregation")
    private String category;

    @JsonProperty("description")
    @Schema(description = "Function description", example = "Calculates the average value")
    private String description;

    @JsonProperty("examples")
    @Schema(description = "Usage examples")
    private List<String> examples;

    @JsonProperty("parameters")
    @Schema(description = "Function parameter definitions")
    private List<FunctionParameterResp> parameters;
}