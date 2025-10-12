package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Information about an operator including compatibility and description.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Operator information with compatibility details")
public class OperatorInfo {

    @JsonProperty("operator")
    @Schema(description = "Operator symbol", example = "=")
    private String operator;

    @JsonProperty("label")
    @Schema(description = "Human-readable operator label", example = "Equals")
    private String label;

    @JsonProperty("description")
    @Schema(description = "Operator description", example = "Tests for equality between two values")
    private String description;

    @JsonProperty("compatibleTypes")
    @Schema(description = "List of compatible field types")
    private List<String> compatibleTypes;

    @JsonProperty("requiresRightOperand")
    @Schema(description = "Whether operator requires a right operand")
    private boolean requiresRightOperand;

    @JsonProperty("category")
    @Schema(description = "Operator category", allowableValues = {"COMPARISON", "LOGICAL", "NULL_CHECK", "PATTERN", "RANGE"})
    private String category;

    @JsonProperty("examples")
    @Schema(description = "Usage examples")
    private List<String> examples;
}