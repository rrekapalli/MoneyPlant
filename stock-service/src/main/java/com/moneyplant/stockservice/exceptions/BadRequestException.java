package com.moneyplant.stockservice.exceptions;

/**
 * Exception thrown when a request contains invalid data or parameters.
 * This exception is used when the client sends a request that cannot be processed
 * due to invalid data format, missing required fields, or other validation errors.
 */
public class BadRequestException extends RuntimeException {

    /**
     * Constructs a new BadRequestException with the specified detail message.
     *
     * @param message the detail message
     */
    public BadRequestException(String message) {
        super(message);
    }

    /**
     * Constructs a new BadRequestException with the specified detail message and cause.
     *
     * @param message the detail message
     * @param cause the cause of the exception
     */
    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}