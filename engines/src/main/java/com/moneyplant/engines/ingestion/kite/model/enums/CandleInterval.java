package com.moneyplant.engines.ingestion.kite.model.enums;

/**
 * Enum representing candle intervals supported by Kite Connect API.
 * Each interval has a corresponding value used in Kite API requests.
 */
public enum CandleInterval {
    MINUTE("minute"),
    THREE_MINUTE("3minute"),
    FIVE_MINUTE("5minute"),
    TEN_MINUTE("10minute"),
    FIFTEEN_MINUTE("15minute"),
    THIRTY_MINUTE("30minute"),
    SIXTY_MINUTE("60minute"),
    DAY("day");
    
    private final String kiteValue;
    
    CandleInterval(String kiteValue) {
        this.kiteValue = kiteValue;
    }
    
    /**
     * Get the Kite API value for this interval.
     * @return The interval value as expected by Kite Connect API
     */
    public String getKiteValue() {
        return kiteValue;
    }
    
    /**
     * Get CandleInterval from Kite API value.
     * @param kiteValue The interval value from Kite API
     * @return The corresponding CandleInterval enum
     * @throws IllegalArgumentException if the value is not recognized
     */
    public static CandleInterval fromKiteValue(String kiteValue) {
        for (CandleInterval interval : values()) {
            if (interval.kiteValue.equals(kiteValue)) {
                return interval;
            }
        }
        throw new IllegalArgumentException("Unknown candle interval: " + kiteValue);
    }
}
