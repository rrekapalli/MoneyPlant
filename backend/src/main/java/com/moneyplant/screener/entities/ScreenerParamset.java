package com.moneyplant.screener.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
public class ScreenerParamset extends BaseAuditEntity {

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
}
