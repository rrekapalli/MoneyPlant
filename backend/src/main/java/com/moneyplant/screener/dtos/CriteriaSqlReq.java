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
 * Request for SQL generation from criteria DSL.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to generate SQL from criteria DSL")
public class CriteriaSqlReq {

    @NotNull(message = "DSL is required")
    @Valid
    @JsonProperty("dsl")
    @Schema(description = "Criteria DSL to convert to SQL")
    private CriteriaDSL dsl;

    @JsonProperty("options")
    @Schema(description = "SQL generation options")
    private SqlGenerationOptions options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Options for SQL generation")
    public static class SqlGenerationOptions {
        
        @JsonProperty("includeComments")
        @Schema(description = "Include comments in generated SQL")
        @Builder.Default
        private Boolean includeComments = false;

        @JsonProperty("optimizeForPerformance")
        @Schema(description = "Apply performance optimizations")
        @Builder.Default
        private Boolean optimizeForPerformance = true;

        @JsonProperty("validateSyntax")
        @Schema(description = "Validate SQL syntax before returning")
        @Builder.Default
        private Boolean validateSyntax = true;
    }
}