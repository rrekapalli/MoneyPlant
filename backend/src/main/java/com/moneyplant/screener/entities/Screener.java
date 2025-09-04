package com.moneyplant.screener.entities;

import com.moneyplant.core.entities.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity for the screener table.
 * Represents a stock screener with filtering criteria and configuration.
 */
@Entity
@Table(name = "screener")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Screener extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screener_id")
    private Long screenerId;

    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    @Column(name = "default_universe")
    private String defaultUniverse;

    // Relationships
    @OneToMany(mappedBy = "screener", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerVersion> versions = new ArrayList<>();

    @OneToMany(mappedBy = "screener", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerSchedule> schedules = new ArrayList<>();

    @OneToMany(mappedBy = "screener", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerAlert> alerts = new ArrayList<>();

    @OneToMany(mappedBy = "screener", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerRun> runs = new ArrayList<>();

    @OneToMany(mappedBy = "screener", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerStar> stars = new ArrayList<>();

    @OneToMany(mappedBy = "screener", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ScreenerSavedView> savedViews = new ArrayList<>();
}
