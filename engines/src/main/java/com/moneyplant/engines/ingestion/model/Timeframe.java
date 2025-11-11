package com.moneyplant.engines.ingestion.model;

import java.time.Duration;

/**
 * Enum representing different timeframes for OHLCV candlestick data.
 * Each timeframe has an associated duration for aggregation purposes.
 * 
 * Requirements: 2.1, 2.4
 */
public enum Timeframe {
    
    ONE_MINUTE("1min", Duration.ofMinutes(1)),
    FIVE_MINUTES("5min", Duration.ofMinutes(5)),
    FIFTEEN_MINUTES("15min", Duration.ofMinutes(15)),
    THIRTY_MINUTES("30min", Duration.ofMinutes(30)),
    ONE_HOUR("1hour", Duration.ofHours(1)),
    ONE_DAY("1day", Duration.ofDays(1)),
    ONE_WEEK("1week", Duration.ofDays(7)),
    ONE_MONTH("1month", Duration.ofDays(30));
    
    private final String code;
    private final Duration duration;
    
    Timeframe(String code, Duration duration) {
        this.code = code;
        this.duration = duration;
    }
    
    /**
     * Gets the string code for this timeframe (e.g., "1min", "1day")
     * 
     * @return timeframe code
     */
    public String getCode() {
        return code;
    }
    
    /**
     * Gets the duration represented by this timeframe
     * 
     * @return duration
     */
    public Duration getDuration() {
        return duration;
    }
    
    /**
     * Parses a timeframe code string to enum value
     * 
     * @param code timeframe code (e.g., "1min", "1day")
     * @return corresponding Timeframe enum
     * @throws IllegalArgumentException if code is not recognized
     */
    public static Timeframe fromCode(String code) {
        for (Timeframe timeframe : values()) {
            if (timeframe.code.equalsIgnoreCase(code)) {
                return timeframe;
            }
        }
        throw new IllegalArgumentException("Unknown timeframe code: " + code);
    }
    
    /**
     * Checks if this is an intraday timeframe (less than 1 day)
     * 
     * @return true if intraday timeframe
     */
    public boolean isIntraday() {
        return duration.compareTo(Duration.ofDays(1)) < 0;
    }
    
    @Override
    public String toString() {
        return code;
    }
}
