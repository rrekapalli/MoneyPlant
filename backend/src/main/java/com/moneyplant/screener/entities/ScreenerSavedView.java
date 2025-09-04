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
 * JPA entity for the screener_saved_view table.
 * Represents a user's saved view configuration for a screener.
 */
@Entity
@Table(name = "screener_saved_view",
       uniqueConstraints = @UniqueConstraint(columnNames = {"screener_id", "user_id", "name"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenerSavedView extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saved_view_id")
    private Long savedViewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false)
    private Screener screener;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "table_prefs", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object tablePrefs;
}
