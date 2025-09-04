package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Response DTO for screener alert information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Screener alert information")
public class AlertResp {

    @Schema(description = "Unique identifier of the alert")
    private Long alertId;

    @Schema(description = "ID of the screener this alert belongs to")
    private Long screenerId;

    @Schema(description = "Alert condition JSON")
    private Object conditionJson;

    @Schema(description = "Delivery channels for the alert")
    private List<String> deliveryChannels;

    @Schema(description = "Whether the alert is enabled")
    private Boolean isEnabled;

    @Schema(description = "When the alert was created")
    private OffsetDateTime createdAt;
}
