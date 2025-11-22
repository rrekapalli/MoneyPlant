package com.moneyplant.engines.ingestion.kite.exception;

import lombok.Getter;

@Getter
public class KiteRateLimitException extends RuntimeException {
    private final int retryAfterSeconds;
    
    public KiteRateLimitException(String message, int retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }
    
    public KiteRateLimitException(String message, int retryAfterSeconds, Throwable cause) {
        super(message, cause);
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
