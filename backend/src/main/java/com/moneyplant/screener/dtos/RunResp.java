package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Response DTO for screener run information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Screener run information")
public class RunResp {

    @Schema(description = "Unique identifier of the screener run")
    private Long screenerRunId;

    @Schema(description = "ID of the screener")
    private Long screenerId;

    @Schema(description = "ID of the screener version")
    private Long screenerVersionId;

    @Schema(description = "Status of the run")
    private String status;

    @Schema(description = "When the run started")
    private OffsetDateTime startedAt;

    @Schema(description = "When the run finished")
    private OffsetDateTime finishedAt;

    @Schema(description = "Error message if run failed")
    private String errorMessage;

    @Schema(description = "Total number of candidates processed")
    private Integer totalCandidates;

    @Schema(description = "Total number of matches found")
    private Integer totalMatches;
}
