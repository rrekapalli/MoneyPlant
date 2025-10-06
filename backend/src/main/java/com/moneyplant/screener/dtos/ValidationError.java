package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a validation error with code, message, and path information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Validation error with details")
public class ValidationError {

    @JsonProperty("code")
    @Schema(description = "Error code for programmatic handling", example = "INVALID_FIELD_REFERENCE")
    private String code;

    @JsonProperty("message")
    @Schema(description = "Human-readable error message", example = "Field 'invalid_field' does not exist")
    private String message;

    @JsonProperty("path")
    @Schema(description = "JSON path to the error location", example = "$.root.children[0].left.field")
    private String path;

    @JsonProperty("severity")
    @Schema(description = "Error severity level", allowableValues = {"ERROR", "WARNING", "INFO"})
    @Builder.Default
    private String severity = "ERROR";

    @JsonProperty("suggestion")
    @Schema(description = "Optional suggestion to fix the error")
    private String suggestion;
}