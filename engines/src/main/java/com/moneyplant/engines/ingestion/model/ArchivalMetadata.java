package com.moneyplant.engines.ingestion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Entity for storing archival metadata in the database.
 * Tracks the history of end-of-day archival operations.
 * 
 * Requirements: 11.2
 */
@Entity
@Table(name = "archival_metadata", schema = "public")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivalMetadata {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Date for which archival was performed
     */
    @Column(name = "archival_date", nullable = false, unique = true)
    private LocalDate archivalDate;
    
    /**
     * Number of records archived from TimescaleDB
     */
    @Column(name = "source_record_count", nullable = false)
    private Long sourceRecordCount;
    
    /**
     * Number of records written to Hudi
     */
    @Column(name = "destination_record_count", nullable = false)
    private Long destinationRecordCount;
    
    /**
     * Status of archival operation
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ArchivalStatus status;
    
    /**
     * Timestamp when archival started
     */
    @Column(name = "start_time", nullable = false)
    private Instant startTime;
    
    /**
     * Timestamp when archival completed
     */
    @Column(name = "end_time")
    private Instant endTime;
    
    /**
     * Duration of archival in milliseconds
     */
    @Column(name = "duration_ms")
    private Long durationMs;
    
    /**
     * Error message if archival failed
     */
    @Column(name = "error_message", length = 2000)
    private String errorMessage;
    
    /**
     * Whether data integrity check passed
     */
    @Column(name = "integrity_check_passed")
    private Boolean integrityCheckPassed;
    
    /**
     * Whether intraday table was truncated
     */
    @Column(name = "table_truncated")
    private Boolean tableTruncated;
    
    /**
     * Hudi table path where data was archived
     */
    @Column(name = "hudi_table_path", length = 500)
    private String hudiTablePath;
    
    /**
     * Created timestamp
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    /**
     * Updated timestamp
     */
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    /**
     * Archival status enum
     */
    public enum ArchivalStatus {
        IN_PROGRESS,
        SUCCESS,
        FAILED,
        PARTIAL_SUCCESS
    }
}
