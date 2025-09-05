package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Response DTO for screener schedule information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Screener schedule information")
public class ScheduleResp {

    @Schema(description = "Unique identifier of the schedule")
    private Long scheduleId;

    @Schema(description = "ID of the screener this schedule belongs to")
    private Long screenerId;

    @Schema(description = "Cron expression for scheduling")
    private String cronExpr;

    @Schema(description = "Timezone for the schedule")
    private String timezone;

    @Schema(description = "Whether the schedule is enabled")
    private Boolean isEnabled;

    @Schema(description = "When the schedule was created")
    private OffsetDateTime createdAt;
}
