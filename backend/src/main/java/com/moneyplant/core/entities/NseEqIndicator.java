package com.moneyplant.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "nse_eq_indicators", schema = "public")
public class NseEqIndicator {
    @EmbeddedId
    private NseEqIndicatorId id;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "sma_5")
    private Double sma5;

    @Column(name = "sma_10")
    private Double sma10;

    @Column(name = "sma_20")
    private Double sma20;

    @Column(name = "sma_50")
    private Double sma50;

    @Column(name = "sma_100")
    private Double sma100;

    @Column(name = "sma_200")
    private Double sma200;

    @Column(name = "ema_5")
    private Double ema5;

    @Column(name = "ema_10")
    private Double ema10;

    @Column(name = "ema_20")
    private Double ema20;

    @Column(name = "ema_50")
    private Double ema50;

    @Column(name = "wma_5")
    private Double wma5;

    @Column(name = "wma_10")
    private Double wma10;

    @Column(name = "wma_20")
    private Double wma20;

    @Column(name = "hma_20")
    private Double hma20;

    @Column(name = "tema_20")
    private Double tema20;

    @Column(name = "kama_20")
    private Double kama20;

    @Column(name = "rsi_14")
    private Double rsi14;

    @Column(name = "macd_line")
    private Double macdLine;

    @Column(name = "macd_signal")
    private Double macdSignal;

    @Column(name = "macd_histogram")
    private Double macdHistogram;

    @Column(name = "bb_upper_20")
    private Double bbUpper20;

    @Column(name = "bb_middle_20")
    private Double bbMiddle20;

    @Column(name = "bb_lower_20")
    private Double bbLower20;

    @Column(name = "bb_width_20")
    private Double bbWidth20;

    @Column(name = "bb_percent_b_20")
    private Double bbPercentB20;

    @Column(name = "stoch_k_14")
    private Double stochK14;

    @Column(name = "stoch_d_14")
    private Double stochD14;

    @Column(name = "atr_14")
    private Double atr14;

    @Column(name = "williams_r_14")
    private Double williamsR14;

    @Column(name = "cci_20")
    private Double cci20;

    @Column(name = "mfi_14")
    private Double mfi14;

    @Column(name = "obv")
    private Double obv;

    @Column(name = "roc_10")
    private Double roc10;

    @Column(name = "roc_20")
    private Double roc20;

    @Column(name = "proc_10")
    private Double proc10;

    @Column(name = "proc_20")
    private Double proc20;

    @Column(name = "vroc_10")
    private Double vroc10;

    @Column(name = "vroc_20")
    private Double vroc20;

    @Column(name = "parabolic_sar")
    private Double parabolicSar;

    @Column(name = "adx_14")
    private Double adx14;

    @Column(name = "di_plus_14")
    private Double diPlus14;

    @Column(name = "di_minus_14")
    private Double diMinus14;

    @Column(name = "ichimoku_tenkan")
    private Double ichimokuTenkan;

    @Column(name = "ichimoku_kijun")
    private Double ichimokuKijun;

    @Column(name = "ichimoku_senkou_span_a")
    private Double ichimokuSenkouSpanA;

    @Column(name = "ichimoku_senkou_span_b")
    private Double ichimokuSenkouSpanB;

    @Column(name = "ichimoku_chikou_span")
    private Double ichimokuChikouSpan;

    @Column(name = "fib_0_236")
    private Double fib0236;

    @Column(name = "fib_0_382")
    private Double fib0382;

    @Column(name = "fib_0_500")
    private Double fib0500;

    @Column(name = "fib_0_618")
    private Double fib0618;

    @Column(name = "fib_0_786")
    private Double fib0786;

    @Column(name = "support_level_1")
    private Double supportLevel1;

    @Column(name = "support_level_2")
    private Double supportLevel2;

    @Column(name = "resistance_level_1")
    private Double resistanceLevel1;

    @Column(name = "resistance_level_2")
    private Double resistanceLevel2;

    @Column(name = "volatility_20")
    private Double volatility20;

    @Column(name = "volatility_50")
    private Double volatility50;

    @Column(name = "momentum_10")
    private Double momentum10;

    @Column(name = "momentum_20")
    private Double momentum20;

    @Column(name = "volume_sma_20")
    private Double volumeSma20;

    @Column(name = "volume_ema_20")
    private Double volumeEma20;

    @Column(name = "volume_ratio")
    private Double volumeRatio;

    @Column(name = "price_position_bb")
    private Double pricePositionBb;

    @Column(name = "price_trend_20")
    private Double priceTrend20;

    @Column(name = "sma_30")
    private Double sma30;

    @Column(name = "ema_30")
    private Double ema30;

    @Column(name = "wma_30")
    private Double wma30;

    @Column(name = "rsi_21")
    private Double rsi21;

    @Column(name = "rsi_50")
    private Double rsi50;

    @Column(name = "macd_12_26_9")
    private Double macd12269;

    @Column(name = "bb_upper_50")
    private Double bbUpper50;

    @Column(name = "bb_middle_50")
    private Double bbMiddle50;

    @Column(name = "bb_lower_50")
    private Double bbLower50;

    @Column(name = "bb_width_50")
    private Double bbWidth50;

    @Column(name = "bb_percent_b_50")
    private Double bbPercentB50;

    @Column(name = "stoch_k_21")
    private Double stochK21;

    @Column(name = "stoch_d_21")
    private Double stochD21;

    @Column(name = "atr_21")
    private Double atr21;

    @Column(name = "atr_50")
    private Double atr50;

    @Column(name = "williams_r_21")
    private Double williamsR21;

    @Column(name = "williams_r_50")
    private Double williamsR50;

    @Column(name = "cci_14")
    private Double cci14;

    @Column(name = "cci_50")
    private Double cci50;

    @Column(name = "mfi_21")
    private Double mfi21;

    @Column(name = "mfi_50")
    private Double mfi50;

    @Column(name = "roc_5")
    private Double roc5;

    @Column(name = "roc_30")
    private Double roc30;

    @Column(name = "proc_5")
    private Double proc5;

    @Column(name = "proc_30")
    private Double proc30;

    @Column(name = "vroc_5")
    private Double vroc5;

    @Column(name = "vroc_30")
    private Double vroc30;

    @Column(name = "adx_21")
    private Double adx21;

    @Column(name = "adx_50")
    private Double adx50;

    @Column(name = "di_plus_21")
    private Double diPlus21;

    @Column(name = "di_minus_21")
    private Double diMinus21;

    @Column(name = "di_plus_50")
    private Double diPlus50;

    @Column(name = "di_minus_50")
    private Double diMinus50;

    @Column(name = "volume_sma_50")
    private Double volumeSma50;

    @Column(name = "volume_ema_50")
    private Double volumeEma50;

    @Column(name = "cmf_14")
    private Double cmf14;

    @Column(name = "cmf_50")
    private Double cmf50;

    @Column(name = "vwap_50")
    private Double vwap50;

    @Column(name = "eom_14")
    private Double eom14;

    @Column(name = "eom_50")
    private Double eom50;

    @Column(name = "keltner_14")
    private Double keltner14;

    @Column(name = "keltner_50")
    private Double keltner50;

    @Column(name = "std_dev_14")
    private Double stdDev14;

    @Column(name = "std_dev_50")
    private Double stdDev50;

    @Column(name = "chaikin_vol_14")
    private Double chaikinVol14;

    @Column(name = "chaikin_vol_50")
    private Double chaikinVol50;

    @Column(name = "trend_strength_14")
    private Double trendStrength14;

    @Column(name = "trend_strength_50")
    private Double trendStrength50;

    @Column(name = "dm_21")
    private Double dm21;

    @Column(name = "dm_50")
    private Double dm50;

    @Column(name = "custom_indicator_1")
    private Double customIndicator1;

    @Column(name = "custom_indicator_2")
    private Double customIndicator2;

    @Column(name = "custom_indicator_3")
    private Double customIndicator3;

    @Column(name = "sma_14")
    private Double sma14;

    @Column(name = "macd_12_26_d")
    private Double macd1226D;

    @Column(name = "dm_30")
    private Double dm30;

    @Column(name = "macd_rsi_combo")
    private Double macdRsiCombo;

    @Column(name = "macd_adx_combo")
    private Double macdAdxCombo;

    @Column(name = "ema_cross_rsi_filter")
    private Double emaCrossRsiFilter;

    @Column(name = "ema_ribbon_rsi")
    private Double emaRibbonRsi;

    @Column(name = "sar_macd_alignment")
    private Double sarMacdAlignment;

    @Column(name = "adx_cci_combo")
    private Double adxCciCombo;

    @Column(name = "rsi_atr_breakout")
    private Double rsiAtrBreakout;

    @Column(name = "rsi_obv_alignment")
    private Double rsiObvAlignment;

    @Column(name = "macd_hist_vol_delta")
    private Double macdHistVolDelta;

    @Column(name = "cmf_rsi_combo")
    private Double cmfRsiCombo;

    @Column(name = "bb_rsi_reversal")
    private Double bbRsiReversal;

    @Column(name = "bb_macd_trend_breakout")
    private Double bbMacdTrendBreakout;

    @Column(name = "squeeze_bb_keltner")
    private Double squeezeBbKeltner;

    @Column(name = "atr_ema_breakout")
    private Double atrEmaBreakout;

    @Column(name = "adx_atr_trend")
    private Double adxAtrTrend;

    @Column(name = "stoch_bb_reversal")
    private Double stochBbReversal;

    @Column(name = "williams_bb_reversal")
    private Double williamsBbReversal;

    @Column(name = "ema_obv_confirmation")
    private Double emaObvConfirmation;

    @Column(name = "vwap_obv_intraday")
    private Double vwapObvIntraday;

    @Column(name = "darvas_box_volume")
    private Double darvasBoxVolume;

    @Column(name = "canslim_technical")
    private Double canslimTechnical;

    @Column(name = "triple_screen_system")
    private Double tripleScreenSystem;

    @Column(name = "vam_ratio")
    private Double vamRatio;

    @Column(name = "zscore_fusion")
    private Double zscoreFusion;

    @Column(name = "weighted_multi_factor")
    private Double weightedMultiFactor;

    @Column(name = "candle_rsi_bb")
    private Double candleRsiBb;

    @Column(name = "volume_weighted_trend_score")
    private Double volumeWeightedTrendScore;

    @Column(name = "composite_updated_at")
    private Instant compositeUpdatedAt;

    @Column(name = "volume_sma_10")
    private Double volumeSma10;

    @Column(name = "volume_sma_30")
    private Double volumeSma30;

    @Column(name = "volume_ema_10")
    private Double volumeEma10;

    @Column(name = "volume_ema_30")
    private Double volumeEma30;

    @Column(name = "cmf_21")
    private Double cmf21;

    @Column(name = "vpt")
    private Double vpt;

    @Column(name = "keltner_upper_14")
    private Double keltnerUpper14;

    @Column(name = "keltner_middle_14")
    private Double keltnerMiddle14;

    @Column(name = "keltner_lower_14")
    private Double keltnerLower14;

    @Column(name = "keltner_upper_20")
    private Double keltnerUpper20;

    @Column(name = "keltner_middle_20")
    private Double keltnerMiddle20;

    @Column(name = "keltner_lower_20")
    private Double keltnerLower20;

    @Column(name = "keltner_upper_50")
    private Double keltnerUpper50;

    @Column(name = "keltner_middle_50")
    private Double keltnerMiddle50;

    @Column(name = "keltner_lower_50")
    private Double keltnerLower50;

    @Column(name = "typical_price")
    private Double typicalPrice;

    @Column(name = "mf_multiplier")
    private Double mfMultiplier;

    @Column(name = "mf_volume")
    private Double mfVolume;

    @Column(name = "tr")
    private Double tr;

    @Column(name = "dm_plus")
    private Double dmPlus;

    @Column(name = "dm_minus")
    private Double dmMinus;

}