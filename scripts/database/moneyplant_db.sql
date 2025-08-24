-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP SEQUENCE public.nse_idx_master_id_seq;

CREATE SEQUENCE public.nse_idx_master_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    START 1
    CACHE 1
    NO CYCLE;
-- DROP SEQUENCE public.nse_idx_master_id_seq1;

CREATE SEQUENCE public.nse_idx_master_id_seq1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    START 1
    CACHE 1
    NO CYCLE;
-- DROP SEQUENCE public.nse_idx_ticks_id_seq;

CREATE SEQUENCE public.nse_idx_ticks_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1
    NO CYCLE;
-- DROP SEQUENCE public.nse_idx_ticks_id_seq1;

CREATE SEQUENCE public.nse_idx_ticks_id_seq1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1
    NO CYCLE;
-- DROP SEQUENCE public.nse_performance_metrics_id_seq;

CREATE SEQUENCE public.nse_performance_metrics_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    START 1
    CACHE 1
    NO CYCLE;
-- DROP SEQUENCE public.nse_performance_metrics_id_seq1;

CREATE SEQUENCE public.nse_performance_metrics_id_seq1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    START 1
    CACHE 1
    NO CYCLE;
-- DROP SEQUENCE public.users_id_seq;

CREATE SEQUENCE public.users_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1
    NO CYCLE;
-- DROP SEQUENCE public.users_id_seq1;

CREATE SEQUENCE public.users_id_seq1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1
    NO CYCLE;-- public.event_publication definition

-- Drop table

-- DROP TABLE public.event_publication;

CREATE TABLE public.event_publication (
                                          completion_date timestamptz(6) NULL,
                                          publication_date timestamptz(6) NULL,
                                          id uuid NOT NULL,
                                          event_type varchar(255) NULL,
                                          listener_id varchar(255) NULL,
                                          serialized_event varchar(255) NULL,
                                          CONSTRAINT event_publication_pkey PRIMARY KEY (id)
);


-- public.nse_eq_indicators definition

-- Drop table

-- DROP TABLE public.nse_eq_indicators;

