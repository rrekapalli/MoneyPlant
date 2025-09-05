package com.moneyplant.screener.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Composite primary key for ScreenerResult entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreenerResultId implements Serializable {

    private Long screenerRun;
    private String symbol;
}
