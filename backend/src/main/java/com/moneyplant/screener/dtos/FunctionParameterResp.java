package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for function parameter information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Function parameter information")
public class FunctionParameterResp {

    @JsonProperty("name")
    @Schema(description = "Parameter name", example = "field")
    private String name;

    @JsonProperty("type")
    @Schema(description = "Parameter type", allowableValues = {"STRING", "NUMBER", "INTEGER", "DATE", "BOOLEAN", "FIELD", "FUNCTION"})
    private String type;

    @JsonProperty("required")
    @Schema(description = "Whether parameter is required")
    private boolean required;

    @JsonProperty("defaultValue")
    @Schema(description = "Default parameter value")
    private String defaultValue;

    @JsonProperty("validationRules")
    @Schema(description = "Parameter validation rules")
    private Object validationRules;

    @JsonProperty("helpText")
    @Schema(description = "Help text for parameter")
    private String helpText;

    @JsonProperty("order")
    @Schema(description = "Parameter order in function signature")
    private int order;
}