package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for screener result difference information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Screener result difference information")
public class ResultDiffResp {

    @Schema(description = "Symbol identifier")
    private String symbolId;

    @Schema(description = "Type of change", example = "new", allowableValues = {"new", "improved", "worsened", "removed"})
    private String changeType;

    @Schema(description = "Previous rank")
    private Integer prevRank;

    @Schema(description = "New rank")
    private Integer newRank;
}
