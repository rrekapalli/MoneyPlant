package com.moneyplant.screener.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Composite primary key for ScreenerResultDiff entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreenerResultDiffId implements Serializable {

    private Long screenerRun;
    private Long prevScreenerRun;
    private String symbol;
}
