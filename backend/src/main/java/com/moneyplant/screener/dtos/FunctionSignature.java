package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for detailed function signature information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Detailed function signature information")
public class FunctionSignature {

    @JsonProperty("functionId")
    @Schema(description = "Function identifier", example = "avg")
    private String functionId;

    @JsonProperty("label")
    @Schema(description = "Human-readable function label", example = "Average")
    private String label;

    @JsonProperty("description")
    @Schema(description = "Function description", example = "Calculates the average value over a period")
    private String description;

    @JsonProperty("returnType")
    @Schema(description = "Function return type", allowableValues = {"STRING", "NUMBER", "INTEGER", "DATE", "BOOLEAN"})
    private String returnType;

    @JsonProperty("category")
    @Schema(description = "Function category", example = "Aggregation")
    private String category;

    @JsonProperty("parameters")
    @Schema(description = "Detailed parameter information")
    private List<FunctionParameterResp> parameters;

    @JsonProperty("examples")
    @Schema(description = "Usage examples")
    private List<String> examples;

    @JsonProperty("sqlTemplate")
    @Schema(description = "SQL template for advanced users")
    private String sqlTemplate;

    @JsonProperty("minParameters")
    @Schema(description = "Minimum number of required parameters")
    private int minParameters;

    @JsonProperty("maxParameters")
    @Schema(description = "Maximum number of parameters")
    private int maxParameters;
}