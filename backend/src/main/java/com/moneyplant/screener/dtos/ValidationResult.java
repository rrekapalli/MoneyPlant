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
 * Result of criteria DSL validation containing errors, warnings, and metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Result of criteria DSL validation")
public class ValidationResult {

    @JsonProperty("valid")
    @Schema(description = "Whether the DSL is valid (no errors)")
    private boolean valid;

    @JsonProperty("errors")
    @Schema(description = "List of validation errors")
    @Builder.Default
    private List<ValidationError> errors = List.of();

    @JsonProperty("warnings")
    @Schema(description = "List of validation warnings")
    @Builder.Default
    private List<ValidationWarning> warnings = List.of();

    @JsonProperty("validatedAt")
    @Schema(description = "Timestamp when validation was performed")
    private Instant validatedAt;

    @JsonProperty("validatedBy")
    @Schema(description = "User ID who performed the validation")
    private String validatedBy;

    @JsonProperty("dslHash")
    @Schema(description = "Hash of the validated DSL for caching")
    private String dslHash;
}