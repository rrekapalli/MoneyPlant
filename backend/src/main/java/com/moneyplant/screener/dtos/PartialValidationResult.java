package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Result of partial criteria DSL validation for real-time feedback.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Result of partial criteria DSL validation")
public class PartialValidationResult {

    @JsonProperty("valid")
    @Schema(description = "Whether the partial DSL is valid so far")
    private boolean valid;

    @JsonProperty("errors")
    @Schema(description = "List of validation errors in the partial DSL")
    @Builder.Default
    private List<ValidationError> errors = List.of();

    @JsonProperty("warnings")
    @Schema(description = "List of validation warnings in the partial DSL")
    @Builder.Default
    private List<ValidationWarning> warnings = List.of();

    @JsonProperty("suggestions")
    @Schema(description = "Contextual suggestions for completing the DSL")
    @Builder.Default
    private List<ValidationSuggestion> suggestions = List.of();

    @JsonProperty("completionHints")
    @Schema(description = "Hints for what can be added next")
    @Builder.Default
    private List<String> completionHints = List.of();

    @JsonProperty("validatedAt")
    @Schema(description = "Timestamp when validation was performed")
    private Instant validatedAt;
}