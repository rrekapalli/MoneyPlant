package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a literal value in the criteria DSL.
 * Literals can be strings, numbers, booleans, or null values.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Literal value with type information")
public class Literal {

    @NotNull(message = "Value is required")
    @JsonProperty("value")
    @Schema(description = "The literal value")
    private Object value;

    @NotNull(message = "Type is required")
    @Pattern(regexp = "STRING|NUMBER|BOOLEAN|NULL|DATE|ARRAY", 
             message = "Type must be one of: STRING, NUMBER, BOOLEAN, NULL, DATE, ARRAY")
    @JsonProperty("type")
    @Schema(description = "Data type of the literal value", 
            allowableValues = {"STRING", "NUMBER", "BOOLEAN", "NULL", "DATE", "ARRAY"})
    private String type;

    @JsonProperty("id")
    @Schema(description = "Optional unique identifier for the literal")
    private String id;
}