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

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity for the screener_run table.
 * Represents an execution run of a screener with results and status.
 */
@Entity
@Table(name = "screener_run")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ScreenerRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screener_run_id")
    private Long screenerRunId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false)
    private Screener screener;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_version_id", nullable = false)
    private ScreenerVersion screenerVersion;

    @Column(name = "triggered_by_user_id")
    private Long triggeredByUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paramset_id")
    private ScreenerParamset paramset;

    @Column(name = "params_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object paramsJson;

    @Column(name = "universe_snapshot", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object universeSnapshot;

    @Column(name = "run_for_trading_day")
    private LocalDate runForTradingDay;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private OffsetDateTime startedAt = OffsetDateTime.now();

    @Column(name = "finished_at")
    private OffsetDateTime finishedAt;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "running";

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "total_candidates")
    private Integer totalCandidates;

    @Column(name = "total_matches")
    private Integer totalMatches;

    // Relationships
    @OneToMany(mappedBy = "screenerRun", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerResult> results = new ArrayList<>();

    @OneToMany(mappedBy = "screenerRun", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerResultDiff> resultDiffs = new ArrayList<>();

    // Audit fields (manually added since we can't extend BaseAuditEntity with single PK)
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

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
