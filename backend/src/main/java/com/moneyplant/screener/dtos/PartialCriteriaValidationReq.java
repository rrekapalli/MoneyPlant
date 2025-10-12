package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request for partial criteria DSL validation for real-time feedback.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to validate partial criteria DSL")
public class PartialCriteriaValidationReq {

    @NotNull(message = "Partial DSL is required")
    @JsonProperty("partialDsl")
    @Schema(description = "Partial criteria DSL to validate")
    private Object partialDsl;

    @JsonProperty("context")
    @Schema(description = "Context information for validation")
    private ValidationContext context;

    @JsonProperty("cursorPosition")
    @Schema(description = "Current cursor position in the DSL for contextual suggestions")
    private String cursorPosition;
}