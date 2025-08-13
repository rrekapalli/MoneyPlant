package com.moneyplant.engines.common.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entity for storing NSE indices tick data in the nse_indices_ticks table.
 * This table stores real-time data received from NSE WebSocket streams.
 */
@Entity
@Table(name = "nse_indices_ticks", schema = "public", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"index_name", "tick_timestamp"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NseIndicesTick {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    
    @Column(name = "index_name", nullable = false, length = 200)
    private String indexName;
    
    @Column(name = "index_symbol", length = 100)
    private String indexSymbol;
    
    @Column(name = "last_price", precision = 15, scale = 4)
    private BigDecimal lastPrice;
    
    @Column(name = "variation", precision = 15, scale = 4)
    private BigDecimal variation;
    
    @Column(name = "percent_change", precision = 10, scale = 4)
    private BigDecimal percentChange;
    
    @Column(name = "open_price", precision = 15, scale = 4)
    private BigDecimal openPrice;
    
    @Column(name = "day_high", precision = 15, scale = 4)
    private BigDecimal dayHigh;
    
    @Column(name = "day_low", precision = 15, scale = 4)
    private BigDecimal dayLow;
    
    @Column(name = "previous_close", precision = 15, scale = 4)
    private BigDecimal previousClose;
    
    @Column(name = "year_high", precision = 15, scale = 4)
    private BigDecimal yearHigh;
    
    @Column(name = "year_low", precision = 15, scale = 4)
    private BigDecimal yearLow;
    
    @Column(name = "indicative_close", precision = 15, scale = 4)
    private BigDecimal indicativeClose;
    
    @Column(name = "pe_ratio", precision = 10, scale = 4)
    private BigDecimal peRatio;
    
    @Column(name = "pb_ratio", precision = 10, scale = 4)
    private BigDecimal pbRatio;
    
    @Column(name = "dividend_yield", precision = 10, scale = 4)
    private BigDecimal dividendYield;
    
    @Column(name = "declines")
    private Integer declines;
    
    @Column(name = "advances")
    private Integer advances;
    
    @Column(name = "unchanged")
    private Integer unchanged;
    
    @Column(name = "percent_change_365d", precision = 10, scale = 4)
    private BigDecimal percentChange365d;
    
    @Column(name = "date_365d_ago", length = 50)
    private String date365dAgo;
    
    @Column(name = "chart_365d_path", length = 500)
    private String chart365dPath;
    
    @Column(name = "date_30d_ago", length = 50)
    private String date30dAgo;
    
    @Column(name = "percent_change_30d", precision = 10, scale = 4)
    private BigDecimal percentChange30d;
    
    @Column(name = "chart_30d_path", length = 500)
    private String chart30dPath;
    
    @Column(name = "chart_today_path", length = 500)
    private String chartTodayPath;
    
    @Column(name = "market_status", length = 50)
    private String marketStatus;
    
    @Column(name = "market_status_message", length = 500)
    private String marketStatusMessage;
    
    @Column(name = "trade_date", length = 50)
    private String tradeDate;
    
    @Column(name = "market_status_time", length = 50)
    private String marketStatusTime;
    
    @Column(name = "tick_timestamp", nullable = false)
    private Instant tickTimestamp;
    
    @Column(name = "created_by", length = 36)
    @ColumnDefault("'System'")
    private String createdBy;
    
    @Column(name = "created_on")
    @ColumnDefault("CURRENT_TIMESTAMP")
    private Instant createdOn;
    
    @Column(name = "modified_by", length = 36)
    @ColumnDefault("'System'")
    private String modifiedBy;
    
    @Column(name = "modified_on")
    @ColumnDefault("CURRENT_TIMESTAMP")
    private Instant modifiedOn;
    
    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdOn = now;
        modifiedOn = now;
        if (tickTimestamp == null) {
            tickTimestamp = now;
        }
        if (createdBy == null) {
            createdBy = "System";
        }
        if (modifiedBy == null) {
            modifiedBy = "System";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        modifiedOn = Instant.now();
        if (modifiedBy == null) {
            modifiedBy = "System";
        }
    }
}
