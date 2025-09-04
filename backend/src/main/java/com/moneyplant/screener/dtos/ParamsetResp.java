package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Response DTO for parameter set information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Parameter set information")
public class ParamsetResp {

    @Schema(description = "Unique identifier of the parameter set")
    private Long paramsetId;

    @Schema(description = "ID of the screener version this paramset belongs to")
    private Long screenerVersionId;

    @Schema(description = "Name of the parameter set")
    private String name;

    @Schema(description = "Parameters JSON object")
    private Object paramsJson;

    @Schema(description = "ID of the user who created this paramset")
    private Long createdByUserId;

    @Schema(description = "When the paramset was created")
    private OffsetDateTime createdAt;
}
