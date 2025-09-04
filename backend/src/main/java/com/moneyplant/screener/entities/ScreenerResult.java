package com.moneyplant.screener.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

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
@IdClass(ScreenerResultId.class)
public class ScreenerResult extends BaseAuditEntity {

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
}
