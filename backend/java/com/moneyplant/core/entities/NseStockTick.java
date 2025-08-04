package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "nse_stock_tick", schema = "public")
public class NseStockTick {
    @Id
    @Size(max = 255)
    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Column(name = "priority")
    private Integer priority;

    @Size(max = 255)
    @Column(name = "identifier")
    private String identifier;

    @Size(max = 255)
    @Column(name = "series")
    private String series;

    @Column(name = "open_price")
    private Float openPrice;

    @Column(name = "day_high")
    private Float dayHigh;

    @Column(name = "day_low")
    private Float dayLow;

    @Column(name = "last_price")
    private Float lastPrice;

    @Column(name = "previous_close")
    private Float previousClose;

    @Column(name = "price_change")
    private Float priceChange;

    @Column(name = "percent_change")
    private Float percentChange;

    @Column(name = "total_traded_volume")
    private Long totalTradedVolume;

    @Column(name = "stock_ind_close_price")
    private Float stockIndClosePrice;

    @Column(name = "total_traded_value")
    private Float totalTradedValue;

    @Column(name = "year_high")
    private Float yearHigh;

    @Column(name = "ffmc")
    private Float ffmc;

    @Column(name = "year_low")
    private Float yearLow;

    @Column(name = "near_week_high")
    private Float nearWeekHigh;

    @Column(name = "near_week_low")
    private Float nearWeekLow;

    @Column(name = "percent_change_365d")
    private Float percentChange365d;

    @Size(max = 255)
    @Column(name = "date_365d_ago")
    private String date365dAgo;

    @Column(name = "chart_365d_path", length = Integer.MAX_VALUE)
    private String chart365dPath;

    @Size(max = 255)
    @Column(name = "date_30d_ago")
    private String date30dAgo;

    @Column(name = "percent_change_30d")
    private Float percentChange30d;

    @Column(name = "chart_30d_path", length = Integer.MAX_VALUE)
    private String chart30dPath;

    @Column(name = "chart_today_path", length = Integer.MAX_VALUE)
    private String chartTodayPath;

    @Size(max = 255)
    @Column(name = "company_name")
    private String companyName;

    @Size(max = 255)
    @Column(name = "industry")
    private String industry;

    @Column(name = "is_fno_sec")
    private Boolean isFnoSec;

    @Column(name = "is_ca_sec")
    private Boolean isCaSec;

    @Column(name = "is_slb_sec")
    private Boolean isSlbSec;

    @Column(name = "is_debt_sec")
    private Boolean isDebtSec;

    @Column(name = "is_suspended")
    private Boolean isSuspended;

    @Column(name = "is_etf_sec")
    private Boolean isEtfSec;

    @Column(name = "is_delisted")
    private Boolean isDelisted;

    @Size(max = 255)
    @Column(name = "isin")
    private String isin;

    @Size(max = 255)
    @Column(name = "slb_isin")
    private String slbIsin;

    @Size(max = 255)
    @Column(name = "listing_date")
    private String listingDate;

    @Column(name = "is_municipal_bond")
    private Boolean isMunicipalBond;

    @Column(name = "is_hybrid_symbol")
    private Boolean isHybridSymbol;

    @Size(max = 255)
    @Column(name = "equity_time")
    private String equityTime;

    @Size(max = 255)
    @Column(name = "pre_open_time")
    private String preOpenTime;

    @Column(name = "quote_pre_open_flag")
    private Boolean quotePreOpenFlag;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

}