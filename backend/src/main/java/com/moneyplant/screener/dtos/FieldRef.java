package com.moneyplant.screener.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a reference to a field in the criteria DSL.
 * Field references point to specific data columns or calculated fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Reference to a data field")
public class FieldRef {

    @NotBlank(message = "Field name is required")
    @JsonProperty("field")
    @Schema(description = "Name of the field to reference", example = "market_cap")
    private String field;

    @JsonProperty("alias")
    @Schema(description = "Optional alias for the field reference")
    private String alias;

    @JsonProperty("id")
    @Schema(description = "Optional unique identifier for the field reference")
    private String id;
}