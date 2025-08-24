package com.moneyplant.core.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "nse_idx_master", schema = "public")
public class Index implements Serializable  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 200)
    @Column(name = "key_category", length = 200)
    private String keyCategory;

    @Size(max = 200)
    @Column(name = "index_name", length = 200)
    private String indexName;

    @Size(max = 200)
    @Column(name = "index_symbol", length = 200)
    private String indexSymbol;

    @Column(name = "last_price")
    private Float lastPrice;

    @Column(name = "variation")
    private Float variation;

    @Column(name = "percent_change")
    private Float percentChange;

    @Column(name = "open_price")
    private Float openPrice;

    @Column(name = "high_price")
    private Float highPrice;

    @Column(name = "low_price")
    private Float lowPrice;

    @Column(name = "previous_close")
    private Float previousClose;

    @Column(name = "year_high")
    private Float yearHigh;

    @Column(name = "year_low")
    private Float yearLow;

    @Column(name = "indicative_close")
    private Float indicativeClose;

    @Column(name = "pe_ratio")
    private Float peRatio;

    @Column(name = "pb_ratio")
    private Float pbRatio;

    @Column(name = "dividend_yield")
    private Float dividendYield;

    @Column(name = "declines")
    private Integer declines;

    @Column(name = "advances")
    private Integer advances;

    @Column(name = "unchanged")
    private Integer unchanged;

    @Column(name = "percent_change_365d")
    private Float percentChange365d;

    @Size(max = 200)
    @Column(name = "date_365d_ago", length = 200)
    private String date365dAgo;

    @Column(name = "chart_365d_path", length = Integer.MAX_VALUE)
    private String chart365dPath;

    @Size(max = 200)
    @Column(name = "date_30d_ago", length = 200)
    private String date30dAgo;

    @Column(name = "percent_change_30d")
    private Float percentChange30d;

    @Column(name = "chart_30d_path", length = Integer.MAX_VALUE)
    private String chart30dPath;

    @Column(name = "chart_today_path", length = Integer.MAX_VALUE)
    private String chartTodayPath;

    @Column(name = "previous_day", precision = 12, scale = 2)
    private BigDecimal previousDay;

    @Column(name = "one_week_ago", precision = 12, scale = 2)
    private BigDecimal oneWeekAgo;

    @Column(name = "one_month_ago", precision = 12, scale = 2)
    private BigDecimal oneMonthAgo;

    @Column(name = "one_year_ago", precision = 12, scale = 2)
    private BigDecimal oneYearAgo;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}