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
 * Request for criteria preview with description and estimates.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to preview criteria DSL")
public class CriteriaPreviewReq {

    @NotNull(message = "DSL is required")
    @Valid
    @JsonProperty("dsl")
    @Schema(description = "Criteria DSL to preview")
    private CriteriaDSL dsl;

    @JsonProperty("includeEstimates")
    @Schema(description = "Whether to include result count estimates")
    @Builder.Default
    private Boolean includeEstimates = true;

    @JsonProperty("includeSqlPreview")
    @Schema(description = "Whether to include SQL preview")
    @Builder.Default
    private Boolean includeSqlPreview = false;
}