package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "nse_eq_master", schema = "public")
public class NseEquityMaster implements Serializable {
    @Id
    @Size(max = 255)
    @Column(name = "symbol")
    private String symbol;

    @Size(max = 255)
    @Column(name = "company_name")
    private String companyName;

    @Size(max = 255)
    @Column(name = "industry")
    private String industry;

    @Size(max = 255)
    @Column(name = "is_fno_sec")
    private String isFnoSec;

    @Size(max = 255)
    @Column(name = "is_ca_sec")
    private String isCaSec;

    @Size(max = 255)
    @Column(name = "is_slb_sec")
    private String isSlbSec;

    @Size(max = 255)
    @Column(name = "is_debt_sec")
    private String isDebtSec;

    @Size(max = 255)
    @Column(name = "is_suspended")
    private String isSuspended;

    @Size(max = 255)
    @Column(name = "is_etf_sec")
    private String isEtfSec;

    @Size(max = 255)
    @Column(name = "is_delisted")
    private String isDelisted;

    @Size(max = 255)
    @Column(name = "isin")
    private String isin;

    @Size(max = 255)
    @Column(name = "slb_isin")
    private String slbIsin;

    @Size(max = 255)
    @Column(name = "listing_date")
    private String listingDate;

    @Size(max = 255)
    @Column(name = "is_municipal_bond")
    private String isMunicipalBond;

    @Size(max = 255)
    @Column(name = "is_hybrid_symbol")
    private String isHybridSymbol;

    @Size(max = 255)
    @Column(name = "is_top10")
    private String isTop10;

    @Size(max = 255)
    @Column(name = "identifier")
    private String identifier;

    @Size(max = 255)
    @Column(name = "series")
    private String series;

    @Size(max = 255)
    @Column(name = "status")
    private String status;

    @Size(max = 255)
    @Column(name = "last_update_time")
    private String lastUpdateTime;

    @Column(name = "pd_sector_pe")
    private Float pdSectorPe;

    @Column(name = "pd_symbol_pe")
    private Float pdSymbolPe;

    @Size(max = 255)
    @Column(name = "pd_sector_ind")
    private String pdSectorInd;

    @Size(max = 255)
    @Column(name = "board_status")
    private String boardStatus;

    @Size(max = 255)
    @Column(name = "trading_status")
    private String tradingStatus;

    @Size(max = 255)
    @Column(name = "trading_segment")
    private String tradingSegment;

    @Size(max = 255)
    @Column(name = "session_no")
    private String sessionNo;

    @Size(max = 255)
    @Column(name = "slb")
    private String slb;

    @Size(max = 255)
    @Column(name = "class_of_share")
    private String classOfShare;

    @Size(max = 255)
    @Column(name = "derivatives")
    private String derivatives;

    @Size(max = 255)
    @Column(name = "surveillance_surv")
    private String surveillanceSurv;

    @Size(max = 255)
    @Column(name = "surveillance_desc")
    private String surveillanceDesc;

    @Column(name = "face_value")
    private Float faceValue;

    @Column(name = "issued_size")
    private Float issuedSize;

    @Size(max = 255)
    @Column(name = "sdd_auditor")
    private String sddAuditor;

    @Size(max = 255)
    @Column(name = "sdd_status")
    private String sddStatus;

    @Size(max = 255)
    @Column(name = "current_market_type")
    private String currentMarketType;

    @Column(name = "last_price")
    private Float lastPrice;

    @Column(name = "change")
    private Float change;

    @Column(name = "p_change")
    private Float pChange;

    @Column(name = "previous_close")
    private Float previousClose;

    @Column(name = "open")
    private Float open;

    @Column(name = "close")
    private Float close;

    @Column(name = "vwap")
    private Float vwap;

    @Column(name = "stock_ind_close_price")
    private Float stockIndClosePrice;

    @Size(max = 255)
    @Column(name = "lower_cp")
    private String lowerCp;

    @Size(max = 255)
    @Column(name = "upper_cp")
    private String upperCp;

    @Size(max = 255)
    @Column(name = "p_price_band")
    private String pPriceBand;

    @Column(name = "base_price")
    private Float basePrice;

    @Column(name = "intra_day_high_low_min")
    private Float intraDayHighLowMin;

    @Column(name = "intra_day_high_low_max")
    private Float intraDayHighLowMax;

    @Column(name = "intra_day_high_low_value")
    private Float intraDayHighLowValue;

    @Column(name = "week_high_low_min")
    private Float weekHighLowMin;

    @Size(max = 255)
    @Column(name = "week_high_low_min_date")
    private String weekHighLowMinDate;

    @Column(name = "week_high_low_max")
    private Float weekHighLowMax;

    @Size(max = 255)
    @Column(name = "week_high_low_max_date")
    private String weekHighLowMaxDate;

    @Column(name = "i_nav_value")
    private Float iNavValue;

    @Size(max = 255)
    @Column(name = "check_inav")
    private String checkInav;

    @Column(name = "tick_size")
    private Float tickSize;

    @Size(max = 255)
    @Column(name = "ieq")
    private String ieq;

    @Size(max = 255)
    @Column(name = "macro")
    private String macro;

    @Size(max = 255)
    @Column(name = "sector")
    private String sector;

    @Size(max = 255)
    @Column(name = "basic_industry")
    private String basicIndustry;

    @Column(name = "ato_buy")
    private Float atoBuy;

    @Column(name = "ato_sell")
    private Float atoSell;

    @Column(name = "iep")
    private Float iep;

    @Column(name = "total_traded_volume")
    private Float totalTradedVolume;

    @Column(name = "final_price")
    private Float finalPrice;

    @Column(name = "final_quantity")
    private Float finalQuantity;

    @Size(max = 255)
    @Column(name = "pre_open_last_update_time")
    private String preOpenLastUpdateTime;

    @Column(name = "total_buy_quantity")
    private Float totalBuyQuantity;

    @Column(name = "total_sell_quantity")
    private Float totalSellQuantity;

    @Column(name = "ato_buy_qty")
    private Float atoBuyQty;

    @Column(name = "ato_sell_qty")
    private Float atoSellQty;

    @Column(name = "pre_open_change")
    private Float preOpenChange;

    @Column(name = "per_change")
    private Float perChange;

    @Column(name = "prev_close")
    private Float prevClose;

}