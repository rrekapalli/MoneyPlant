package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a logical group of conditions or other groups.
 * Groups can be nested to create complex logical structures.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Logical group of conditions with AND/OR/NOT operators")
public class Group {

    @NotNull(message = "Operator is required")
    @Pattern(regexp = "AND|OR|NOT", message = "Operator must be one of: AND, OR, NOT")
    @JsonProperty("operator")
    @Schema(description = "Logical operator for the group", allowableValues = {"AND", "OR", "NOT"})
    private String operator;

    @NotEmpty(message = "Children list cannot be empty")
    @Valid
    @JsonProperty("children")
    @Schema(description = "List of child conditions or groups")
    private List<Object> children;

    @JsonProperty("id")
    @Schema(description = "Optional unique identifier for the group")
    private String id;
}