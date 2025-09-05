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

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity for the screener_paramset table.
 * Represents a parameter set for a screener version with specific parameter values.
 */
@Entity
@Table(name = "screener_paramset",
       uniqueConstraints = @UniqueConstraint(columnNames = {"screener_version_id", "name"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ScreenerParamset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "paramset_id")
    private Long paramsetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_version_id", nullable = false)
    private ScreenerVersion screenerVersion;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "params_json", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object paramsJson;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    // Relationships
    @OneToMany(mappedBy = "paramset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerRun> runs = new ArrayList<>();

    // Audit fields (manually added since we can't extend BaseAuditEntity with single PK)
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
