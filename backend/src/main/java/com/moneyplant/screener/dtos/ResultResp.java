package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for screener result information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Screener result information")
public class ResultResp {

    @Schema(description = "Symbol identifier")
    private String symbolId;

    @Schema(description = "Whether the symbol matched the criteria")
    private Boolean matched;

    @Schema(description = "Score from 0 to 1")
    private BigDecimal score0To1;

    @Schema(description = "Rank within the run")
    private Integer rankInRun;

    @Schema(description = "Metrics JSON object")
    private Object metricsJson;

    @Schema(description = "Reason JSON object")
    private Object reasonJson;
}
