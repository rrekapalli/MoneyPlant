package com.moneyplant.engines.screener.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class IndicatorFieldCatalog {
    public List<Map<String, Object>> getFields() {
        // Build field catalog from known indicator columns we persist in nse_eq_indicators
        // Keeping it concise for frontend: key, label, source, type, operators
        List<Map<String, Object>> fields = new java.util.ArrayList<>();
        java.util.function.BiFunction<String,String,Map<String,Object>> num = (key,label) -> Map.of(
                "key", key,
                "label", label,
                "source", "indicator",
                "type", "NUMBER",
                "operators", List.of("GT","GTE","LT","LTE","EQ","NEQ","BETWEEN","IS_NULL","IS_NOT_NULL")
        );
        fields.add(num.apply("rsi_14","RSI(14)"));
        fields.add(num.apply("rsi_21","RSI(21)"));
        fields.add(num.apply("macd_line","MACD Line"));
        fields.add(num.apply("macd_signal","MACD Signal"));
        fields.add(num.apply("macd_histogram","MACD Histogram"));
        fields.add(num.apply("sma_50","SMA(50)"));
        fields.add(num.apply("sma_200","SMA(200)"));
        fields.add(num.apply("ema_20","EMA(20)"));
        fields.add(num.apply("ema_50","EMA(50)"));
        fields.add(num.apply("adx_14","ADX(14)"));
        fields.add(num.apply("stoch_k_14","Stoch %K(14)"));
        fields.add(num.apply("stoch_d_14","Stoch %D(14)"));
        fields.add(num.apply("atr_14","ATR(14)"));
        fields.add(num.apply("cci_20","CCI(20)"));
        fields.add(num.apply("mfi_14","MFI(14)"));
        fields.add(num.apply("bb_upper_20","BB Upper(20)"));
        fields.add(num.apply("bb_lower_20","BB Lower(20)"));
        // master and ohlcv common fields
        fields.add(Map.of(
                "key","sector","label","Sector","source","master","type","STRING",
                "operators", List.of("EQ","NEQ","IN","NOT_IN","IS_NULL","IS_NOT_NULL")
        ));
        fields.add(Map.of(
                "key","close","label","Close","source","ohlcv","type","NUMBER",
                "operators", List.of("GT","GTE","LT","LTE","EQ","NEQ","BETWEEN")
        ));
        fields.add(Map.of(
                "key","symbol","label","Symbol","source","master","type","STRING",
                "operators", List.of("EQ","IN","NOT_IN")
        ));
        return fields;
    }
}
