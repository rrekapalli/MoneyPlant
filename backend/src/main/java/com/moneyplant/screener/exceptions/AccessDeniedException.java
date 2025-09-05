package com.moneyplant.screener.exceptions;

/**
 * Exception thrown when access to a resource is denied.
 */
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }

    public AccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}
