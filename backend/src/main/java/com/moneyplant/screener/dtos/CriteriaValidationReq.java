package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request for criteria DSL validation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to validate criteria DSL")
public class CriteriaValidationReq {

    @NotNull(message = "DSL is required")
    @Valid
    @JsonProperty("dsl")
    @Schema(description = "Criteria DSL to validate")
    private CriteriaDSL dsl;

    @JsonProperty("options")
    @Schema(description = "Validation options")
    private ValidationOptions options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Options for validation")
    public static class ValidationOptions {
        
        @JsonProperty("includeWarnings")
        @Schema(description = "Include warnings in validation result")
        @Builder.Default
        private Boolean includeWarnings = true;

        @JsonProperty("validatePerformance")
        @Schema(description = "Include performance validation checks")
        @Builder.Default
        private Boolean validatePerformance = true;

        @JsonProperty("strictMode")
        @Schema(description = "Use strict validation mode")
        @Builder.Default
        private Boolean strictMode = false;
    }
}