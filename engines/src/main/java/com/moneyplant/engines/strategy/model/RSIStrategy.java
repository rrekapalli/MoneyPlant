package com.moneyplant.engines.strategy.model;

import com.moneyplant.engines.common.dto.MarketDataDto;
import com.moneyplant.engines.common.dto.TradingSignalDto;
import com.moneyplant.engines.common.enums.SignalType;
import com.moneyplant.engines.common.enums.SignalStrength;


import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Sample RSI (Relative Strength Index) strategy implementation
 */
@Component
public class RSIStrategy {
    
    
    
    private static final int DEFAULT_PERIOD = 14;
    private static final BigDecimal OVERBOUGHT_THRESHOLD = BigDecimal.valueOf(70);
    private static final BigDecimal OVERSOLD_THRESHOLD = BigDecimal.valueOf(30);
    
    /**
     * Evaluate RSI strategy and generate trading signal
     */
    public TradingSignalDto evaluateStrategy(List<MarketDataDto> marketData) {
        
        if (marketData.size() < DEFAULT_PERIOD + 1) {
            return null;
        }
        
        // TODO: implement RSI strategy logic
        // - Calculate RSI indicator
        // - Apply RSI rules
        // - Generate trading signal
        // - Set confidence level
        
        BigDecimal rsi = calculateRSI(marketData, DEFAULT_PERIOD);
        String symbol = marketData.get(marketData.size() - 1).getSymbol();
        
        SignalType signalType = determineSignalType(rsi);
        SignalStrength strength = determineSignalStrength(rsi);
        BigDecimal confidence = calculateConfidence(rsi);
        
        return TradingSignalDto.builder()
                .id("rsi-" + System.currentTimeMillis())
                .symbol(symbol)
                .strategy("RSI_STRATEGY")
                .timestamp(LocalDateTime.now())
                .signalType(signalType)
                .strength(strength)
                .price(marketData.get(marketData.size() - 1).getClose())
                .confidence(confidence)
                .description("RSI Strategy Signal - RSI: " + rsi.setScale(2, RoundingMode.HALF_UP))
                .source("RSI_STRATEGY")
                .build();
    }
    
    /**
     * Calculate RSI indicator
     */
    private BigDecimal calculateRSI(List<MarketDataDto> marketData, int period) {
        // TODO: implement RSI calculation
        // - Calculate price changes
        // - Separate gains and losses
        // - Calculate average gains and losses
        // - Apply RSI formula: RSI = 100 - (100 / (1 + RS))
        // - Where RS = Average Gain / Average Loss
        
        if (marketData.size() < period + 1) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;
        
        for (int i = 1; i <= period; i++) {
            MarketDataDto current = marketData.get(marketData.size() - i);
            MarketDataDto previous = marketData.get(marketData.size() - i - 1);
            
            BigDecimal change = current.getClose().subtract(previous.getClose());
            if (change.compareTo(BigDecimal.ZERO) > 0) {
                totalGain = totalGain.add(change);
            } else {
                totalLoss = totalLoss.add(change.abs());
            }
        }
        
        BigDecimal avgGain = totalGain.divide(BigDecimal.valueOf(period), 4, RoundingMode.HALF_UP);
        BigDecimal avgLoss = totalLoss.divide(BigDecimal.valueOf(period), 4, RoundingMode.HALF_UP);
        
        if (avgLoss.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.valueOf(100);
        }
        
        BigDecimal rs = avgGain.divide(avgLoss, 4, RoundingMode.HALF_UP);
        BigDecimal rsi = BigDecimal.valueOf(100).subtract(
            BigDecimal.valueOf(100).divide(BigDecimal.ONE.add(rs), 2, RoundingMode.HALF_UP)
        );
        
        return rsi;
    }
    
    /**
     * Determine signal type based on RSI value
     */
    private SignalType determineSignalType(BigDecimal rsi) {
        if (rsi.compareTo(OVERSOLD_THRESHOLD) < 0) {
            return SignalType.BUY;
        } else if (rsi.compareTo(OVERBOUGHT_THRESHOLD) > 0) {
            return SignalType.SELL;
        } else {
            return SignalType.HOLD;
        }
    }
    
    /**
     * Determine signal strength based on RSI value
     */
    private SignalStrength determineSignalStrength(BigDecimal rsi) {
        if (rsi.compareTo(BigDecimal.valueOf(20)) < 0 || rsi.compareTo(BigDecimal.valueOf(80)) > 0) {
            return SignalStrength.VERY_STRONG;
        } else if (rsi.compareTo(BigDecimal.valueOf(25)) < 0 || rsi.compareTo(BigDecimal.valueOf(75)) > 0) {
            return SignalStrength.STRONG;
        } else if (rsi.compareTo(BigDecimal.valueOf(30)) < 0 || rsi.compareTo(BigDecimal.valueOf(70)) > 0) {
            return SignalStrength.MODERATE;
        } else {
            return SignalStrength.WEAK;
        }
    }
    
    /**
     * Calculate confidence level based on RSI value
     */
    private BigDecimal calculateConfidence(BigDecimal rsi) {
        // TODO: implement confidence calculation
        // - Higher confidence for extreme RSI values
        // - Lower confidence for neutral RSI values
        // - Consider market volatility and trend
        
        if (rsi.compareTo(BigDecimal.valueOf(20)) < 0 || rsi.compareTo(BigDecimal.valueOf(80)) > 0) {
            return BigDecimal.valueOf(0.95);
        } else if (rsi.compareTo(BigDecimal.valueOf(25)) < 0 || rsi.compareTo(BigDecimal.valueOf(75)) > 0) {
            return BigDecimal.valueOf(0.85);
        } else if (rsi.compareTo(BigDecimal.valueOf(30)) < 0 || rsi.compareTo(BigDecimal.valueOf(70)) > 0) {
            return BigDecimal.valueOf(0.70);
        } else {
            return BigDecimal.valueOf(0.50);
        }
    }
}
