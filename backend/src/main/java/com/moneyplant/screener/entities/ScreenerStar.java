package com.moneyplant.screener.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
@IdClass(ScreenerStarId.class)
public class ScreenerStar extends BaseAuditEntity {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false)
    private Screener screener;

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;
}
