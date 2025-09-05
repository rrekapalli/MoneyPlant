package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new parameter set.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new parameter set")
public class ParamsetCreateReq {

    @NotBlank(message = "Parameter set name is required")
    @Schema(description = "Name of the parameter set", example = "Conservative")
    private String name;

    @NotNull(message = "Parameters JSON is required")
    @Schema(description = "Parameters JSON object", example = "{\"rsi_max\": 35, \"pe_max\": 12}")
    private Object paramsJson;
}
