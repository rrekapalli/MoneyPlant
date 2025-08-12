package com.moneyplant.trading.scanner.service;

import com.moneyplant.trading.common.dto.MarketDataDto;
import com.moneyplant.trading.common.enums.PatternType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@Slf4j
public class CandlestickPatternDetector {

    public boolean detectDoji(List<MarketDataDto> candles) {
        if (candles.size() < 1) return false;
        
        MarketDataDto current = candles.get(candles.size() - 1);
        BigDecimal open = current.getOpen();
        BigDecimal close = current.getClose();
        
        // Doji: open and close are very close
        BigDecimal bodySize = open.subtract(close).abs();
        BigDecimal totalRange = current.getHigh().subtract(current.getLow());
        
        // Body should be less than 10% of total range
        return bodySize.divide(totalRange, 4, BigDecimal.ROUND_HALF_UP)
                .compareTo(new BigDecimal("0.1")) <= 0;
    }

    public boolean detectHammer(List<MarketDataDto> candles) {
        if (candles.size() < 1) return false;
        
        MarketDataDto current = candles.get(candles.size() - 1);
        BigDecimal open = current.getOpen();
        BigDecimal close = current.getClose();
        BigDecimal high = current.getHigh();
        BigDecimal low = current.getLow();
        
        // Hammer: small body, long lower shadow, short upper shadow
        BigDecimal bodySize = open.subtract(close).abs();
        BigDecimal totalRange = high.subtract(low);
        BigDecimal lowerShadow = BigDecimal.valueOf(Math.min(open.doubleValue(), close.doubleValue()) - low.doubleValue());
        BigDecimal upperShadow = BigDecimal.valueOf(high.doubleValue() - Math.max(open.doubleValue(), close.doubleValue()));
        
        // Body should be small, lower shadow should be long, upper shadow should be short
        return bodySize.divide(totalRange, 4, BigDecimal.ROUND_HALF_UP).compareTo(new BigDecimal("0.3")) <= 0 &&
               lowerShadow.divide(totalRange, 4, BigDecimal.ROUND_HALF_UP).compareTo(new BigDecimal("0.6")) >= 0 &&
               upperShadow.divide(totalRange, 4, BigDecimal.ROUND_HALF_UP).compareTo(new BigDecimal("0.1")) <= 0;
    }

    public boolean detectEngulfingBullish(List<MarketDataDto> candles) {
        if (candles.size() < 2) return false;
        
        MarketDataDto previous = candles.get(candles.size() - 2);
        MarketDataDto current = candles.get(candles.size() - 1);
        
        // Previous candle should be bearish (red)
        boolean previousBearish = previous.getClose().compareTo(previous.getOpen()) < 0;
        
        // Current candle should be bullish (green)
        boolean currentBullish = current.getClose().compareTo(current.getOpen()) > 0;
        
        // Current candle should completely engulf previous candle
        boolean engulfing = current.getOpen().compareTo(previous.getClose()) < 0 &&
                           current.getClose().compareTo(previous.getOpen()) > 0;
        
        return previousBearish && currentBullish && engulfing;
    }

    public PatternType detectPattern(List<MarketDataDto> candles) {
        log.info("Detecting pattern from {} candles", candles.size());
        
        if (detectDoji(candles)) {
            return PatternType.DOJI;
        } else if (detectHammer(candles)) {
            return PatternType.HAMMER;
        } else if (detectEngulfingBullish(candles)) {
            return PatternType.ENGULFING_BULLISH;
        }
        
        return null;
    }
}
