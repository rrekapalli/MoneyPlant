package com.moneyplant.engines.ingestion.kite.exception;

public class KiteAuthenticationException extends RuntimeException {
    public KiteAuthenticationException(String message) {
        super(message);
    }
    
    public KiteAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
