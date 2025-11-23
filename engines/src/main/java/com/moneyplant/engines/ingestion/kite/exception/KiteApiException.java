package com.moneyplant.engines.ingestion.kite.exception;

public class KiteApiException extends RuntimeException {
    public KiteApiException(String message) {
        super(message);
    }
    
    public KiteApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
