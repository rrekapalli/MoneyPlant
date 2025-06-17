package com.moneyplant.core.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldNameConstants;

import java.sql.Timestamp;

/**
 * Base audit entity class that extends BaseEntity and provides auditing fields.
 * This class includes fields for tracking who created and modified the entity and when.
 */
@MappedSuperclass
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public abstract class BaseAuditEntity extends BaseEntity {
    /**
     * Default user for audit purposes when no specific user is available
     */
    private static final String SYSTEM_USER = "System";

    @Column(nullable = false, length = 36)
    private String createdBy;

    @Column(nullable = false, length = 36)
    private String modifiedBy;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Timestamp createdOn;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Timestamp modifiedOn;

    /**
     * Sets creation date and user before insert.
     * Uses the system user as the default.
     */
    @PrePersist
    public void setCreationDate() {
        long now = System.currentTimeMillis();
        this.createdOn = new Timestamp(now);
        this.modifiedOn = new Timestamp(now);
        this.createdBy = SYSTEM_USER;
        this.modifiedBy = SYSTEM_USER;
    }

    /**
     * Sets modified date and user before update.
     * Uses the system user as the default.
     */
    @PreUpdate
    public void setModifiedDate() {
        long now = System.currentTimeMillis();
        this.modifiedOn = new Timestamp(now);
        this.modifiedBy = SYSTEM_USER;
    }
}
