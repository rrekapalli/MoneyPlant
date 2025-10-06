package com.moneyplant.screener.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.screener.dtos.*;
import com.moneyplant.screener.exceptions.SqlGenerationException;
import com.moneyplant.screener.utils.SqlSecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for safe SQL generation from criteria DSL.
 * Generates parameterized SQL compatible with existing screener execution infrastructure.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CriteriaSqlService {

    private final FieldMetadataService fieldService;
    private final FunctionDefinitionService functionService;
    private final SqlSecurityUtils sqlSecurity;
    private final ObjectMapper objectMapper;
    private final CriteriaAuditService auditService;
    private final CriteriaMetricsService metricsService;

    /**
     * Generates SQL from validated criteria DSL.
     * 
     * @param dsl the validated criteria DSL
     * @param userId the user ID for context
     * @return SQL generation result with parameterized query
     */
    public SqlGenerationResult generateSql(CriteriaDSL dsl, Long userId) {
        if (dsl == null) {
            throw new SqlGenerationException("DSL cannot be null");
        }

        if (userId == null) {
            throw new SqlGenerationException("User ID cannot be null");
        }

        log.info("Generating SQL for user {} from DSL", userId);

        SqlGenerationContext context = new SqlGenerationContext(userId);
        loadUserContext(context);

        Map<String, Object> parameters = new HashMap<>();
        AtomicInteger paramCounter = new AtomicInteger(1);
        
        // Start metrics tracking
        String operationId = java.util.UUID.randomUUID().toString();
        metricsService.startSqlGenerationTimer(operationId);

        try {
            // Generate WHERE clause from root group
            String whereClause = generateGroupSql(dsl.getRoot(), context, parameters, paramCounter);
            
            // Calculate complexity score
            int complexity = calculateComplexity(dsl.getRoot());
            
            // Calculate DSL hash for caching
            String dslHash = calculateDslHash(dsl);

            SqlGenerationResult result = SqlGenerationResult.builder()
                .sql(whereClause)
                .parameters(parameters)
                .generatedAt(Instant.now())
                .generatedBy(userId.toString())
                .dslHash(dslHash)
                .estimatedComplexity(complexity)
                .build();

            log.info("Generated SQL for user {}: {} with {} parameters (complexity: {})", 
                userId, whereClause, parameters.size(), complexity);

            // Record metrics
            metricsService.recordSqlGenerationSuccess(operationId, parameters.size(), complexity);
            
            // Audit log the SQL generation
            auditService.logSqlGenerationEvent(dslHash, true, null);

            return result;

        } catch (Exception e) {
            log.error("SQL generation failed for user {}: {}", userId, e.getMessage(), e);
            metricsService.recordSqlGenerationFailure(operationId, e.getClass().getSimpleName());
            auditService.logSqlGenerationEvent(calculateDslHash(dsl), false, e.getMessage());
            throw new SqlGenerationException("SQL generation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Loads user context with available fields and functions.
     */
    private void loadUserContext(SqlGenerationContext context) {
        try {
            List<FieldMetaResp> userFields = fieldService.getFieldsForUser(context.getUserId());
            List<FunctionMetaResp> userFunctions = functionService.getFunctionsForUser(context.getUserId());

            context.setAvailableFields(userFields);
            context.setAvailableFunctions(userFunctions);

            log.debug("Loaded context for user {}: {} fields, {} functions", 
                context.getUserId(), userFields.size(), userFunctions.size());

        } catch (Exception e) {
            log.error("Failed to load user context for user {}: {}", context.getUserId(), e.getMessage());
            throw new SqlGenerationException("Failed to load user context: " + e.getMessage(), e);
        }
    }

    /**
     * Generates SQL for a group (AND/OR/NOT logic).
     */
    private String generateGroupSql(Group group, SqlGenerationContext context,
                                  Map<String, Object> parameters, AtomicInteger paramCounter) {
        
        if (group == null) {
            throw new SqlGenerationException("Group cannot be null");
        }

        if (group.getChildren() == null || group.getChildren().isEmpty()) {
            throw new SqlGenerationException("Group must have at least one child");
        }

        List<String> childSqls = new ArrayList<>();

        for (Object child : group.getChildren()) {
            if (child instanceof Condition) {
                String conditionSql = generateConditionSql((Condition) child, context, parameters, paramCounter);
                childSqls.add(conditionSql);
            } else if (child instanceof Group) {
                String groupSql = generateGroupSql((Group) child, context, parameters, paramCounter);
                childSqls.add("(" + groupSql + ")");
            } else {
                throw new SqlGenerationException("Invalid child type in group: " + 
                    (child != null ? child.getClass().getSimpleName() : "null"));
            }
        }

        String operator = group.getOperator();
        if ("NOT".equals(operator)) {
            if (childSqls.size() != 1) {
                throw new SqlGenerationException("NOT groups must have exactly one child");
            }
            return "NOT (" + childSqls.get(0) + ")";
        } else if ("AND".equals(operator) || "OR".equals(operator)) {
            return String.join(" " + operator + " ", childSqls);
        } else {
            throw new SqlGenerationException("Invalid group operator: " + operator);
        }
    }

    /**
     * Generates SQL for a condition (comparison).
     */
    private String generateConditionSql(Condition condition, SqlGenerationContext context,
                                      Map<String, Object> parameters, AtomicInteger paramCounter) {
        
        if (condition == null) {
            throw new SqlGenerationException("Condition cannot be null");
        }

        // Generate left side SQL
        String leftSql = generateExpressionSql(condition.getLeft(), context, parameters, paramCounter);

        // Generate operator and right side SQL
        String operatorSql = generateOperatorSql(condition.getOperator(), condition.getRight(), 
                                               context, parameters, paramCounter);

        return leftSql + " " + operatorSql;
    }

    /**
     * Generates SQL for an expression (field, function, or literal).
     */
    private String generateExpressionSql(Object expression, SqlGenerationContext context,
                                       Map<String, Object> parameters, AtomicInteger paramCounter) {
        
        if (expression == null) {
            throw new SqlGenerationException("Expression cannot be null");
        }

        if (expression instanceof FieldRef) {
            return generateFieldRefSql((FieldRef) expression, context);
        } else if (expression instanceof FunctionCall) {
            return generateFunctionSql((FunctionCall) expression, context, parameters, paramCounter);
        } else if (expression instanceof Literal) {
            return generateLiteralSql((Literal) expression, parameters, paramCounter);
        } else {
            throw new SqlGenerationException("Unknown expression type: " + expression.getClass().getSimpleName());
        }
    }

    /**
     * Generates SQL for a field reference.
     */
    private String generateFieldRefSql(FieldRef fieldRef, SqlGenerationContext context) {
        if (fieldRef.getField() == null || fieldRef.getField().trim().isEmpty()) {
            throw new SqlGenerationException("Field name cannot be empty");
        }

        FieldMetaResp field = context.getField(fieldRef.getField());
        if (field == null) {
            auditService.logSecurityEvent("UNAUTHORIZED_FIELD_ACCESS", 
                "Attempted to generate SQL for unauthorized field: " + fieldRef.getField());
            throw new SqlGenerationException("Unknown or inaccessible field: " + fieldRef.getField());
        }

        // Sanitize and return column name
        return sqlSecurity.sanitizeColumnName(field.getDbColumn());
    }

    /**
     * Generates SQL for a function call.
     */
    private String generateFunctionSql(FunctionCall functionCall, SqlGenerationContext context,
                                     Map<String, Object> parameters, AtomicInteger paramCounter) {
        
        if (functionCall.getName() == null || functionCall.getName().trim().isEmpty()) {
            throw new SqlGenerationException("Function name cannot be empty");
        }

        FunctionMetaResp function = context.getFunction(functionCall.getName());
        if (function == null) {
            auditService.logSecurityEvent("UNAUTHORIZED_FUNCTION_ACCESS", 
                "Attempted to generate SQL for unauthorized function: " + functionCall.getName());
            throw new SqlGenerationException("Unknown or inaccessible function: " + functionCall.getName());
        }

        // Generate argument SQLs
        List<String> argSqls = new ArrayList<>();
        List<Object> providedParams = functionCall.getParameters() != null ? 
            functionCall.getParameters() : List.of();

        for (Object arg : providedParams) {
            String argSql = generateExpressionSql(arg, context, parameters, paramCounter);
            argSqls.add(argSql);
        }

        // Apply SQL template if available
        String sqlTemplate = function.getSqlTemplate();
        if (sqlTemplate != null && !sqlTemplate.trim().isEmpty()) {
            return processSqlTemplate(sqlTemplate, argSqls, function);
        } else {
            // Default function call format: FUNCTION_NAME(arg1, arg2, ...)
            String sanitizedName = sqlSecurity.sanitizeFunctionName(function.getId());
            return sanitizedName + "(" + String.join(", ", argSqls) + ")";
        }
    }

    /**
     * Processes SQL template with token replacement.
     */
    private String processSqlTemplate(String template, List<String> argSqls, FunctionMetaResp function) {
        sqlSecurity.validateSqlTemplate(template);
        
        String result = template;
        
        // Replace argument tokens {{arg0}}, {{arg1}}, etc.
        for (int i = 0; i < argSqls.size(); i++) {
            String token = "{{arg" + i + "}}";
            result = result.replace(token, argSqls.get(i));
        }
        
        // Replace common tokens
        result = result.replace("{{function}}", sqlSecurity.sanitizeFunctionName(function.getId()));
        
        // Check for unreplaced tokens
        if (result.contains("{{") && result.contains("}}")) {
            log.warn("Unreplaced tokens found in SQL template for function {}: {}", 
                function.getId(), result);
        }
        
        return result;
    }

    /**
     * Generates SQL for a literal value.
     */
    private String generateLiteralSql(Literal literal, Map<String, Object> parameters, AtomicInteger paramCounter) {
        String paramName = sqlSecurity.generateParameterName(paramCounter.getAndIncrement());
        parameters.put(paramName, literal.getValue());
        return ":" + paramName;
    }

    /**
     * Generates SQL for operators with right operands.
     */
    private String generateOperatorSql(String operator, Object right, SqlGenerationContext context,
                                     Map<String, Object> parameters, AtomicInteger paramCounter) {
        
        switch (operator) {
            case "=":
            case "!=":
            case ">":
            case ">=":
            case "<":
            case "<=":
            case "LIKE":
            case "NOT_LIKE":
                if (right == null) {
                    throw new SqlGenerationException("Operator " + operator + " requires a right operand");
                }
                String rightSql = generateExpressionSql(right, context, parameters, paramCounter);
                return operator + " " + rightSql;

            case "IN":
            case "NOT_IN":
                return generateInOperatorSql(operator, right, context, parameters, paramCounter);

            case "BETWEEN":
            case "NOT_BETWEEN":
                return generateBetweenOperatorSql(operator, right, context, parameters, paramCounter);

            case "IS_NULL":
                return "IS NULL";

            case "IS_NOT_NULL":
                return "IS NOT NULL";

            default:
                throw new SqlGenerationException("Unknown operator: " + operator);
        }
    }

    /**
     * Generates SQL for IN/NOT_IN operators.
     */
    private String generateInOperatorSql(String operator, Object right, SqlGenerationContext context,
                                       Map<String, Object> parameters, AtomicInteger paramCounter) {
        
        if (right == null) {
            throw new SqlGenerationException("IN/NOT_IN operators require a right operand");
        }

        if (!(right instanceof Literal)) {
            throw new SqlGenerationException("IN/NOT_IN operators require a literal array");
        }

        Literal literal = (Literal) right;
        if (!"ARRAY".equals(literal.getType())) {
            throw new SqlGenerationException("IN/NOT_IN operators require ARRAY type literal");
        }

        if (!(literal.getValue() instanceof List)) {
            throw new SqlGenerationException("IN/NOT_IN array value must be a List");
        }

        @SuppressWarnings("unchecked")
        List<Object> values = (List<Object>) literal.getValue();
        
        if (values.isEmpty()) {
            // Handle empty IN clause
            return "IN".equals(operator) ? "= NULL AND 1=0" : "IS NOT NULL OR 1=1";
        }

        List<String> paramNames = new ArrayList<>();
        for (Object value : values) {
            String paramName = sqlSecurity.generateParameterName(paramCounter.getAndIncrement());
            parameters.put(paramName, value);
            paramNames.add(":" + paramName);
        }

        String sqlOperator = "IN".equals(operator) ? "IN" : "NOT IN";
        return sqlOperator + " (" + String.join(", ", paramNames) + ")";
    }

    /**
     * Generates SQL for BETWEEN/NOT_BETWEEN operators.
     */
    private String generateBetweenOperatorSql(String operator, Object right, SqlGenerationContext context,
                                            Map<String, Object> parameters, AtomicInteger paramCounter) {
        
        if (right == null) {
            throw new SqlGenerationException("BETWEEN/NOT_BETWEEN operators require a right operand");
        }

        if (!(right instanceof Literal)) {
            throw new SqlGenerationException("BETWEEN/NOT_BETWEEN operators require a literal array");
        }

        Literal literal = (Literal) right;
        if (!"ARRAY".equals(literal.getType())) {
            throw new SqlGenerationException("BETWEEN/NOT_BETWEEN operators require ARRAY type literal");
        }

        if (!(literal.getValue() instanceof List)) {
            throw new SqlGenerationException("BETWEEN/NOT_BETWEEN array value must be a List");
        }

        @SuppressWarnings("unchecked")
        List<Object> values = (List<Object>) literal.getValue();
        
        if (values.size() != 2) {
            throw new SqlGenerationException("BETWEEN/NOT_BETWEEN requires exactly 2 values, got " + values.size());
        }

        String param1 = sqlSecurity.generateParameterName(paramCounter.getAndIncrement());
        String param2 = sqlSecurity.generateParameterName(paramCounter.getAndIncrement());
        
        parameters.put(param1, values.get(0));
        parameters.put(param2, values.get(1));

        String sqlOperator = "BETWEEN".equals(operator) ? "BETWEEN" : "NOT BETWEEN";
        return sqlOperator + " :" + param1 + " AND :" + param2;
    }

    /**
     * Calculates complexity score for the DSL.
     */
    private int calculateComplexity(Group group) {
        int complexity = 1; // Base complexity for the group
        
        if (group.getChildren() != null) {
            for (Object child : group.getChildren()) {
                if (child instanceof Condition) {
                    complexity += 1;
                    // Add complexity for function calls
                    Condition condition = (Condition) child;
                    if (condition.getLeft() instanceof FunctionCall) {
                        complexity += 2;
                    }
                    if (condition.getRight() instanceof FunctionCall) {
                        complexity += 2;
                    }
                } else if (child instanceof Group) {
                    complexity += calculateComplexity((Group) child);
                }
            }
        }
        
        return complexity;
    }

    /**
     * Calculates hash of DSL for caching purposes.
     */
    private String calculateDslHash(CriteriaDSL dsl) {
        try {
            String dslJson = objectMapper.writeValueAsString(dsl);
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(dslJson.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            log.warn("Failed to calculate DSL hash: {}", e.getMessage());
            return "unknown-" + System.currentTimeMillis();
        }
    }
}