package com.moneyplant.screener.exceptions;

/**
 * Exception thrown when SQL generation fails.
 */
public class SqlGenerationException extends RuntimeException {

    public SqlGenerationException(String message) {
        super(message);
    }

    public SqlGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}