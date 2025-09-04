package com.moneyplant.screener.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * JPA entity for the screener_result table.
 * Represents a result entry for a specific symbol in a screener run.
 * Uses composite primary key (screener_run_id, symbol).
 */
@Entity
@Table(name = "screener_result")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@IdClass(ScreenerResultId.class)
public class ScreenerResult {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_run_id", nullable = false)
    private ScreenerRun screenerRun;

    @Id
    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Column(name = "matched", nullable = false)
    private Boolean matched;

    @Column(name = "score_0_1", precision = 6, scale = 4)
    private BigDecimal score0To1;

    @Column(name = "rank_in_run")
    private Integer rankInRun;

    @Column(name = "metrics_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object metricsJson;

    @Column(name = "reason_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object reasonJson;

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
