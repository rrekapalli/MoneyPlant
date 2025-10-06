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
 * Root DSL object representing the complete criteria structure.
 * This is stored in ScreenerVersion.dsl_json field.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Criteria DSL root object")
public class CriteriaDSL {

    @NotNull(message = "Root group is required")
    @Valid
    @JsonProperty("root")
    @Schema(description = "Root group containing all criteria conditions")
    private Group root;

    @JsonProperty("version")
    @Schema(description = "DSL version for compatibility", example = "1.0")
    @Builder.Default
    private String version = "1.0";

    @JsonProperty("metadata")
    @Schema(description = "Additional metadata for the criteria")
    private Object metadata;
}