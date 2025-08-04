package com.moneyplant.core.exceptions;

/**
 * Exception thrown when an internal service error occurs.
 * This exception is used for errors that occur during service operations
 * that are not related to client input or resource availability.
 */
public class ServiceException extends RuntimeException {

    /**
     * Constructs a new ServiceException with the specified detail message.
     *
     * @param message the detail message
     */
    public ServiceException(String message) {
        super(message);
    }

    /**
     * Constructs a new ServiceException with the specified detail message and cause.
     *
     * @param message the detail message
     * @param cause the cause of the exception
     */
    public ServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}