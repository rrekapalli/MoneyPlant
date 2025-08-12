package com.moneyplant.engines.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Strategy entity for storing trading strategy definitions
 */
@Entity
@Table(name = "strategies", indexes = {
    @Index(name = "idx_name", columnList = "name"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Strategy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "strategy_type", length = 50)
    private String strategyType;

    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters;

    @Column(name = "entry_rules", columnDefinition = "TEXT")
    private String entryRules;

    @Column(name = "exit_rules", columnDefinition = "TEXT")
    private String exitRules;

    @Column(name = "risk_management", columnDefinition = "TEXT")
    private String riskManagement;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "version", length = 20)
    private String version;

    @Column(name = "author", length = 100)
    private String author;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
