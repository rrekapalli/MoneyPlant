package com.moneyplant.scanner.entities;

import com.moneyplant.core.entities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity representing a market scanner configuration.
 */
@Entity
@Table(name = "market_scanners")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketScanner extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScannerType type;
    
    @ElementCollection
    @CollectionTable(name = "scanner_criteria", joinColumns = @JoinColumn(name = "scanner_id"))
    @Column(name = "criterion")
    private List<String> criteria;
    
    @Column
    private String market;
    
    @Column
    private String sector;
    
    @Column
    private Boolean isActive;
    
    @Column
    private LocalDateTime lastRun;
    
    @Column
    private Integer scanIntervalMinutes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScannerStatus status;
    
    public enum ScannerType {
        TECHNICAL, FUNDAMENTAL, VOLUME, MOMENTUM, VOLATILITY
    }
    
    public enum ScannerStatus {
        ACTIVE, PAUSED, DISABLED
    }
}
