package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for toggling screener star status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to toggle screener star status")
public class StarToggleReq {

    @Schema(description = "Whether to star or unstar the screener", example = "true")
    private Boolean starred;
}
