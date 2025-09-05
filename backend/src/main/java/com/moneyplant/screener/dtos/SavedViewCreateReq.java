package com.moneyplant.screener.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new saved view.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new saved view")
public class SavedViewCreateReq {

    @NotBlank(message = "Saved view name is required")
    @Schema(description = "Name of the saved view", example = "My Custom View")
    private String name;

    @Schema(description = "Table preferences JSON object")
    private Object tablePrefs;
}
