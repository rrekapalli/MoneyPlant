package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new screener version.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new screener version")
public class ScreenerVersionCreateReq {

    @NotNull(message = "Version number is required")
    @Schema(description = "Version number for this screener version", example = "1")
    private Integer versionNumber;

    @Pattern(regexp = "sql|dsl|expr", message = "Engine must be one of: sql, dsl, expr")
    @Schema(description = "Engine type for the screener", example = "sql", allowableValues = {"sql", "dsl", "expr"})
    @Builder.Default
    private String engine = "sql";

    @Schema(description = "DSL JSON configuration")
    private Object dslJson;

    @Schema(description = "Compiled SQL query")
    private String compiledSql;

    @Schema(description = "Parameters schema JSON")
    private Object paramsSchemaJson;
}
