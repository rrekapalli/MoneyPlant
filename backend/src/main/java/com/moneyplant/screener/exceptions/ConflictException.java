package com.moneyplant.screener.exceptions;

/**
 * Exception thrown when there is a conflict (e.g., duplicate resource).
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
