package com.moneyplant.core.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "nse_idx_ticks", schema = "public")
public class NseIdxTick {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "advances")
    private Integer advances;

    @Column(name = "day_high", precision = 15, scale = 4)
    private BigDecimal dayHigh;

    @Column(name = "day_low", precision = 15, scale = 4)
    private BigDecimal dayLow;

    @Column(name = "declines")
    private Integer declines;

    @Column(name = "dividend_yield", precision = 10, scale = 4)
    private BigDecimal dividendYield;

    @Column(name = "indicative_close", precision = 15, scale = 4)
    private BigDecimal indicativeClose;

    @Column(name = "last_price", precision = 15, scale = 4)
    private BigDecimal lastPrice;

    @Column(name = "open_price", precision = 15, scale = 4)
    private BigDecimal openPrice;

    @Column(name = "pb_ratio", precision = 10, scale = 4)
    private BigDecimal pbRatio;

    @Column(name = "pe_ratio", precision = 10, scale = 4)
    private BigDecimal peRatio;

    @Column(name = "percent_change", precision = 10, scale = 4)
    private BigDecimal percentChange;

    @Column(name = "percent_change_30d", precision = 10, scale = 4)
    private BigDecimal percentChange30d;

    @Column(name = "percent_change_365d", precision = 10, scale = 4)
    private BigDecimal percentChange365d;

    @Column(name = "previous_close", precision = 15, scale = 4)
    private BigDecimal previousClose;

    @Column(name = "unchanged")
    private Integer unchanged;

    @Column(name = "variation", precision = 15, scale = 4)
    private BigDecimal variation;

    @Column(name = "year_high", precision = 15, scale = 4)
    private BigDecimal yearHigh;

    @Column(name = "year_low", precision = 15, scale = 4)
    private BigDecimal yearLow;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_on")
    private OffsetDateTime createdOn;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "modified_on")
    private OffsetDateTime modifiedOn;

    @NotNull
    @Column(name = "tick_timestamp", nullable = false)
    private OffsetDateTime tickTimestamp;

    @Size(max = 36)
    @ColumnDefault("'System'")
    @Column(name = "created_by", length = 36)
    private String createdBy;

    @Size(max = 36)
    @ColumnDefault("'System'")
    @Column(name = "modified_by", length = 36)
    private String modifiedBy;

    @Size(max = 50)
    @Column(name = "date_30d_ago", length = 50)
    private String date30dAgo;

    @Size(max = 50)
    @Column(name = "date_365d_ago", length = 50)
    private String date365dAgo;

    @Size(max = 50)
    @Column(name = "market_status", length = 50)
    private String marketStatus;

    @Size(max = 50)
    @Column(name = "market_status_time", length = 50)
    private String marketStatusTime;

    @Size(max = 50)
    @Column(name = "trade_date", length = 50)
    private String tradeDate;

    @Size(max = 100)
    @Column(name = "index_symbol", length = 100)
    private String indexSymbol;

    @Size(max = 200)
    @NotNull
    @Column(name = "index_name", nullable = false, length = 200)
    private String indexName;

    @Size(max = 500)
    @Column(name = "chart_30d_path", length = 500)
    private String chart30dPath;

    @Size(max = 500)
    @Column(name = "chart_365d_path", length = 500)
    private String chart365dPath;

    @Size(max = 500)
    @Column(name = "chart_today_path", length = 500)
    private String chartTodayPath;

    @Size(max = 500)
    @Column(name = "market_status_message", length = 500)
    private String marketStatusMessage;

}