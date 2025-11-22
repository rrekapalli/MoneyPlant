package com.moneyplant.engines.ingestion.kite.exception;

public class KiteIngestionException extends RuntimeException {
    public KiteIngestionException(String message) {
        super(message);
    }
    
    public KiteIngestionException(String message, Throwable cause) {
        super(message, cause);
    }
}
