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
import java.util.List;

/**
 * JPA entity for the screener_alert table.
 * Represents an alert configuration for a screener with delivery channels.
 */
@Entity
@Table(name = "screener_alert")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ScreenerAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false)
    private Screener screener;

    @Column(name = "condition_json", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object conditionJson;

    @ElementCollection
    @CollectionTable(name = "screener_alert_delivery_channels", 
                     joinColumns = @JoinColumn(name = "alert_id"))
    @Column(name = "delivery_channel")
    @Builder.Default
    private List<String> deliveryChannels = List.of("inapp");

    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private Boolean isEnabled = true;

    // Audit fields (manually added since we can't extend BaseAuditEntity with single PK)
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
