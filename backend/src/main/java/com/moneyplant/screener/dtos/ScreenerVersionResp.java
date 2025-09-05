package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Response DTO for screener version information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Screener version information")
public class ScreenerVersionResp {

    @Schema(description = "Unique identifier of the screener version")
    private Long screenerVersionId;

    @Schema(description = "ID of the screener this version belongs to")
    private Long screenerId;

    @Schema(description = "Version number")
    private Integer versionNumber;

    @Schema(description = "Status of the version")
    private String status;

    @Schema(description = "Engine type")
    private String engine;

    @Schema(description = "DSL JSON configuration")
    private Object dslJson;

    @Schema(description = "Compiled SQL query")
    private String compiledSql;

    @Schema(description = "Parameters schema JSON")
    private Object paramsSchemaJson;

    @Schema(description = "When the version was created")
    private OffsetDateTime createdAt;
}
