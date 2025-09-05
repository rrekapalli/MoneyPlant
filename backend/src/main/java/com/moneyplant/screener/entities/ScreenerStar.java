package com.moneyplant.screener.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * JPA entity for the screener_star table.
 * Represents a user's star/favorite relationship with a screener.
 * Uses composite primary key (screener_id, user_id).
 */
@Entity
@Table(name = "screener_star")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@IdClass(ScreenerStarId.class)
public class ScreenerStar {

    @Id
    @Column(name = "screener_id", nullable = false)
    private Long screenerId;

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

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
