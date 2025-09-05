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
 * JPA entity for the screener_version table.
 * Represents a version of a screener with its engine configuration and compiled SQL.
 */
@Entity
@Table(name = "screener_version", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"screener_id", "version_number"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ScreenerVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screener_version_id")
    private Long screenerVersionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false)
    private Screener screener;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "active";

    @Column(name = "engine", nullable = false)
    @Builder.Default
    private String engine = "sql";

    @Column(name = "dsl_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object dslJson;

    @Column(name = "compiled_sql", columnDefinition = "text")
    private String compiledSql;

    @Column(name = "params_schema_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object paramsSchemaJson;

    // Relationships
    @OneToMany(mappedBy = "screenerVersion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerParamset> paramsets = new ArrayList<>();

    @OneToMany(mappedBy = "screenerVersion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
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
