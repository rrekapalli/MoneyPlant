package com.moneyplant.trading.common.exception;

public class DataNotFoundException extends TradingException {
    
    public DataNotFoundException(String message) {
        super(message);
    }
    
    public DataNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
