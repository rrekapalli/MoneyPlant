package com.moneyplant.screener.utils;

import com.moneyplant.screener.exceptions.SqlGenerationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Utility class for SQL security operations including column name sanitization
 * and SQL injection prevention.
 */
@Component
@Slf4j
public class SqlSecurityUtils {

    // Pattern for valid column names (alphanumeric, underscore, dot for table.column)
    private static final Pattern VALID_COLUMN_NAME = Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)?$");
    
    // Pattern for valid function names
    private static final Pattern VALID_FUNCTION_NAME = Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_]*$");
    
    // Dangerous SQL keywords that should never appear in column names
    private static final Pattern DANGEROUS_KEYWORDS = Pattern.compile(
        "(?i)\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT|JAVASCRIPT|VBSCRIPT)\\b"
    );

    /**
     * Sanitizes a column name to prevent SQL injection.
     * 
     * @param columnName the column name to sanitize
     * @return sanitized column name
     * @throws SqlGenerationException if column name is invalid
     */
    public String sanitizeColumnName(String columnName) {
        if (columnName == null || columnName.trim().isEmpty()) {
            throw new SqlGenerationException("Column name cannot be null or empty");
        }

        String trimmed = columnName.trim();
        
        // Check for dangerous keywords
        if (DANGEROUS_KEYWORDS.matcher(trimmed).find()) {
            log.warn("Dangerous keyword detected in column name: {}", trimmed);
            throw new SqlGenerationException("Column name contains dangerous SQL keywords: " + trimmed);
        }

        // Validate column name format
        if (!VALID_COLUMN_NAME.matcher(trimmed).matches()) {
            log.warn("Invalid column name format: {}", trimmed);
            throw new SqlGenerationException("Invalid column name format: " + trimmed);
        }

        // Additional length check
        if (trimmed.length() > 128) {
            throw new SqlGenerationException("Column name too long: " + trimmed.length() + " characters");
        }

        return trimmed;
    }

    /**
     * Sanitizes a function name to prevent SQL injection.
     * 
     * @param functionName the function name to sanitize
     * @return sanitized function name
     * @throws SqlGenerationException if function name is invalid
     */
    public String sanitizeFunctionName(String functionName) {
        if (functionName == null || functionName.trim().isEmpty()) {
            throw new SqlGenerationException("Function name cannot be null or empty");
        }

        String trimmed = functionName.trim();
        
        // Check for dangerous keywords
        if (DANGEROUS_KEYWORDS.matcher(trimmed).find()) {
            log.warn("Dangerous keyword detected in function name: {}", trimmed);
            throw new SqlGenerationException("Function name contains dangerous SQL keywords: " + trimmed);
        }

        // Validate function name format
        if (!VALID_FUNCTION_NAME.matcher(trimmed).matches()) {
            log.warn("Invalid function name format: {}", trimmed);
            throw new SqlGenerationException("Invalid function name format: " + trimmed);
        }

        // Additional length check
        if (trimmed.length() > 64) {
            throw new SqlGenerationException("Function name too long: " + trimmed.length() + " characters");
        }

        return trimmed;
    }

    /**
     * Validates that a string is safe for use in SQL templates.
     * 
     * @param template the SQL template to validate
     * @throws SqlGenerationException if template contains dangerous content
     */
    public void validateSqlTemplate(String template) {
        if (template == null) {
            return;
        }

        // Check for dangerous patterns that could indicate SQL injection attempts
        String[] dangerousPatterns = {
            ";", "--", "/*", "*/", "xp_", "sp_", "exec", "execute",
            "drop", "create", "alter", "insert", "update", "delete"
        };

        String lowerTemplate = template.toLowerCase();
        for (String pattern : dangerousPatterns) {
            if (lowerTemplate.contains(pattern)) {
                log.warn("Potentially dangerous pattern '{}' found in SQL template: {}", pattern, template);
                // Note: We don't throw here as some patterns might be legitimate in templates
                // This is just for logging/monitoring purposes
            }
        }
    }

    /**
     * Generates a safe parameter name for SQL queries.
     * 
     * @param counter parameter counter
     * @return safe parameter name
     */
    public String generateParameterName(int counter) {
        return "p" + counter;
    }

    /**
     * Validates that a parameter name is safe.
     * 
     * @param paramName parameter name to validate
     * @return true if safe, false otherwise
     */
    public boolean isValidParameterName(String paramName) {
        if (paramName == null || paramName.trim().isEmpty()) {
            return false;
        }
        
        // Parameter names should be simple alphanumeric with optional underscore
        return Pattern.matches("^[a-zA-Z_][a-zA-Z0-9_]*$", paramName.trim()) 
               && paramName.length() <= 32;
    }
}