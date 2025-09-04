package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Response DTO for saved view information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Saved view information")
public class SavedViewResp {

    @Schema(description = "Unique identifier of the saved view")
    private Long savedViewId;

    @Schema(description = "ID of the screener this view belongs to")
    private Long screenerId;

    @Schema(description = "ID of the user who created this view")
    private Long userId;

    @Schema(description = "Name of the saved view")
    private String name;

    @Schema(description = "Table preferences JSON object")
    private Object tablePrefs;

    @Schema(description = "When the view was created")
    private OffsetDateTime createdAt;
}
