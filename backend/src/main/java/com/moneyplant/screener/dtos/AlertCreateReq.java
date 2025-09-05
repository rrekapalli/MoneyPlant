package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for creating a new screener alert.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new screener alert")
public class AlertCreateReq {

    @NotNull(message = "Condition JSON is required")
    @Schema(description = "Alert condition JSON", example = "{\"min_matches\": 5, \"score_threshold\": 0.8}")
    private Object conditionJson;

    @Schema(description = "Delivery channels for the alert", example = "[\"inapp\", \"email\"]")
    @Builder.Default
    private List<String> deliveryChannels = List.of("inapp");

    @Schema(description = "Whether the alert is enabled", example = "true")
    @Builder.Default
    private Boolean isEnabled = true;
}
