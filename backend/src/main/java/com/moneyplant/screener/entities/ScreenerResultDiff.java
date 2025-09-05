package com.moneyplant.screener.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

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
@EqualsAndHashCode(callSuper = false)
@IdClass(ScreenerResultDiffId.class)
public class ScreenerResultDiff {

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

    // Audit fields (manually added since we can't extend BaseAuditEntity with @IdClass)
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "modified_by")
    private Long modifiedBy;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
