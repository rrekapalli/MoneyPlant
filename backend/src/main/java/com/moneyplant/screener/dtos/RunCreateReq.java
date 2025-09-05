package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Request DTO for creating a new screener run.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new screener run")
public class RunCreateReq {

    @NotNull(message = "Screener version ID is required")
    @Schema(description = "ID of the screener version to run")
    private Long screenerVersionId;

    @Schema(description = "ID of the parameter set to use")
    private Long paramsetId;

    @Schema(description = "Parameters JSON override")
    private Object paramsJson;

    @Schema(description = "Trading day to run for", example = "2025-01-15")
    private LocalDate runForTradingDay;

    @Schema(description = "List of symbol IDs to include in the universe")
    private List<Long> universeSymbolIds;
}
