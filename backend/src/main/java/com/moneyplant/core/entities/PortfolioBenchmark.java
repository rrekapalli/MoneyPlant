package com.moneyplant.core.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "portfolio_benchmarks", schema = "public")
public class PortfolioBenchmark {
    @EmbeddedId
    private PortfolioBenchmarkId id;

    @MapsId("portfolioId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @MapsId("indexName")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "index_name", nullable = false, referencedColumnName = "index_name")
    private Index indexName;

    @NotNull
    @ColumnDefault("1.0")
    @Column(name = "weight_pct", nullable = false, precision = 10, scale = 6)
    private BigDecimal weightPct;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

}