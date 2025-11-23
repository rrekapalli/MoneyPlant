package com.moneyplant.engines.ingestion.kite.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for error responses from API endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    /**
     * Error code (e.g., "AUTHENTICATION_FAILED", "VALIDATION_FAILED").
     */
    private String error;
    
    /**
     * Human-readable error message.
     */
    private String message;
    
    /**
     * Timestamp when the error occurred.
     */
    private LocalDateTime timestamp;
    
    /**
     * Retry-After value in seconds (for rate limit errors).
     */
    private Integer retryAfter;
    
    /**
     * Validation errors (field name -> error message).
     */
    private Map<String, String> validationErrors;
}
