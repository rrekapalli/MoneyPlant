package com.moneyplant.engines.common.exception;

/**
 * Custom exception for MoneyPlant Engines application
 */
public class EnginesException extends RuntimeException {
    
    private final String errorCode;
    
    public EnginesException(String message) {
        super(message);
        this.errorCode = "ENGINES_ERROR";
    }
    
    public EnginesException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "ENGINES_ERROR";
    }
    
    public EnginesException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public EnginesException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