CREATE TABLE public.nse_eq_indicators (
                                          symbol text NOT NULL, -- Stock symbol (e.g., INFY, RELIANCE)
                                          "date" date NOT NULL, -- Trading date
                                          created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                          updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                          sma_5 float8 NULL, -- 5-day Simple Moving Average
                                          sma_10 float8 NULL,
                                          sma_20 float8 NULL,
                                          sma_50 float8 NULL,
                                          sma_100 float8 NULL,
                                          sma_200 float8 NULL,
                                          ema_5 float8 NULL,
                                          ema_10 float8 NULL,
                                          ema_20 float8 NULL,
                                          ema_50 float8 NULL,
                                          wma_5 float8 NULL,
                                          wma_10 float8 NULL,
                                          wma_20 float8 NULL,
                                          hma_20 float8 NULL,
                                          tema_20 float8 NULL,
                                          kama_20 float8 NULL,
                                          rsi_14 float8 NULL, -- 14-period Relative Strength Index
                                          macd_line float8 NULL, -- MACD line (12-26 EMA difference)
                                          macd_signal float8 NULL,
                                          macd_histogram float8 NULL,
                                          bb_upper_20 float8 NULL, -- Bollinger Band Upper (20 SMA + 2*StdDev)
                                          bb_middle_20 float8 NULL,
                                          bb_lower_20 float8 NULL,
                                          bb_width_20 float8 NULL,
                                          bb_percent_b_20 float8 NULL,
                                          stoch_k_14 float8 NULL,
                                          stoch_d_14 float8 NULL,
                                          atr_14 float8 NULL, -- Average True Range over 14 periods
                                          williams_r_14 float8 NULL,
                                          cci_20 float8 NULL, -- Commodity Channel Index over 20 periods
                                          mfi_14 float8 NULL,
                                          obv float8 NULL,
                                          roc_10 float8 NULL,
                                          roc_20 float8 NULL,
                                          proc_10 float8 NULL,
                                          proc_20 float8 NULL,
                                          vroc_10 float8 NULL,
                                          vroc_20 float8 NULL,
                                          parabolic_sar float8 NULL,
                                          adx_14 float8 NULL, -- Average Directional Index over 14 periods
                                          di_plus_14 float8 NULL,
                                          di_minus_14 float8 NULL,
                                          ichimoku_tenkan float8 NULL,
                                          ichimoku_kijun float8 NULL,
                                          ichimoku_senkou_span_a float8 NULL,
                                          ichimoku_senkou_span_b float8 NULL,
                                          ichimoku_chikou_span float8 NULL,
                                          fib_0_236 float8 NULL,
                                          fib_0_382 float8 NULL,
                                          fib_0_500 float8 NULL,
                                          fib_0_618 float8 NULL,
                                          fib_0_786 float8 NULL,
                                          support_level_1 float8 NULL,
                                          support_level_2 float8 NULL,
                                          resistance_level_1 float8 NULL,
                                          resistance_level_2 float8 NULL,
                                          volatility_20 float8 NULL,
                                          volatility_50 float8 NULL,
                                          momentum_10 float8 NULL,
                                          momentum_20 float8 NULL,
                                          volume_sma_20 float8 NULL, -- Simple Moving Average of Volume over 20 periods
                                          volume_ema_20 float8 NULL,
                                          volume_ratio float8 NULL,
                                          price_position_bb float8 NULL,
                                          price_trend_20 float8 NULL,
                                          sma_30 float8 NULL,
                                          ema_30 float8 NULL,
                                          wma_30 float8 NULL,
                                          rsi_21 float8 NULL,
                                          rsi_50 float8 NULL,
                                          macd_12_26_9 float8 NULL,
                                          bb_upper_50 float8 NULL,
                                          bb_middle_50 float8 NULL,
                                          bb_lower_50 float8 NULL,
                                          bb_width_50 float8 NULL,
                                          bb_percent_b_50 float8 NULL,
                                          stoch_k_21 float8 NULL,
                                          stoch_d_21 float8 NULL,
                                          atr_21 float8 NULL,
                                          atr_50 float8 NULL,
                                          williams_r_21 float8 NULL,
                                          williams_r_50 float8 NULL,
                                          cci_14 float8 NULL,
                                          cci_50 float8 NULL,
                                          mfi_21 float8 NULL,
                                          mfi_50 float8 NULL,
                                          roc_5 float8 NULL,
                                          roc_30 float8 NULL,
                                          proc_5 float8 NULL,
                                          proc_30 float8 NULL,
                                          vroc_5 float8 NULL,
                                          vroc_30 float8 NULL,
                                          adx_21 float8 NULL,
                                          adx_50 float8 NULL,
                                          di_plus_21 float8 NULL,
                                          di_minus_21 float8 NULL,
                                          di_plus_50 float8 NULL,
                                          di_minus_50 float8 NULL,
                                          volume_sma_50 float8 NULL,
                                          volume_ema_50 float8 NULL,
                                          cmf_14 float8 NULL, -- Chaikin Money Flow over 14 periods
                                          cmf_50 float8 NULL,
                                          vwap_50 float8 NULL,
                                          eom_14 float8 NULL,
                                          eom_50 float8 NULL,
                                          keltner_14 float8 NULL, -- Keltner Channel upper band over 14 periods
                                          keltner_50 float8 NULL,
                                          std_dev_14 float8 NULL,
                                          std_dev_50 float8 NULL,
                                          chaikin_vol_14 float8 NULL,
                                          chaikin_vol_50 float8 NULL,
                                          trend_strength_14 float8 NULL,
                                          trend_strength_50 float8 NULL,
                                          dm_21 float8 NULL,
                                          dm_50 float8 NULL,
                                          custom_indicator_1 float8 NULL,
                                          custom_indicator_2 float8 NULL,
                                          custom_indicator_3 float8 NULL,
                                          sma_14 float8 NULL,
                                          macd_12_26_d float8 NULL,
                                          dm_30 float8 NULL,
                                          macd_rsi_combo float8 NULL, -- MACD + RSI confirmation (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          macd_adx_combo float8 NULL, -- MACD + ADX trend strength filter (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          ema_cross_rsi_filter float8 NULL, -- EMA crossover + RSI filter (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          ema_ribbon_rsi float8 NULL, -- EMA ribbon + RSI (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          sar_macd_alignment float8 NULL, -- Parabolic SAR + MACD alignment (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          adx_cci_combo float8 NULL, -- ADX + CCI (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          rsi_atr_breakout float8 NULL, -- RSI + ATR breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          rsi_obv_alignment float8 NULL, -- RSI + OBV alignment (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          macd_hist_vol_delta float8 NULL, -- MACD histogram + Volume delta (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          cmf_rsi_combo float8 NULL, -- Chaikin Money Flow + RSI (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          bb_rsi_reversal float8 NULL, -- Bollinger Bands + RSI reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          bb_macd_trend_breakout float8 NULL, -- Bollinger Bands + MACD trend breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          squeeze_bb_keltner float8 NULL, -- BB-Keltner Squeeze (1.0: squeeze detected, 0.0: no squeeze)
                                          atr_ema_breakout float8 NULL, -- ATR + EMA breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          adx_atr_trend float8 NULL, -- ADX + ATR trend filter (1.0: strong trend, 0.0: weak trend)
                                          stoch_bb_reversal float8 NULL, -- Stochastic + Bollinger reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          williams_bb_reversal float8 NULL, -- Williams %R + Bollinger reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          ema_obv_confirmation float8 NULL, -- EMA + OBV confirmation (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          vwap_obv_intraday float8 NULL, -- VWAP + OBV intraday (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          darvas_box_volume float8 NULL, -- Darvas Box + Volume (1.0: bullish breakout, -1.0: bearish breakout, 0.0: no breakout)
                                          canslim_technical float8 NULL, -- CANSLIM technical subset (1.0: meets criteria, 0.0: does not meet criteria)
                                          triple_screen_system float8 NULL, -- Elder's Triple Screen (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          vam_ratio float8 NULL -- Volatility-Adjusted Momentum ratio (higher values indicate stronger momentum relative to volatility),
                                              zscore_fusion float8 NULL, -- Normalized fusion score (statistical combination of multiple signals)
                                          weighted_multi_factor float8 NULL, -- Weighted multi-factor model score (comprehensive technical analysis score)
                                          candle_rsi_bb float8 NULL, -- Candle pattern + RSI/BB filter (1.0: bullish, -1.0: bearish, 0.0: neutral)
                                          volume_weighted_trend_score float8 NULL, -- Volume-weighted trend score (trend strength weighted by volume factors)
                                          composite_updated_at timestamp NULL, -- Timestamp when composite indicators were last calculated
                                          volume_sma_10 float8 NULL,
                                          volume_sma_30 float8 NULL,
                                          volume_ema_10 float8 NULL,
                                          volume_ema_30 float8 NULL,
                                          cmf_21 float8 NULL,
                                          vpt float8 NULL,
                                          keltner_upper_14 float8 NULL,
                                          keltner_middle_14 float8 NULL,
                                          keltner_lower_14 float8 NULL,
                                          keltner_upper_20 float8 NULL,
                                          keltner_middle_20 float8 NULL,
                                          keltner_lower_20 float8 NULL,
                                          keltner_upper_50 float8 NULL,
                                          keltner_middle_50 float8 NULL,
                                          keltner_lower_50 float8 NULL,
                                          typical_price float8 NULL,
                                          mf_multiplier float8 NULL,
                                          mf_volume float8 NULL,
                                          tr float8 NULL,
                                          dm_plus float8 NULL,
                                          dm_minus float8 NULL,
                                          CONSTRAINT nse_eq_indicators_pkey PRIMARY KEY (symbol, date)
);
CREATE INDEX idx_nse_eq_indicators_adx_14 ON public.nse_eq_indicators USING btree (adx_14);
CREATE INDEX idx_nse_eq_indicators_atr_14 ON public.nse_eq_indicators USING btree (atr_14);
CREATE INDEX idx_nse_eq_indicators_bb_rsi_reversal ON public.nse_eq_indicators USING btree (bb_rsi_reversal) WHERE (bb_rsi_reversal IS NOT NULL);
CREATE INDEX idx_nse_eq_indicators_cci_20 ON public.nse_eq_indicators USING btree (cci_20);
CREATE INDEX idx_nse_eq_indicators_cmf_14 ON public.nse_eq_indicators USING btree (cmf_14);
CREATE INDEX idx_nse_eq_indicators_date ON public.nse_eq_indicators USING btree (date);
CREATE INDEX idx_nse_eq_indicators_macd_adx_combo ON public.nse_eq_indicators USING btree (macd_adx_combo) WHERE (macd_adx_combo IS NOT NULL);
CREATE INDEX idx_nse_eq_indicators_macd_line ON public.nse_eq_indicators USING btree (macd_line) WHERE (macd_line IS NOT NULL);
CREATE INDEX idx_nse_eq_indicators_macd_rsi_combo ON public.nse_eq_indicators USING btree (macd_rsi_combo) WHERE (macd_rsi_combo IS NOT NULL);
CREATE INDEX idx_nse_eq_indicators_rsi_14 ON public.nse_eq_indicators USING btree (rsi_14) WHERE (rsi_14 IS NOT NULL);
CREATE INDEX idx_nse_eq_indicators_sma_20 ON public.nse_eq_indicators USING btree (sma_20) WHERE (sma_20 IS NOT NULL);
CREATE INDEX idx_nse_eq_indicators_symbol ON public.nse_eq_indicators USING btree (symbol);
CREATE INDEX idx_nse_eq_indicators_symbol_date ON public.nse_eq_indicators USING btree (symbol, date);
CREATE INDEX idx_nse_eq_indicators_triple_screen_system ON public.nse_eq_indicators USING btree (triple_screen_system) WHERE (triple_screen_system IS NOT NULL);
CREATE INDEX idx_nse_eq_indicators_volume_sma_20 ON public.nse_eq_indicators USING btree (volume_sma_20);
CREATE INDEX idx_nse_eq_indicators_weighted_multi_factor ON public.nse_eq_indicators USING btree (weighted_multi_factor) WHERE (weighted_multi_factor IS NOT NULL);
COMMENT ON TABLE public.nse_eq_indicators IS 'Calculated technical indicators for NSE stocks';

-- Column comments

COMMENT ON COLUMN public.nse_eq_indicators.symbol IS 'Stock symbol (e.g., INFY, RELIANCE)';
COMMENT ON COLUMN public.nse_eq_indicators."date" IS 'Trading date';
COMMENT ON COLUMN public.nse_eq_indicators.sma_5 IS '5-day Simple Moving Average';
COMMENT ON COLUMN public.nse_eq_indicators.rsi_14 IS '14-period Relative Strength Index';
COMMENT ON COLUMN public.nse_eq_indicators.macd_line IS 'MACD line (12-26 EMA difference)';
COMMENT ON COLUMN public.nse_eq_indicators.bb_upper_20 IS 'Bollinger Band Upper (20 SMA + 2*StdDev)';
COMMENT ON COLUMN public.nse_eq_indicators.atr_14 IS 'Average True Range over 14 periods';
COMMENT ON COLUMN public.nse_eq_indicators.cci_20 IS 'Commodity Channel Index over 20 periods';
COMMENT ON COLUMN public.nse_eq_indicators.adx_14 IS 'Average Directional Index over 14 periods';
COMMENT ON COLUMN public.nse_eq_indicators.volume_sma_20 IS 'Simple Moving Average of Volume over 20 periods';
COMMENT ON COLUMN public.nse_eq_indicators.cmf_14 IS 'Chaikin Money Flow over 14 periods';
COMMENT ON COLUMN public.nse_eq_indicators.keltner_14 IS 'Keltner Channel upper band over 14 periods';
COMMENT ON COLUMN public.nse_eq_indicators.macd_rsi_combo IS 'MACD + RSI confirmation (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.macd_adx_combo IS 'MACD + ADX trend strength filter (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.ema_cross_rsi_filter IS 'EMA crossover + RSI filter (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.ema_ribbon_rsi IS 'EMA ribbon + RSI (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.sar_macd_alignment IS 'Parabolic SAR + MACD alignment (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.adx_cci_combo IS 'ADX + CCI (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.rsi_atr_breakout IS 'RSI + ATR breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.rsi_obv_alignment IS 'RSI + OBV alignment (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.macd_hist_vol_delta IS 'MACD histogram + Volume delta (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.cmf_rsi_combo IS 'Chaikin Money Flow + RSI (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.bb_rsi_reversal IS 'Bollinger Bands + RSI reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.bb_macd_trend_breakout IS 'Bollinger Bands + MACD trend breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.squeeze_bb_keltner IS 'BB-Keltner Squeeze (1.0: squeeze detected, 0.0: no squeeze)';
COMMENT ON COLUMN public.nse_eq_indicators.atr_ema_breakout IS 'ATR + EMA breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.adx_atr_trend IS 'ADX + ATR trend filter (1.0: strong trend, 0.0: weak trend)';
COMMENT ON COLUMN public.nse_eq_indicators.stoch_bb_reversal IS 'Stochastic + Bollinger reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.williams_bb_reversal IS 'Williams %R + Bollinger reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.ema_obv_confirmation IS 'EMA + OBV confirmation (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.vwap_obv_intraday IS 'VWAP + OBV intraday (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.darvas_box_volume IS 'Darvas Box + Volume (1.0: bullish breakout, -1.0: bearish breakout, 0.0: no breakout)';
COMMENT ON COLUMN public.nse_eq_indicators.canslim_technical IS 'CANSLIM technical subset (1.0: meets criteria, 0.0: does not meet criteria)';
COMMENT ON COLUMN public.nse_eq_indicators.triple_screen_system IS 'Elder''s Triple Screen (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.vam_ratio IS 'Volatility-Adjusted Momentum ratio (higher values indicate stronger momentum relative to volatility)';
COMMENT ON COLUMN public.nse_eq_indicators.zscore_fusion IS 'Normalized fusion score (statistical combination of multiple signals)';
COMMENT ON COLUMN public.nse_eq_indicators.weighted_multi_factor IS 'Weighted multi-factor model score (comprehensive technical analysis score)';
COMMENT ON COLUMN public.nse_eq_indicators.candle_rsi_bb IS 'Candle pattern + RSI/BB filter (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.volume_weighted_trend_score IS 'Volume-weighted trend score (trend strength weighted by volume factors)';
COMMENT ON COLUMN public.nse_eq_indicators.composite_updated_at IS 'Timestamp when composite indicators were last calculated';


-- public.nse_eq_master definition

-- Drop table

-- DROP TABLE public.nse_eq_master;

CREATE TABLE public.nse_eq_master (
                                      symbol varchar(100) NOT NULL,
                                      company_name varchar(500) NULL,
                                      industry varchar(200) NULL,
                                      is_fno_sec varchar(100) NULL,
                                      is_ca_sec varchar(100) NULL,
                                      is_slb_sec varchar(100) NULL,
                                      is_debt_sec varchar(100) NULL,
                                      is_suspended varchar(100) NULL,
                                      is_etf_sec varchar(100) NULL,
                                      is_delisted varchar(100) NULL,
                                      isin varchar(100) NULL,
                                      slb_isin varchar(100) NULL,
                                      listing_date varchar(100) NULL,
                                      is_municipal_bond varchar(100) NULL,
                                      is_hybrid_symbol varchar(100) NULL,
                                      is_top10 varchar(100) NULL,
                                      identifier varchar(200) NULL,
                                      series varchar(100) NULL,
                                      status varchar(200) NULL,
                                      last_update_time varchar(200) NULL,
                                      pd_sector_pe float4 NULL,
                                      pd_symbol_pe float4 NULL,
                                      pd_sector_ind varchar(200) NULL,
                                      board_status varchar(200) NULL,
                                      trading_status varchar(200) NULL,
                                      trading_segment varchar(200) NULL,
                                      session_no varchar(200) NULL,
                                      slb varchar(200) NULL,
                                      class_of_share varchar(200) NULL,
                                      derivatives varchar(200) NULL,
                                      surveillance_surv varchar(200) NULL,
                                      surveillance_desc varchar(500) NULL,
                                      face_value float4 NULL,
                                      issued_size varchar(200) NULL,
                                      sdd_auditor varchar(200) NULL,
                                      sdd_status varchar(200) NULL,
                                      current_market_type varchar(200) NULL,
                                      last_price float4 NULL,
                                      "change" float4 NULL,
                                      p_change float4 NULL,
                                      previous_close float4 NULL,
                                      "open" float4 NULL,
                                      "close" float4 NULL,
                                      vwap float4 NULL,
                                      stock_ind_close_price float4 NULL,
                                      lower_cp varchar(200) NULL,
                                      upper_cp varchar(200) NULL,
                                      p_price_band varchar(200) NULL,
                                      base_price float4 NULL,
                                      intra_day_high_low_min float4 NULL,
                                      intra_day_high_low_max float4 NULL,
                                      intra_day_high_low_value varchar(200) NULL,
                                      week_high_low_min float4 NULL,
                                      week_high_low_min_date varchar(200) NULL,
                                      week_high_low_max float4 NULL,
                                      week_high_low_max_date varchar(200) NULL,
                                      i_nav_value float4 NULL,
                                      check_inav varchar(200) NULL,
                                      tick_size float4 NULL,
                                      ieq varchar(200) NULL,
                                      macro varchar(200) NULL,
                                      sector varchar(200) NULL,
                                      basic_industry varchar(200) NULL,
                                      ato_buy float4 NULL,
                                      ato_sell float4 NULL,
                                      iep float4 NULL,
                                      total_traded_volume float4 NULL,
                                      final_price float4 NULL,
                                      final_quantity float4 NULL,
                                      pre_open_last_update_time varchar(200) NULL,
                                      total_buy_quantity float4 NULL,
                                      total_sell_quantity float4 NULL,
                                      ato_buy_qty float4 NULL,
                                      ato_sell_qty float4 NULL,
                                      pre_open_change float4 NULL,
                                      per_change float4 NULL,
                                      prev_close float4 NULL,
                                      CONSTRAINT nse_eq_master_pk PRIMARY KEY (symbol)
);


-- public.nse_eq_ohlcv_historic definition

-- Drop table

-- DROP TABLE public.nse_eq_ohlcv_historic;

CREATE TABLE public.nse_eq_ohlcv_historic (
                                              symbol text NOT NULL,
                                              "date" date NOT NULL,
                                              "open" float8 NULL,
                                              high float8 NULL,
                                              low float8 NULL,
                                              "close" float8 NULL,
                                              volume numeric(20) NULL,
                                              total_traded_value numeric(20, 2) NULL,
                                              total_trades numeric(20) NULL,
                                              delivery_quantity numeric(20) NULL,
                                              delivery_percentage float8 NULL,
                                              created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                              updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                              vwap float8 NULL,
                                              previous_close float8 NULL,
                                              series text NULL,
                                              CONSTRAINT nse_nse_eq_ohlcv_historic_pkey_old PRIMARY KEY (symbol, date)
);
CREATE INDEX idx_nse_eq_ohlcv_historic_date ON public.nse_eq_ohlcv_historic USING btree (date);
CREATE INDEX idx_nse_eq_ohlcv_historic_symbol ON public.nse_eq_ohlcv_historic USING btree (symbol);
CREATE INDEX idx_nse_eq_ohlcv_historic_symbol_date ON public.nse_eq_ohlcv_historic USING btree (symbol, date);


-- public.nse_eq_ohlcv_ticks definition

-- Drop table

-- DROP TABLE public.nse_eq_ohlcv_ticks;

CREATE TABLE public.nse_eq_ohlcv_ticks (
                                           symbol text NOT NULL,
                                           "date" date NOT NULL,
                                           "open" float8 NULL,
                                           high float8 NULL,
                                           low float8 NULL,
                                           "close" float8 NULL,
                                           volume numeric(20) NULL,
                                           total_traded_value numeric(20, 2) NULL,
                                           total_trades numeric(20) NULL,
                                           delivery_quantity numeric(20) NULL,
                                           delivery_percentage float8 NULL,
                                           created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                           updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                           vwap float8 NULL,
                                           previous_close float8 NULL,
                                           series text NULL,
                                           CONSTRAINT nse_nse_eq_ohlcv_ticks_pkey PRIMARY KEY (symbol, date)
);
CREATE INDEX idx_nse_eq_ohlcv_ticks_date ON public.nse_eq_ohlcv_ticks USING btree (date);
CREATE INDEX idx_nse_eq_ohlcv_ticks_symbol ON public.nse_eq_ohlcv_ticks USING btree (symbol);
CREATE INDEX idx_nse_eq_ohlcv_ticks_symbol_date ON public.nse_eq_ohlcv_ticks USING btree (symbol, date);


-- public.nse_eq_sector_index definition

-- Drop table

-- DROP TABLE public.nse_eq_sector_index;

CREATE TABLE public.nse_eq_sector_index (
                                            symbol varchar(50) NOT NULL,
                                            pd_sector_index varchar(100) NOT NULL,
                                            created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                            updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                            CONSTRAINT nse_eq_sector_index_pkey PRIMARY KEY (symbol, pd_sector_index)
);
CREATE INDEX idx_nse_eq_sector_index_pd_sector_index ON public.nse_eq_sector_index USING btree (pd_sector_index);
CREATE INDEX idx_nse_eq_sector_index_symbol ON public.nse_eq_sector_index USING btree (symbol);


-- public.nse_idx_master definition

-- Drop table

-- DROP TABLE public.nse_idx_master;

CREATE TABLE public.nse_idx_master (
                                       id serial4 NOT NULL,
                                       key_category varchar(200) NULL,
                                       index_name varchar(200) NULL,
                                       index_symbol varchar(200) NULL,
                                       last_price float4 NULL,
                                       variation float4 NULL,
                                       percent_change float4 NULL,
                                       open_price float4 NULL,
                                       high_price float4 NULL,
                                       low_price float4 NULL,
                                       previous_close float4 NULL,
                                       year_high float4 NULL,
                                       year_low float4 NULL,
                                       indicative_close float4 NULL,
                                       pe_ratio float4 NULL,
                                       pb_ratio float4 NULL,
                                       dividend_yield float4 NULL,
                                       declines int4 NULL,
                                       advances int4 NULL,
                                       unchanged int4 NULL,
                                       percent_change_365d float4 NULL,
                                       date_365d_ago varchar(200) NULL,
                                       chart_365d_path text NULL,
                                       date_30d_ago varchar(200) NULL,
                                       percent_change_30d float4 NULL,
                                       chart_30d_path text NULL,
                                       chart_today_path text NULL,
                                       previous_day numeric(12, 2) NULL,
                                       one_week_ago numeric(12, 2) NULL,
                                       one_month_ago numeric(12, 2) NULL,
                                       one_year_ago numeric(12, 2) NULL,
                                       created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                       updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                       CONSTRAINT nse_idx_master_pkey PRIMARY KEY (id),
                                       CONSTRAINT unique_index_name UNIQUE (index_name)
);
CREATE INDEX idx_nse_idx_master_created_at ON public.nse_idx_master USING btree (created_at);
CREATE UNIQUE INDEX idx_nse_idx_master_name ON public.nse_idx_master USING btree (index_name);
CREATE INDEX idx_nse_idx_master_symbol ON public.nse_idx_master USING btree (index_symbol);


-- public.nse_idx_ohlcv_historic definition

-- Drop table

-- DROP TABLE public.nse_idx_ohlcv_historic;

CREATE TABLE public.nse_idx_ohlcv_historic (
                                               index_name text NOT NULL,
                                               "date" date NOT NULL,
                                               "open" float8 NULL,
                                               high float8 NULL,
                                               low float8 NULL,
                                               "close" float8 NULL,
                                               volume int8 NULL,
                                               total_traded_value float8 NULL,
                                               total_trades int8 NULL,
                                               delivery_quantity int8 NULL,
                                               delivery_percentage float8 NULL,
                                               vwap float8 NULL,
                                               previous_close float8 NULL,
                                               series text NULL,
                                               created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                               updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                               CONSTRAINT nse_indices_historical_data_pkey PRIMARY KEY (index_name, date)
);
CREATE INDEX idx_nse_idx_ohlcv_historic_date ON public.nse_idx_ohlcv_historic USING btree (date);
CREATE INDEX idx_nse_idx_ohlcv_historic_index_date ON public.nse_idx_ohlcv_historic USING btree (index_name, date);
CREATE INDEX idx_nse_idx_ohlcv_historic_index_name ON public.nse_idx_ohlcv_historic USING btree (index_name);


-- public.nse_idx_ticks definition

-- Drop table

-- DROP TABLE public.nse_idx_ticks;

CREATE TABLE public.nse_idx_ticks (
                                      advances int4 NULL,
                                      day_high numeric(15, 4) NULL,
                                      day_low numeric(15, 4) NULL,
                                      declines int4 NULL,
                                      dividend_yield numeric(10, 4) NULL,
                                      indicative_close numeric(15, 4) NULL,
                                      last_price numeric(15, 4) NULL,
                                      open_price numeric(15, 4) NULL,
                                      pb_ratio numeric(10, 4) NULL,
                                      pe_ratio numeric(10, 4) NULL,
                                      percent_change numeric(10, 4) NULL,
                                      percent_change_30d numeric(10, 4) NULL,
                                      percent_change_365d numeric(10, 4) NULL,
                                      previous_close numeric(15, 4) NULL,
                                      unchanged int4 NULL,
                                      variation numeric(15, 4) NULL,
                                      year_high numeric(15, 4) NULL,
                                      year_low numeric(15, 4) NULL,
                                      created_on timestamptz(6) DEFAULT CURRENT_TIMESTAMP NULL,
                                      id bigserial NOT NULL,
                                      modified_on timestamptz(6) DEFAULT CURRENT_TIMESTAMP NULL,
                                      tick_timestamp timestamptz(6) NOT NULL,
                                      created_by varchar(36) DEFAULT 'System'::character varying NULL,
                                      modified_by varchar(36) DEFAULT 'System'::character varying NULL,
                                      date_30d_ago varchar(50) NULL,
                                      date_365d_ago varchar(50) NULL,
                                      market_status varchar(50) NULL,
                                      market_status_time varchar(50) NULL,
                                      trade_date varchar(50) NULL,
                                      index_symbol varchar(100) NULL,
                                      index_name varchar(200) NOT NULL,
                                      chart_30d_path varchar(500) NULL,
                                      chart_365d_path varchar(500) NULL,
                                      chart_today_path varchar(500) NULL,
                                      market_status_message varchar(500) NULL,
                                      CONSTRAINT nse_idx_ticks_index_name_tick_timestamp_key UNIQUE (index_name, tick_timestamp),
                                      CONSTRAINT nse_idx_ticks_pkey PRIMARY KEY (id)
);


-- public.nse_performance_metrics definition

-- Drop table

-- DROP TABLE public.nse_performance_metrics;

CREATE TABLE public.nse_performance_metrics (
                                                id serial4 NOT NULL,
                                                execution_date date DEFAULT CURRENT_DATE NULL,
                                                start_time timestamp NULL,
                                                end_time timestamp NULL,
                                                total_symbols int4 NULL,
                                                processed_symbols int4 NULL,
                                                successful_fetches int4 NULL,
                                                failed_fetches int4 NULL,
                                                total_records int8 NULL,
                                                execution_time_seconds float8 NULL,
                                                symbols_per_minute float8 NULL,
                                                records_per_minute float8 NULL,
                                                success_rate float8 NULL,
                                                system_resources jsonb NULL,
                                                created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                                                CONSTRAINT nse_performance_metrics_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_nse_performance_metrics_date ON public.nse_performance_metrics USING btree (execution_date);
CREATE INDEX idx_nse_performance_metrics_success_rate ON public.nse_performance_metrics USING btree (success_rate);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
                              id int8 GENERATED BY DEFAULT AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                              created_at timestamp(6) NOT NULL,
                              email varchar(255) NOT NULL,
                              first_name varchar(255) NULL,
                              full_name varchar(255) NULL,
                              is_enabled bool NOT NULL,
                              last_login timestamp(6) NULL,
                              last_name varchar(255) NULL,
                              profile_picture_url varchar(255) NULL,
                              provider varchar(255) NOT NULL,
                              provider_user_id varchar(255) NOT NULL,
                              updated_at timestamp(6) NULL,
                              CONSTRAINT ukieiivcpfkhqmium8o6xr9kkd1 UNIQUE (provider_user_id, provider),
                              CONSTRAINT ukruj7llynj9miho19bgmskwipt UNIQUE (email, provider),
                              CONSTRAINT users_pkey PRIMARY KEY (id),
                              CONSTRAINT users_provider_check CHECK (((provider)::text = ANY (ARRAY[('GOOGLE'::character varying)::text, ('MICROSOFT'::character varying)::text])))
);