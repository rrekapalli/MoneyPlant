package com.moneyplant.screener.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Utility class for integrating criteria functionality with existing screener infrastructure.
 */
@Component
@Slf4j
public class ScreenerIntegrationUtils {

    /**
     * Creates parameter schema compatible with existing screener parameter handling.
     * This ensures that criteria-generated parameters work with the existing execution framework.
     */
    public Map<String, Object> createParameterSchema(Map<String, Object> parameters) {
        Map<String, Object> schema = new HashMap<>();
        
        // Create parameter definitions for each parameter
        Map<String, Object> paramDefs = new HashMap<>();
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            Map<String, Object> paramDef = new HashMap<>();
            paramDef.put("type", determineParameterType(entry.getValue()));
            paramDef.put("value", entry.getValue());
            paramDef.put("source", "criteria-builder");
            paramDefs.put(entry.getKey(), paramDef);
        }
        
        schema.put("parameters", paramDefs);
        schema.put("version", "1.0");
        schema.put("generatedBy", "criteria-builder");
        schema.put("parameterCount", parameters.size());
        
        return schema;
    }

    /**
     * Determines parameter type for schema generation.
     */
    private String determineParameterType(Object value) {
        if (value == null) {
            return "null";
        } else if (value instanceof String) {
            return "string";
        } else if (value instanceof Integer || value instanceof Long) {
            return "integer";
        } else if (value instanceof Double || value instanceof Float) {
            return "number";
        } else if (value instanceof Boolean) {
            return "boolean";
        } else if (value instanceof List) {
            return "array";
        } else {
            return "object";
        }
    }

    /**
     * Validates that generated SQL is compatible with existing screener execution framework.
     */
    public boolean isValidScreenerSql(String sql) {
        if (sql == null || sql.trim().isEmpty()) {
            return false;
        }

        // Basic validation - should not contain dangerous keywords at the start
        String trimmedSql = sql.trim().toLowerCase();
        
        // SQL should not start with dangerous statements
        String[] dangerousStarts = {"drop", "create", "alter", "insert", "update", "delete", "exec", "execute"};
        for (String dangerous : dangerousStarts) {
            if (trimmedSql.startsWith(dangerous)) {
                log.warn("SQL starts with dangerous keyword: {}", dangerous);
                return false;
            }
        }

        // Should contain parameter placeholders (indicating parameterized query)
        if (!sql.contains(":")) {
            log.warn("SQL does not contain parameter placeholders");
            return false;
        }

        return true;
    }

    /**
     * Extracts parameter names from SQL for validation.
     */
    public List<String> extractParameterNames(String sql) {
        if (sql == null) {
            return List.of();
        }

        // Simple regex to find :paramName patterns
        return java.util.regex.Pattern.compile(":(\\w+)")
            .matcher(sql)
            .results()
            .map(match -> match.group(1))
            .distinct()
            .toList();
    }

    /**
     * Validates that all SQL parameters have corresponding values.
     */
    public boolean validateParameterMapping(String sql, Map<String, Object> parameters) {
        List<String> sqlParams = extractParameterNames(sql);
        
        for (String sqlParam : sqlParams) {
            if (!parameters.containsKey(sqlParam)) {
                log.warn("SQL parameter '{}' not found in parameter map", sqlParam);
                return false;
            }
        }

        return true;
    }
}