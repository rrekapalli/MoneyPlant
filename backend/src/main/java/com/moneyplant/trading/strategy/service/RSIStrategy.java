package com.moneyplant.trading.strategy.service;

import com.moneyplant.trading.common.dto.MarketDataDto;
import com.moneyplant.trading.common.dto.TradingSignalDto;
import com.moneyplant.trading.common.enums.SignalType;
import com.moneyplant.trading.common.enums.StrategyType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class RSIStrategy {

    private static final int RSI_PERIOD = 14;
    private static final BigDecimal OVERBOUGHT_THRESHOLD = new BigDecimal("70");
    private static final BigDecimal OVERSOLD_THRESHOLD = new BigDecimal("30");

    public TradingSignalDto calculateRSI(List<MarketDataDto> marketData) {
        if (marketData.size() < RSI_PERIOD + 1) {
            log.warn("Insufficient data for RSI calculation. Need at least {} periods, got {}", 
                    RSI_PERIOD + 1, marketData.size());
            return null;
        }

        BigDecimal rsi = calculateRSIValue(marketData);
        log.info("Calculated RSI: {}", rsi);

        SignalType signalType = determineSignal(rsi);
        
        if (signalType != SignalType.HOLD) {
            MarketDataDto latest = marketData.get(marketData.size() - 1);
            return TradingSignalDto.builder()
                    .symbol(latest.getSymbol())
                    .signalType(signalType)
                    .strategyType(StrategyType.RSI)
                    .timestamp(LocalDateTime.now())
                    .price(latest.getClose())
                    .confidence(calculateConfidence(rsi))
                    .description("RSI: " + rsi + " - " + signalType)
                    .build();
        }

        return null;
    }

    private BigDecimal calculateRSIValue(List<MarketDataDto> marketData) {
        BigDecimal gains = BigDecimal.ZERO;
        BigDecimal losses = BigDecimal.ZERO;

        for (int i = 1; i <= RSI_PERIOD; i++) {
            MarketDataDto current = marketData.get(marketData.size() - i);
            MarketDataDto previous = marketData.get(marketData.size() - i - 1);
            
            BigDecimal change = current.getClose().subtract(previous.getClose());
            
            if (change.compareTo(BigDecimal.ZERO) > 0) {
                gains = gains.add(change);
            } else {
                losses = losses.add(change.abs());
            }
        }

        BigDecimal avgGain = gains.divide(BigDecimal.valueOf(RSI_PERIOD), 4, RoundingMode.HALF_UP);
        BigDecimal avgLoss = losses.divide(BigDecimal.valueOf(RSI_PERIOD), 4, RoundingMode.HALF_UP);

        if (avgLoss.compareTo(BigDecimal.ZERO) == 0) {
            return new BigDecimal("100");
        }

        BigDecimal rs = avgGain.divide(avgLoss, 4, RoundingMode.HALF_UP);
        BigDecimal rsi = new BigDecimal("100").subtract(
            new BigDecimal("100").divide(BigDecimal.ONE.add(rs), 4, RoundingMode.HALF_UP)
        );

        return rsi;
    }

    private SignalType determineSignal(BigDecimal rsi) {
        if (rsi.compareTo(OVERSOLD_THRESHOLD) < 0) {
            return SignalType.BUY;
        } else if (rsi.compareTo(OVERBOUGHT_THRESHOLD) > 0) {
            return SignalType.SELL;
        } else {
            return SignalType.HOLD;
        }
    }

    private BigDecimal calculateConfidence(BigDecimal rsi) {
        BigDecimal confidence = BigDecimal.ZERO;
        
        if (rsi.compareTo(new BigDecimal("20")) < 0 || rsi.compareTo(new BigDecimal("80")) > 0) {
            confidence = new BigDecimal("0.9"); // High confidence for extreme values
        } else if (rsi.compareTo(new BigDecimal("30")) < 0 || rsi.compareTo(new BigDecimal("70")) > 0) {
            confidence = new BigDecimal("0.7"); // Medium confidence for threshold values
        } else {
            confidence = new BigDecimal("0.5"); // Low confidence for neutral values
        }
        
        return confidence;
    }
}
