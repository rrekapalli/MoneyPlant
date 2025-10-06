package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Preview of criteria with human-readable description and estimates.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Preview of criteria with description and estimates")
public class CriteriaPreview {

    @JsonProperty("description")
    @Schema(description = "Human-readable description of the criteria")
    private String description;

    @JsonProperty("estimatedResultCount")
    @Schema(description = "Estimated number of results (if available)")
    private Long estimatedResultCount;

    @JsonProperty("complexity")
    @Schema(description = "Complexity level", allowableValues = {"LOW", "MEDIUM", "HIGH"})
    private String complexity;

    @JsonProperty("performanceWarning")
    @Schema(description = "Performance warning message if applicable")
    private String performanceWarning;

    @JsonProperty("sqlPreview")
    @Schema(description = "Preview of generated SQL (sanitized)")
    private String sqlPreview;

    @JsonProperty("generatedAt")
    @Schema(description = "Timestamp when preview was generated")
    private Instant generatedAt;
}