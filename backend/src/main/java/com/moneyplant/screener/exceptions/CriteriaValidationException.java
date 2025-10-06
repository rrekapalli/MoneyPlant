package com.moneyplant.screener.exceptions;

import com.moneyplant.screener.dtos.ValidationError;
import lombok.Getter;

import java.util.List;

/**
 * Exception thrown when criteria DSL validation fails.
 */
@Getter
public class CriteriaValidationException extends RuntimeException {

    private final List<ValidationError> validationErrors;

    public CriteriaValidationException(String message) {
        super(message);
        this.validationErrors = List.of();
    }

    public CriteriaValidationException(String message, List<ValidationError> validationErrors) {
        super(message);
        this.validationErrors = validationErrors;
    }

    public CriteriaValidationException(String message, Throwable cause) {
        super(message, cause);
        this.validationErrors = List.of();
    }

    public CriteriaValidationException(String message, Throwable cause, List<ValidationError> validationErrors) {
        super(message, cause);
        this.validationErrors = validationErrors;
    }
}