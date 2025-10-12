package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a function call in the criteria DSL.
 * Functions can perform calculations, aggregations, or other operations on field values.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Function call with parameters")
public class FunctionCall {

    @NotBlank(message = "Function name is required")
    @JsonProperty("name")
    @Schema(description = "Name of the function to call", example = "AVG")
    private String name;

    @Valid
    @JsonProperty("parameters")
    @Schema(description = "List of parameters for the function")
    private List<Object> parameters;

    @JsonProperty("id")
    @Schema(description = "Optional unique identifier for the function call")
    private String id;
}