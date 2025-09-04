package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new screener schedule.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new screener schedule")
public class ScheduleCreateReq {

    @NotBlank(message = "Cron expression is required")
    @Schema(description = "Cron expression for scheduling", example = "0 9 * * 1-5")
    private String cronExpr;

    @Schema(description = "Timezone for the schedule", example = "Asia/Kolkata")
    private String timezone = "Asia/Kolkata";

    @Schema(description = "Whether the schedule is enabled", example = "true")
    private Boolean isEnabled = true;
}
