package com.moneyplant.screener.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Composite primary key for ScreenerStar entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreenerStarId implements Serializable {

    private Long screener;
    private Long userId;
}
