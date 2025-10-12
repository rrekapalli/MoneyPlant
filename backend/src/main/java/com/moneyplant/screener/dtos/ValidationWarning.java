package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a validation warning with code, message, and path information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Validation warning with details")
public class ValidationWarning {

    @JsonProperty("code")
    @Schema(description = "Warning code for programmatic handling", example = "PERFORMANCE_CONCERN")
    private String code;

    @JsonProperty("message")
    @Schema(description = "Human-readable warning message", example = "Complex nested conditions may impact performance")
    private String message;

    @JsonProperty("path")
    @Schema(description = "JSON path to the warning location", example = "$.root.children[0]")
    private String path;

    @JsonProperty("suggestion")
    @Schema(description = "Optional suggestion to address the warning")
    private String suggestion;
}