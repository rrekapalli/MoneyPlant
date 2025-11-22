package com.moneyplant.engines.ingestion.kite.api;

import com.moneyplant.engines.ingestion.kite.exception.KiteApiException;
import com.moneyplant.engines.ingestion.kite.exception.KiteAuthenticationException;
import com.moneyplant.engines.ingestion.kite.exception.KiteRateLimitException;
import com.moneyplant.engines.ingestion.kite.model.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for Kite Ingestion API endpoints.
 * Handles all exceptions and converts them to appropriate HTTP responses.
 */
@RestControllerAdvice
@Slf4j
public class KiteIngestionExceptionHandler {
    
    @ExceptionHandler(KiteAuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(KiteAuthenticationException ex) {
        log.error("Authentication failed", ex);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse.builder()
                .error("AUTHENTICATION_FAILED")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(KiteRateLimitException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitException(KiteRateLimitException ex) {
        log.warn("Rate limit exceeded", ex);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()))
            .body(ErrorResponse.builder()
                .error("RATE_LIMIT_EXCEEDED")
                .message(ex.getMessage())
                .retryAfter(ex.getRetryAfterSeconds())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value"
            ));
        
        log.warn("Validation failed: {}", errors);
        
        return ResponseEntity.badRequest()
            .body(ErrorResponse.builder()
                .error("VALIDATION_FAILED")
                .message("Invalid request parameters")
                .validationErrors(errors)
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(KiteApiException.class)
    public ResponseEntity<ErrorResponse> handleKiteApiException(KiteApiException ex) {
        log.error("Kite API error", ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body(ErrorResponse.builder()
                .error("KITE_API_ERROR")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex) {
        log.error("Database error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.builder()
                .error("DATABASE_ERROR")
                .message("A database error occurred")
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.builder()
                .error("INTERNAL_ERROR")
                .message("An unexpected error occurred")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
