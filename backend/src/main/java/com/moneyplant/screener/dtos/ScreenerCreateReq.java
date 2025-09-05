package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new screener.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new screener")
public class ScreenerCreateReq {

    @NotBlank(message = "Screener name is required")
    @Schema(description = "Name of the screener", example = "Value+Momentum Screener")
    private String name;

    @Schema(description = "Description of the screener", example = "P/E<15, RSI<30")
    private String description;

    @Schema(description = "Whether the screener is public", example = "false")
    @Builder.Default
    private Boolean isPublic = false;

    @Schema(description = "Default universe for the screener", example = "NSE_500")
    private String defaultUniverse;
}
