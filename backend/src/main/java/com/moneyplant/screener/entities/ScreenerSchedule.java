package com.moneyplant.screener.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity for the screener_schedule table.
 * Represents a scheduled execution configuration for a screener.
 */
@Entity
@Table(name = "screener_schedule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenerSchedule extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false)
    private Screener screener;

    @Column(name = "cron_expr", nullable = false)
    private String cronExpr;

    @Column(name = "timezone", nullable = false)
    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private Boolean isEnabled = true;
}
