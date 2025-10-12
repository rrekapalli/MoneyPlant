package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single condition in the criteria DSL.
 * A condition compares a left operand with a right operand using an operator.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Single condition comparing two operands")
public class Condition {

    @NotNull(message = "Left operand is required")
    @Valid
    @JsonProperty("left")
    @Schema(description = "Left operand (field reference or function call)")
    private Object left;

    @NotNull(message = "Operator is required")
    @Pattern(regexp = "=|!=|>|>=|<|<=|LIKE|NOT_LIKE|IN|NOT_IN|BETWEEN|NOT_BETWEEN|IS_NULL|IS_NOT_NULL", 
             message = "Invalid operator")
    @JsonProperty("operator")
    @Schema(description = "Comparison operator", 
            allowableValues = {"=", "!=", ">", ">=", "<", "<=", "LIKE", "NOT_LIKE", "IN", "NOT_IN", "BETWEEN", "NOT_BETWEEN", "IS_NULL", "IS_NOT_NULL"})
    private String operator;

    @Valid
    @JsonProperty("right")
    @Schema(description = "Right operand (literal value, field reference, or function call)")
    private Object right;

    @JsonProperty("id")
    @Schema(description = "Optional unique identifier for the condition")
    private String id;
}