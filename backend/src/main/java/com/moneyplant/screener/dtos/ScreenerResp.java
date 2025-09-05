package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Response DTO for screener information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Screener information")
public class ScreenerResp {

    @Schema(description = "Unique identifier of the screener")
    private Long screenerId;

    @Schema(description = "ID of the user who owns this screener")
    private Long ownerUserId;

    @Schema(description = "Name of the screener")
    private String name;

    @Schema(description = "Description of the screener")
    private String description;

    @Schema(description = "Whether the screener is public")
    private Boolean isPublic;

    @Schema(description = "Default universe for the screener")
    private String defaultUniverse;

    @Schema(description = "When the screener was created")
    private OffsetDateTime createdAt;

    @Schema(description = "When the screener was last updated")
    private OffsetDateTime updatedAt;
}
