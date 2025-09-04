package com.moneyplant.screener.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity for the screener_result_diff table.
 * Represents the difference between results of two screener runs for a specific symbol.
 * Uses composite primary key (screener_run_id, prev_screener_run_id, symbol).
 */
@Entity
@Table(name = "screener_result_diff")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ScreenerResultDiffId.class)
public class ScreenerResultDiff extends BaseAuditEntity {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_run_id", nullable = false)
    private ScreenerRun screenerRun;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prev_screener_run_id", nullable = false)
    private ScreenerRun prevScreenerRun;

    @Id
    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Column(name = "change_type", nullable = false)
    private String changeType;

    @Column(name = "prev_rank")
    private Integer prevRank;

    @Column(name = "new_rank")
    private Integer newRank;
}
