package com.moneyplant.screener.services;

import com.moneyplant.screener.config.CriteriaValidationConfig;
import com.moneyplant.screener.dtos.*;
import com.moneyplant.screener.exceptions.CriteriaValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for comprehensive DSL validation with visual interface support.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CriteriaValidationService {

    private final FieldMetadataService fieldService;
    private final FunctionDefinitionService functionService;
    private final CurrentUserService currentUserService;
    private final CriteriaValidationConfig config;
    private final CriteriaAuditService auditService;

    // Supported operators and their compatibility
    private static final Map<String, Set<String>> OPERATOR_COMPATIBILITY = Map.of(
        "STRING", Set.of("=", "!=", "LIKE", "NOT_LIKE", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL"),
        "NUMBER", Set.of("=", "!=", ">", ">=", "<", "<=", "IN", "NOT_IN", "BETWEEN", "NOT_BETWEEN", "IS_NULL", "IS_NOT_NULL"),
        "INTEGER", Set.of("=", "!=", ">", ">=", "<", "<=", "IN", "NOT_IN", "BETWEEN", "NOT_BETWEEN", "IS_NULL", "IS_NOT_NULL"),
        "DATE", Set.of("=", "!=", ">", ">=", "<", "<=", "IN", "NOT_IN", "BETWEEN", "NOT_BETWEEN", "IS_NULL", "IS_NOT_NULL"),
        "BOOLEAN", Set.of("=", "!=", "IS_NULL", "IS_NOT_NULL"),
        "ENUM", Set.of("=", "!=", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL"),
        "PERCENT", Set.of("=", "!=", ">", ">=", "<", "<=", "IN", "NOT_IN", "BETWEEN", "NOT_BETWEEN", "IS_NULL", "IS_NOT_NULL"),
        "CURRENCY", Set.of("=", "!=", ">", ">=", "<", "<=", "IN", "NOT_IN", "BETWEEN", "NOT_BETWEEN", "IS_NULL", "IS_NOT_NULL")
    );

    private static final Set<String> OPERATORS_REQUIRING_RIGHT_OPERAND = Set.of(
        "=", "!=", ">", ">=", "<", "<=", "LIKE", "NOT_LIKE", "IN", "NOT_IN", "BETWEEN", "NOT_BETWEEN"
    );

    /**
     * Validates a complete criteria DSL.
     */
    public ValidationResult validateDSL(CriteriaDSL dsl, Long userId) {
        // Security check: ensure user is authenticated
        if (userId == null) {
            throw new CriteriaValidationException("User authentication required for criteria validation");
        }

        // Verify current user matches the provided userId (security check)
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            auditService.logSecurityEvent("UNAUTHORIZED_VALIDATION_ATTEMPT", 
                "User " + currentUserId + " attempted to validate criteria for user " + userId);
            throw new CriteriaValidationException("Unauthorized: cannot validate criteria for another user");
        }

        ValidationContext context = new ValidationContext(userId);
        context.setMaxDepth(config.getMaxGroupDepth());
        context.setMaxConditions(config.getMaxConditions());
        
        List<ValidationError> errors = new ArrayList<>();
        List<ValidationWarning> warnings = new ArrayList<>();
        String dslHash = calculateDslHash(dsl);

        try {
            // Load user's available fields and functions
            List<FieldMetaResp> userFields = fieldService.getFieldsForUser(userId);
            List<FunctionMetaResp> userFunctions = functionService.getFunctionsForUser(userId);

            context.setAvailableFields(userFields);
            context.setAvailableFunctions(userFunctions);
            
            // Create lookup maps for performance
            context.setFieldMap(userFields.stream()
                .collect(Collectors.toMap(FieldMetaResp::getId, f -> f)));
            context.setFunctionMap(userFunctions.stream()
                .collect(Collectors.toMap(FunctionMetaResp::getId, f -> f)));

            // Validate DSL structure
            if (dsl == null) {
                errors.add(ValidationError.builder()
                    .code("NULL_DSL")
                    .message("DSL cannot be null")
                    .path("$")
                    .build());
                return buildResult(false, errors, warnings, userId, dsl);
            }

            if (dsl.getRoot() == null) {
                errors.add(ValidationError.builder()
                    .code("NULL_ROOT")
                    .message("Root group cannot be null")
                    .path("$.root")
                    .build());
                return buildResult(false, errors, warnings, userId, dsl);
            }

            // Structure validation
            validateStructure(dsl, context, errors, warnings);

            // Semantic validation (only if structure is valid)
            if (errors.isEmpty()) {
                validateSemantics(dsl, context, errors, warnings);
            }

            // Performance validation (warnings only)
            if (config.isEnablePerformanceWarnings()) {
                validatePerformance(dsl, context, warnings);
            }

        } catch (Exception e) {
            log.error("Validation error for user {}: {}", userId, e.getMessage(), e);
            auditService.logSecurityEvent("VALIDATION_ERROR", "Internal validation error: " + e.getMessage());
            errors.add(ValidationError.builder()
                .code("VALIDATION_ERROR")
                .message("Internal validation error: " + e.getMessage())
                .path("$.root")
                .build());
        }

        ValidationResult result = buildResult(errors.isEmpty(), errors, warnings, userId, dsl);
        
        // Audit log the validation event
        auditService.logValidationEvent(dslHash, result.isValid(), 
            result.getErrors().size(), result.getWarnings().size());

        return result;
    }

    /**
     * Validates the structural integrity of the DSL.
     */
    private void validateStructure(CriteriaDSL dsl, ValidationContext context, 
                                 List<ValidationError> errors, List<ValidationWarning> warnings) {
        
        // Check depth limits
        validateGroupDepth(dsl.getRoot(), 0, context.getMaxDepth(), errors, "$.root");

        // Check complexity limits
        int conditionCount = countConditions(dsl.getRoot());
        context.setConditionCount(conditionCount);
        
        if (conditionCount > context.getMaxConditions()) {
            errors.add(ValidationError.builder()
                .code("MAX_CONDITIONS_EXCEEDED")
                .message("Too many conditions: " + conditionCount + " (max: " + context.getMaxConditions() + ")")
                .path("$.root")
                .suggestion("Simplify the criteria by reducing the number of conditions")
                .build());
        }

        // Validate group structure
        validateGroup(dsl.getRoot(), context, errors, warnings, "$.root");
    }

    /**
     * Validates semantic correctness of the DSL.
     */
    private void validateSemantics(CriteriaDSL dsl, ValidationContext context,
                                 List<ValidationError> errors, List<ValidationWarning> warnings) {
        
        // Validate all field and function references
        validateReferences(dsl.getRoot(), context, errors, warnings, "$.root");
    }

    /**
     * Validates performance characteristics and generates warnings.
     */
    private void validatePerformance(CriteriaDSL dsl, ValidationContext context, List<ValidationWarning> warnings) {
        
        if (context.getConditionCount() > config.getComplexityWarningThreshold()) {
            warnings.add(ValidationWarning.builder()
                .code("PERFORMANCE_CONCERN")
                .message("Complex criteria with " + context.getConditionCount() + " conditions may impact performance")
                .path("$.root")
                .suggestion("Consider simplifying the criteria or using indexed fields")
                .build());
        }

        // Check for deeply nested groups
        int maxDepth = getMaxDepth(dsl.getRoot(), 0);
        if (maxDepth > 5) {
            warnings.add(ValidationWarning.builder()
                .code("DEEP_NESTING")
                .message("Deeply nested groups (depth: " + maxDepth + ") may be hard to understand")
                .path("$.root")
                .suggestion("Consider flattening the group structure")
                .build());
        }
    }

    /**
     * Validates group depth recursively.
     */
    private void validateGroupDepth(Group group, int currentDepth, int maxDepth, 
                                  List<ValidationError> errors, String path) {
        
        if (currentDepth > maxDepth) {
            errors.add(ValidationError.builder()
                .code("MAX_DEPTH_EXCEEDED")
                .message("Group nesting too deep: " + currentDepth + " (max: " + maxDepth + ")")
                .path(path)
                .suggestion("Reduce nesting depth by flattening group structure")
                .build());
            return;
        }

        if (group.getChildren() != null) {
            for (int i = 0; i < group.getChildren().size(); i++) {
                Object child = group.getChildren().get(i);
                if (child instanceof Group) {
                    validateGroupDepth((Group) child, currentDepth + 1, maxDepth, errors, 
                        path + ".children[" + i + "]");
                }
            }
        }
    }

    /**
     * Counts total conditions in the DSL.
     */
    private int countConditions(Group group) {
        int count = 0;
        if (group.getChildren() != null) {
            for (Object child : group.getChildren()) {
                if (child instanceof Condition) {
                    count++;
                } else if (child instanceof Group) {
                    count += countConditions((Group) child);
                }
            }
        }
        return count;
    }

    /**
     * Gets maximum nesting depth.
     */
    private int getMaxDepth(Group group, int currentDepth) {
        int maxDepth = currentDepth;
        if (group.getChildren() != null) {
            for (Object child : group.getChildren()) {
                if (child instanceof Group) {
                    maxDepth = Math.max(maxDepth, getMaxDepth((Group) child, currentDepth + 1));
                }
            }
        }
        return maxDepth;
    }

    /**
     * Validates a group structure.
     */
    private void validateGroup(Group group, ValidationContext context,
                             List<ValidationError> errors, List<ValidationWarning> warnings, String path) {
        
        // Validate operator
        if (group.getOperator() == null) {
            errors.add(ValidationError.builder()
                .code("NULL_OPERATOR")
                .message("Group operator cannot be null")
                .path(path + ".operator")
                .build());
            return;
        }

        if (!Arrays.asList("AND", "OR", "NOT").contains(group.getOperator())) {
            errors.add(ValidationError.builder()
                .code("INVALID_OPERATOR")
                .message("Invalid group operator: " + group.getOperator())
                .path(path + ".operator")
                .suggestion("Use one of: AND, OR, NOT")
                .build());
        }

        // Validate children
        if (group.getChildren() == null || group.getChildren().isEmpty()) {
            errors.add(ValidationError.builder()
                .code("EMPTY_GROUP")
                .message("Group must have at least one child")
                .path(path + ".children")
                .build());
            return;
        }

        // NOT groups should have exactly one child
        if ("NOT".equals(group.getOperator()) && group.getChildren().size() != 1) {
            errors.add(ValidationError.builder()
                .code("INVALID_NOT_GROUP")
                .message("NOT groups must have exactly one child")
                .path(path)
                .suggestion("NOT groups should contain exactly one condition or group")
                .build());
        }

        // Validate children recursively
        for (int i = 0; i < group.getChildren().size(); i++) {
            Object child = group.getChildren().get(i);
            String childPath = path + ".children[" + i + "]";

            if (child instanceof Condition) {
                validateCondition((Condition) child, context, errors, warnings, childPath);
            } else if (child instanceof Group) {
                validateGroup((Group) child, context, errors, warnings, childPath);
            } else {
                errors.add(ValidationError.builder()
                    .code("INVALID_CHILD_TYPE")
                    .message("Invalid child type: " + (child != null ? child.getClass().getSimpleName() : "null"))
                    .path(childPath)
                    .suggestion("Children must be Condition or Group objects")
                    .build());
            }
        }
    }

    /**
     * Validates a condition.
     */
    private void validateCondition(Condition condition, ValidationContext context,
                                 List<ValidationError> errors, List<ValidationWarning> warnings, String path) {
        
        // Validate left side
        String leftType = validateLeftSide(condition.getLeft(), context, errors, warnings, path + ".left");

        // Validate operator
        if (condition.getOperator() == null) {
            errors.add(ValidationError.builder()
                .code("NULL_OPERATOR")
                .message("Condition operator cannot be null")
                .path(path + ".operator")
                .build());
            return;
        }

        // Validate operator compatibility with left type
        if (leftType != null) {
            validateOperatorCompatibility(condition.getOperator(), leftType, errors, path + ".operator");
        }

        // Validate right side if required
        if (requiresRightSide(condition.getOperator())) {
            if (condition.getRight() == null) {
                errors.add(ValidationError.builder()
                    .code("MISSING_RIGHT_OPERAND")
                    .message("Operator " + condition.getOperator() + " requires a right operand")
                    .path(path + ".right")
                    .build());
            } else {
                validateRightSide(condition.getRight(), condition.getOperator(), leftType, 
                                context, errors, warnings, path + ".right");
            }
        } else if (condition.getRight() != null) {
            warnings.add(ValidationWarning.builder()
                .code("UNNECESSARY_RIGHT_OPERAND")
                .message("Operator " + condition.getOperator() + " does not require a right operand")
                .path(path + ".right")
                .suggestion("Remove the right operand for " + condition.getOperator() + " operators")
                .build());
        }
    }

    /**
     * Validates the left side of a condition and returns its type.
     */
    private String validateLeftSide(Object left, ValidationContext context,
                                  List<ValidationError> errors, List<ValidationWarning> warnings, String path) {
        
        if (left == null) {
            errors.add(ValidationError.builder()
                .code("NULL_LEFT_OPERAND")
                .message("Left operand cannot be null")
                .path(path)
                .build());
            return null;
        }

        if (left instanceof FieldRef) {
            return validateFieldRef((FieldRef) left, context, errors, warnings, path);
        } else if (left instanceof FunctionCall) {
            return validateFunctionCall((FunctionCall) left, context, errors, warnings, path);
        } else {
            errors.add(ValidationError.builder()
                .code("INVALID_LEFT_OPERAND")
                .message("Left operand must be a field reference or function call")
                .path(path)
                .suggestion("Use FieldRef or FunctionCall for left operand")
                .build());
            return null;
        }
    }

    /**
     * Validates a field reference.
     */
    private String validateFieldRef(FieldRef fieldRef, ValidationContext context,
                                  List<ValidationError> errors, List<ValidationWarning> warnings, String path) {
        
        if (fieldRef.getField() == null || fieldRef.getField().trim().isEmpty()) {
            errors.add(ValidationError.builder()
                .code("EMPTY_FIELD_NAME")
                .message("Field name cannot be empty")
                .path(path + ".field")
                .build());
            return null;
        }

        FieldMetaResp field = context.getField(fieldRef.getField());
        if (field == null) {
            // Log field access attempt for security monitoring
            auditService.logFieldAccessEvent(fieldRef.getField(), "ACCESS_DENIED");
            auditService.logSecurityEvent("UNAUTHORIZED_FIELD_ACCESS", 
                "User attempted to access unauthorized field: " + fieldRef.getField());
            
            errors.add(ValidationError.builder()
                .code("UNKNOWN_FIELD")
                .message("Unknown or inaccessible field: " + fieldRef.getField())
                .path(path + ".field")
                .suggestion("Check field name and user permissions")
                .build());
            return null;
        }

        // Log successful field access
        auditService.logFieldAccessEvent(fieldRef.getField(), "ACCESS_GRANTED");
        return field.getDataType();
    }

    /**
     * Validates a function call.
     */
    private String validateFunctionCall(FunctionCall functionCall, ValidationContext context,
                                      List<ValidationError> errors, List<ValidationWarning> warnings, String path) {
        
        if (functionCall.getName() == null || functionCall.getName().trim().isEmpty()) {
            errors.add(ValidationError.builder()
                .code("EMPTY_FUNCTION_NAME")
                .message("Function name cannot be empty")
                .path(path + ".name")
                .build());
            return null;
        }

        FunctionMetaResp function = context.getFunction(functionCall.getName());
        if (function == null) {
            // Log function access attempt for security monitoring
            auditService.logFunctionAccessEvent(functionCall.getName(), "ACCESS_DENIED");
            auditService.logSecurityEvent("UNAUTHORIZED_FUNCTION_ACCESS", 
                "User attempted to access unauthorized function: " + functionCall.getName());
            
            errors.add(ValidationError.builder()
                .code("UNKNOWN_FUNCTION")
                .message("Unknown or inaccessible function: " + functionCall.getName())
                .path(path + ".name")
                .suggestion("Check function name and user permissions")
                .build());
            return null;
        }

        // Log successful function access
        auditService.logFunctionAccessEvent(functionCall.getName(), "ACCESS_GRANTED");

        // Validate parameters
        validateFunctionParameters(functionCall, function, context, errors, warnings, path);

        return function.getReturnType();
    }

    /**
     * Validates function parameters.
     */
    private void validateFunctionParameters(FunctionCall functionCall, FunctionMetaResp function,
                                          ValidationContext context, List<ValidationError> errors,
                                          List<ValidationWarning> warnings, String path) {
        
        List<Object> providedParams = functionCall.getParameters() != null ? 
            functionCall.getParameters() : List.of();
        List<FunctionParameterResp> expectedParams = function.getParameters() != null ? 
            function.getParameters() : List.of();

        // Check parameter count
        long requiredParams = expectedParams.stream().filter(FunctionParameterResp::isRequired).count();
        
        if (providedParams.size() < requiredParams) {
            errors.add(ValidationError.builder()
                .code("INSUFFICIENT_PARAMETERS")
                .message("Function " + function.getLabel() + " requires " + requiredParams + 
                        " parameters, got " + providedParams.size())
                .path(path + ".parameters")
                .build());
        }

        if (providedParams.size() > expectedParams.size()) {
            errors.add(ValidationError.builder()
                .code("TOO_MANY_PARAMETERS")
                .message("Function " + function.getLabel() + " accepts at most " + expectedParams.size() + 
                        " parameters, got " + providedParams.size())
                .path(path + ".parameters")
                .build());
        }

        // Validate individual parameters
        for (int i = 0; i < Math.min(providedParams.size(), expectedParams.size()); i++) {
            Object param = providedParams.get(i);
            FunctionParameterResp expectedParam = expectedParams.get(i);
            String paramPath = path + ".parameters[" + i + "]";

            validateFunctionParameter(param, expectedParam, context, errors, warnings, paramPath);
        }
    }

    /**
     * Validates a single function parameter.
     */
    private void validateFunctionParameter(Object param, FunctionParameterResp expectedParam,
                                         ValidationContext context, List<ValidationError> errors,
                                         List<ValidationWarning> warnings, String path) {
        
        if (param == null) {
            if (expectedParam.isRequired()) {
                errors.add(ValidationError.builder()
                    .code("NULL_REQUIRED_PARAMETER")
                    .message("Required parameter " + expectedParam.getName() + " cannot be null")
                    .path(path)
                    .build());
            }
            return;
        }

        // Validate parameter type based on expected type
        String expectedType = expectedParam.getType();
        boolean validType = false;

        switch (expectedType) {
            case "FIELD":
                validType = param instanceof FieldRef;
                if (validType) {
                    validateFieldRef((FieldRef) param, context, errors, warnings, path);
                }
                break;
            case "FUNCTION":
                validType = param instanceof FunctionCall;
                if (validType) {
                    validateFunctionCall((FunctionCall) param, context, errors, warnings, path);
                }
                break;
            case "STRING":
            case "NUMBER":
            case "INTEGER":
            case "DATE":
            case "BOOLEAN":
                validType = param instanceof Literal;
                if (validType) {
                    validateLiteralType((Literal) param, expectedType, errors, path);
                }
                break;
        }

        if (!validType) {
            errors.add(ValidationError.builder()
                .code("INVALID_PARAMETER_TYPE")
                .message("Parameter " + expectedParam.getName() + " expects " + expectedType + 
                        " but got " + param.getClass().getSimpleName())
                .path(path)
                .build());
        }
    }

    /**
     * Validates operator compatibility with field type.
     */
    private void validateOperatorCompatibility(String operator, String fieldType, 
                                             List<ValidationError> errors, String path) {
        
        Set<String> compatibleOps = OPERATOR_COMPATIBILITY.get(fieldType);
        if (compatibleOps == null || !compatibleOps.contains(operator)) {
            errors.add(ValidationError.builder()
                .code("INCOMPATIBLE_OPERATOR")
                .message("Operator " + operator + " is not compatible with " + fieldType + " fields")
                .path(path)
                .suggestion("Use one of: " + (compatibleOps != null ? String.join(", ", compatibleOps) : "none"))
                .build());
        }
    }

    /**
     * Validates the right side of a condition.
     */
    private void validateRightSide(Object right, String operator, String leftType,
                                 ValidationContext context, List<ValidationError> errors,
                                 List<ValidationWarning> warnings, String path) {
        
        if (right instanceof Literal) {
            validateLiteralValue((Literal) right, operator, leftType, errors, path);
        } else if (right instanceof FieldRef) {
            String rightType = validateFieldRef((FieldRef) right, context, errors, warnings, path);
            if (leftType != null && rightType != null && !leftType.equals(rightType)) {
                warnings.add(ValidationWarning.builder()
                    .code("TYPE_MISMATCH")
                    .message("Comparing " + leftType + " with " + rightType + " may produce unexpected results")
                    .path(path)
                    .suggestion("Ensure both operands have compatible types")
                    .build());
            }
        } else if (right instanceof FunctionCall) {
            String rightType = validateFunctionCall((FunctionCall) right, context, errors, warnings, path);
            if (leftType != null && rightType != null && !leftType.equals(rightType)) {
                warnings.add(ValidationWarning.builder()
                    .code("TYPE_MISMATCH")
                    .message("Comparing " + leftType + " with " + rightType + " may produce unexpected results")
                    .path(path)
                    .suggestion("Ensure both operands have compatible types")
                    .build());
            }
        } else {
            errors.add(ValidationError.builder()
                .code("INVALID_RIGHT_OPERAND")
                .message("Right operand must be a literal, field reference, or function call")
                .path(path)
                .build());
        }
    }

    /**
     * Validates a literal value against expected type and operator.
     */
    private void validateLiteralValue(Literal literal, String operator, String expectedType,
                                    List<ValidationError> errors, String path) {
        
        if (literal.getType() == null) {
            errors.add(ValidationError.builder()
                .code("NULL_LITERAL_TYPE")
                .message("Literal type cannot be null")
                .path(path + ".type")
                .build());
            return;
        }

        // Validate literal type compatibility
        if (expectedType != null && !isCompatibleType(literal.getType(), expectedType)) {
            errors.add(ValidationError.builder()
                .code("INCOMPATIBLE_LITERAL_TYPE")
                .message("Literal type " + literal.getType() + " is not compatible with " + expectedType)
                .path(path + ".type")
                .build());
        }

        // Validate special operator requirements
        if (Arrays.asList("IN", "NOT_IN").contains(operator)) {
            if (!"ARRAY".equals(literal.getType())) {
                errors.add(ValidationError.builder()
                    .code("INVALID_IN_OPERAND")
                    .message("IN/NOT_IN operators require ARRAY type literal")
                    .path(path + ".type")
                    .suggestion("Use ARRAY type for IN/NOT_IN operations")
                    .build());
            }
        } else if ("BETWEEN".equals(operator) || "NOT_BETWEEN".equals(operator)) {
            if (!"ARRAY".equals(literal.getType())) {
                errors.add(ValidationError.builder()
                    .code("INVALID_BETWEEN_OPERAND")
                    .message("BETWEEN/NOT_BETWEEN operators require ARRAY type literal with 2 elements")
                    .path(path + ".type")
                    .suggestion("Use ARRAY type with exactly 2 elements for BETWEEN operations")
                    .build());
            } else if (literal.getValue() instanceof List) {
                List<?> values = (List<?>) literal.getValue();
                if (values.size() != 2) {
                    errors.add(ValidationError.builder()
                        .code("INVALID_BETWEEN_ARRAY_SIZE")
                        .message("BETWEEN operations require exactly 2 values, got " + values.size())
                        .path(path + ".value")
                        .build());
                }
            }
        }
    }

    /**
     * Validates partial DSL for real-time feedback during query building.
     */
    public PartialValidationResult validatePartialDSL(Object partialDsl, Long userId) {
        log.debug("Validating partial DSL for user: {}", userId);
        
        try {
            // Security check
            Long currentUserId = currentUserService.getCurrentUserId();
            if (!currentUserId.equals(userId)) {
                throw new CriteriaValidationException("Unauthorized: cannot validate partial criteria for another user");
            }

            List<ValidationError> errors = new ArrayList<>();
            List<ValidationWarning> warnings = new ArrayList<>();
            List<ValidationSuggestion> suggestions = new ArrayList<>();
            List<String> completionHints = new ArrayList<>();

            // Basic validation for partial DSL
            if (partialDsl == null) {
                suggestions.add(ValidationSuggestion.builder()
                    .type("STRUCTURE")
                    .message("Start by creating a root group")
                    .suggestion("Add a group with AND/OR operator")
                    .build());
                completionHints.add("Create root group");
            } else {
                // Add contextual suggestions based on partial structure
                addContextualSuggestions(partialDsl, userId, suggestions, completionHints);
            }

            return PartialValidationResult.builder()
                .valid(errors.isEmpty())
                .errors(errors)
                .warnings(warnings)
                .suggestions(suggestions)
                .completionHints(completionHints)
                .validatedAt(Instant.now())
                .build();

        } catch (Exception e) {
            log.error("Error validating partial DSL for user {}: {}", userId, e.getMessage(), e);
            return PartialValidationResult.builder()
                .valid(false)
                .errors(List.of(ValidationError.builder()
                    .code("PARTIAL_VALIDATION_ERROR")
                    .message("Error validating partial DSL: " + e.getMessage())
                    .path("$")
                    .build()))
                .validatedAt(Instant.now())
                .build();
        }
    }

    /**
     * Generates criteria preview with human-readable description and estimates.
     */
    public CriteriaPreview previewCriteria(CriteriaDSL dsl, Long userId) {
        log.debug("Generating criteria preview for user: {}", userId);
        
        try {
            // Security check
            Long currentUserId = currentUserService.getCurrentUserId();
            if (!currentUserId.equals(userId)) {
                throw new CriteriaValidationException("Unauthorized: cannot preview criteria for another user");
            }

            // First validate the DSL
            ValidationResult validation = validateDSL(dsl, userId);
            if (!validation.isValid()) {
                return CriteriaPreview.builder()
                    .description("Invalid criteria - please fix validation errors")
                    .complexity("UNKNOWN")
                    .performanceWarning("Cannot preview invalid criteria")
                    .generatedAt(Instant.now())
                    .build();
            }

            // Generate human-readable description
            String description = generateHumanReadableDescription(dsl.getRoot(), userId);
            
            // Estimate complexity
            String complexity = estimateComplexity(dsl);
            
            // Check for performance warnings
            String performanceWarning = null;
            if (validation.getWarnings().stream().anyMatch(w -> "PERFORMANCE_CONCERN".equals(w.getCode()))) {
                performanceWarning = "This criteria may impact query performance due to complexity";
            }

            return CriteriaPreview.builder()
                .description(description)
                .estimatedResultCount(null) // Could be implemented with actual database estimation
                .complexity(complexity)
                .performanceWarning(performanceWarning)
                .sqlPreview(null) // Could include sanitized SQL preview
                .generatedAt(Instant.now())
                .build();

        } catch (Exception e) {
            log.error("Error generating criteria preview for user {}: {}", userId, e.getMessage(), e);
            return CriteriaPreview.builder()
                .description("Error generating preview")
                .complexity("UNKNOWN")
                .performanceWarning("Preview generation failed")
                .generatedAt(Instant.now())
                .build();
        }
    }

    /**
     * Gets all available operators with descriptions and compatibility information.
     */
    public List<OperatorInfo> getAllOperators() {
        log.debug("Getting all available operators");
        
        List<OperatorInfo> operators = new ArrayList<>();
        
        // Create operator info for each supported operator
        Set<String> allOperators = OPERATOR_COMPATIBILITY.values().stream()
            .flatMap(Set::stream)
            .collect(Collectors.toSet());
        
        for (String operator : allOperators) {
            operators.add(createOperatorInfo(operator));
        }
        
        // Sort by category and then by operator
        operators.sort((a, b) -> {
            int categoryCompare = a.getCategory().compareTo(b.getCategory());
            return categoryCompare != 0 ? categoryCompare : a.getOperator().compareTo(b.getOperator());
        });
        
        return operators;
    }

    /**
     * Adds contextual suggestions for partial DSL.
     */
    private void addContextualSuggestions(Object partialDsl, Long userId, 
                                        List<ValidationSuggestion> suggestions, 
                                        List<String> completionHints) {
        
        // Load available fields and functions for suggestions
        List<FieldMetaResp> userFields = fieldService.getFieldsForUser(userId);
        List<FunctionMetaResp> userFunctions = functionService.getFunctionsForUser(userId);
        
        // Add field suggestions
        if (!userFields.isEmpty()) {
            suggestions.add(ValidationSuggestion.builder()
                .type("FIELD")
                .message("Available fields")
                .suggestion("Use fields like: " + userFields.stream()
                    .limit(3)
                    .map(FieldMetaResp::getLabel)
                    .collect(Collectors.joining(", ")))
                .build());
            completionHints.add("Add field condition");
        }
        
        // Add function suggestions
        if (!userFunctions.isEmpty()) {
            suggestions.add(ValidationSuggestion.builder()
                .type("FUNCTION")
                .message("Available functions")
                .suggestion("Use functions like: " + userFunctions.stream()
                    .limit(3)
                    .map(FunctionMetaResp::getLabel)
                    .collect(Collectors.joining(", ")))
                .build());
            completionHints.add("Add function call");
        }
        
        // Add operator suggestions
        completionHints.add("Add AND/OR group");
        completionHints.add("Add comparison condition");
    }

    /**
     * Generates human-readable description of criteria.
     */
    private String generateHumanReadableDescription(Group group, Long userId) {
        if (group == null) {
            return "Empty criteria";
        }
        
        List<String> childDescriptions = new ArrayList<>();
        
        if (group.getChildren() != null) {
            for (Object child : group.getChildren()) {
                if (child instanceof Condition) {
                    childDescriptions.add(generateConditionDescription((Condition) child, userId));
                } else if (child instanceof Group) {
                    childDescriptions.add("(" + generateHumanReadableDescription((Group) child, userId) + ")");
                }
            }
        }
        
        if (childDescriptions.isEmpty()) {
            return "Empty group";
        }
        
        String operator = group.getOperator();
        if ("NOT".equals(operator)) {
            return "NOT " + childDescriptions.get(0);
        } else {
            return String.join(" " + operator + " ", childDescriptions);
        }
    }

    /**
     * Generates human-readable description of a condition.
     */
    private String generateConditionDescription(Condition condition, Long userId) {
        StringBuilder desc = new StringBuilder();
        
        // Left side
        if (condition.getLeft() instanceof FieldRef) {
            FieldRef fieldRef = (FieldRef) condition.getLeft();
            FieldMetaResp field = fieldService.getFieldForUser(fieldRef.getField(), userId);
            desc.append(field != null ? field.getLabel() : fieldRef.getField());
        } else if (condition.getLeft() instanceof FunctionCall) {
            FunctionCall funcCall = (FunctionCall) condition.getLeft();
            FunctionMetaResp function = functionService.getFunctionForUser(funcCall.getName(), userId);
            desc.append(function != null ? function.getLabel() : funcCall.getName()).append("()");
        }
        
        // Operator
        desc.append(" ").append(getOperatorLabel(condition.getOperator()));
        
        // Right side (if present)
        if (condition.getRight() != null && requiresRightSide(condition.getOperator())) {
            desc.append(" ");
            if (condition.getRight() instanceof Literal) {
                Literal literal = (Literal) condition.getRight();
                desc.append(formatLiteralValue(literal));
            } else {
                desc.append("value");
            }
        }
        
        return desc.toString();
    }

    /**
     * Estimates complexity of criteria.
     */
    private String estimateComplexity(CriteriaDSL dsl) {
        int conditionCount = countConditions(dsl.getRoot());
        int maxDepth = getMaxDepth(dsl.getRoot(), 0);
        
        if (conditionCount <= 3 && maxDepth <= 2) {
            return "LOW";
        } else if (conditionCount <= 10 && maxDepth <= 4) {
            return "MEDIUM";
        } else {
            return "HIGH";
        }
    }

    /**
     * Creates OperatorInfo for a given operator.
     */
    private OperatorInfo createOperatorInfo(String operator) {
        return OperatorInfo.builder()
            .operator(operator)
            .label(getOperatorLabel(operator))
            .description(getOperatorDescription(operator))
            .compatibleTypes(getOperatorCompatibleTypes(operator))
            .requiresRightOperand(requiresRightOperand(operator))
            .category(getOperatorCategory(operator))
            .examples(getOperatorExamples(operator))
            .build();
    }

    /**
     * Gets operator label for display.
     */
    private String getOperatorLabel(String operator) {
        return switch (operator) {
            case "=" -> "equals";
            case "!=" -> "not equals";
            case "<" -> "less than";
            case "<=" -> "less than or equal";
            case ">" -> "greater than";
            case ">=" -> "greater than or equal";
            case "LIKE" -> "contains";
            case "NOT_LIKE" -> "does not contain";
            case "IN" -> "is in";
            case "NOT_IN" -> "is not in";
            case "BETWEEN" -> "is between";
            case "NOT_BETWEEN" -> "is not between";
            case "IS_NULL" -> "is empty";
            case "IS_NOT_NULL" -> "is not empty";
            default -> operator.toLowerCase();
        };
    }

    /**
     * Gets operator description.
     */
    private String getOperatorDescription(String operator) {
        return switch (operator) {
            case "=" -> "Tests for equality between two values";
            case "!=" -> "Tests for inequality between two values";
            case "<" -> "Tests if left value is less than right value";
            case "<=" -> "Tests if left value is less than or equal to right value";
            case ">" -> "Tests if left value is greater than right value";
            case ">=" -> "Tests if left value is greater than or equal to right value";
            case "LIKE" -> "Tests if text contains the specified pattern";
            case "NOT_LIKE" -> "Tests if text does not contain the specified pattern";
            case "IN" -> "Tests if value is in the specified list";
            case "NOT_IN" -> "Tests if value is not in the specified list";
            case "BETWEEN" -> "Tests if value is between two specified values";
            case "NOT_BETWEEN" -> "Tests if value is not between two specified values";
            case "IS_NULL" -> "Tests if value is null or empty";
            case "IS_NOT_NULL" -> "Tests if value is not null or empty";
            default -> "Operator: " + operator;
        };
    }

    /**
     * Gets compatible types for operator.
     */
    private List<String> getOperatorCompatibleTypes(String operator) {
        return OPERATOR_COMPATIBILITY.entrySet().stream()
            .filter(entry -> entry.getValue().contains(operator))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    /**
     * Gets operator category.
     */
    private String getOperatorCategory(String operator) {
        return switch (operator) {
            case "=", "!=", "<", "<=", ">", ">=" -> "COMPARISON";
            case "LIKE", "NOT_LIKE" -> "PATTERN";
            case "IN", "NOT_IN" -> "LIST";
            case "BETWEEN", "NOT_BETWEEN" -> "RANGE";
            case "IS_NULL", "IS_NOT_NULL" -> "NULL_CHECK";
            default -> "OTHER";
        };
    }

    /**
     * Gets operator examples.
     */
    private List<String> getOperatorExamples(String operator) {
        return switch (operator) {
            case "=" -> List.of("price = 100", "symbol = 'AAPL'");
            case "!=" -> List.of("price != 0", "sector != 'Technology'");
            case "<" -> List.of("price < 50", "volume < 1000000");
            case ">" -> List.of("market_cap > 1000000000", "pe_ratio > 15");
            case "LIKE" -> List.of("company_name LIKE '%Apple%'", "description LIKE '%tech%'");
            case "IN" -> List.of("sector IN ('Technology', 'Healthcare')", "rating IN ('A', 'B')");
            case "BETWEEN" -> List.of("price BETWEEN 10 AND 100", "volume BETWEEN 100000 AND 1000000");
            case "IS_NULL" -> List.of("dividend_yield IS NULL", "earnings_date IS NULL");
            default -> List.of();
        };
    }

    /**
     * Formats literal value for display.
     */
    private String formatLiteralValue(Literal literal) {
        if (literal.getValue() == null) {
            return "null";
        }
        
        if (literal.getValue() instanceof String) {
            return "'" + literal.getValue() + "'";
        } else if (literal.getValue() instanceof List) {
            List<?> values = (List<?>) literal.getValue();
            return "[" + values.stream()
                .map(v -> v instanceof String ? "'" + v + "'" : String.valueOf(v))
                .collect(Collectors.joining(", ")) + "]";
        } else {
            return String.valueOf(literal.getValue());
        }
    }

    /**
     * Validates literal type against parameter expectation.
     */
    private void validateLiteralType(Literal literal, String expectedType, 
                                   List<ValidationError> errors, String path) {
        
        if (!isCompatibleType(literal.getType(), expectedType)) {
            errors.add(ValidationError.builder()
                .code("INCOMPATIBLE_LITERAL_TYPE")
                .message("Expected " + expectedType + " but got " + literal.getType())
                .path(path + ".type")
                .build());
        }
    }

    /**
     * Validates all field and function references in the DSL.
     */
    private void validateReferences(Group group, ValidationContext context,
                                  List<ValidationError> errors, List<ValidationWarning> warnings, String path) {
        
        if (group.getChildren() != null) {
            for (int i = 0; i < group.getChildren().size(); i++) {
                Object child = group.getChildren().get(i);
                String childPath = path + ".children[" + i + "]";

                if (child instanceof Condition) {
                    Condition condition = (Condition) child;
                    validateExpressionReferences(condition.getLeft(), context, errors, warnings, childPath + ".left");
                    if (condition.getRight() != null) {
                        validateExpressionReferences(condition.getRight(), context, errors, warnings, childPath + ".right");
                    }
                } else if (child instanceof Group) {
                    validateReferences((Group) child, context, errors, warnings, childPath);
                }
            }
        }
    }

    /**
     * Validates references in an expression.
     */
    private void validateExpressionReferences(Object expression, ValidationContext context,
                                            List<ValidationError> errors, List<ValidationWarning> warnings, String path) {
        
        if (expression instanceof FieldRef) {
            validateFieldRef((FieldRef) expression, context, errors, warnings, path);
        } else if (expression instanceof FunctionCall) {
            FunctionCall functionCall = (FunctionCall) expression;
            validateFunctionCall(functionCall, context, errors, warnings, path);
            
            // Recursively validate function parameters
            if (functionCall.getParameters() != null) {
                for (int i = 0; i < functionCall.getParameters().size(); i++) {
                    Object param = functionCall.getParameters().get(i);
                    validateExpressionReferences(param, context, errors, warnings, path + ".parameters[" + i + "]");
                }
            }
        }
    }

    /**
     * Checks if an operator requires a right operand.
     */
    private boolean requiresRightSide(String operator) {
        return OPERATORS_REQUIRING_RIGHT_OPERAND.contains(operator);
    }

    /**
     * Checks if two types are compatible.
     */
    private boolean isCompatibleType(String actualType, String expectedType) {
        if (actualType.equals(expectedType)) {
            return true;
        }
        
        // Allow some type flexibility
        if ("NUMBER".equals(expectedType) && "INTEGER".equals(actualType)) {
            return true;
        }
        if ("INTEGER".equals(expectedType) && "NUMBER".equals(actualType)) {
            return true;
        }
        
        return false;
    }

    /**
     * Builds the validation result.
     */
    private ValidationResult buildResult(boolean valid, List<ValidationError> errors, 
                                       List<ValidationWarning> warnings, Long userId, CriteriaDSL dsl) {
        return ValidationResult.builder()
            .valid(valid)
            .errors(errors)
            .warnings(warnings)
            .validatedAt(Instant.now())
            .validatedBy(userId.toString())
            .dslHash(calculateDslHash(dsl))
            .build();
    }

    /**
     * Validates partial DSL for real-time validation feedback during query building.
     */
    public PartialValidationResult validatePartialDSL(Object partialDsl, Long userId) {
        // Security check: ensure user is authenticated
        if (userId == null) {
            throw new CriteriaValidationException("User authentication required for partial validation");
        }

        // Verify current user matches the provided userId (security check)
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            auditService.logSecurityEvent("UNAUTHORIZED_PARTIAL_VALIDATION_ATTEMPT", 
                "User " + currentUserId + " attempted partial validation for user " + userId);
            throw new CriteriaValidationException("Unauthorized: cannot validate criteria for another user");
        }

        List<ValidationError> errors = new ArrayList<>();
        List<ValidationWarning> warnings = new ArrayList<>();
        List<ValidationSuggestion> suggestions = new ArrayList<>();
        List<String> completionHints = new ArrayList<>();

        try {
            ValidationContext context = new ValidationContext(userId);
            
            // Load user's available fields and functions
            List<FieldMetaResp> userFields = fieldService.getFieldsForUser(userId);
            List<FunctionMetaResp> userFunctions = functionService.getFunctionsForUser(userId);

            context.setAvailableFields(userFields);
            context.setAvailableFunctions(userFunctions);
            context.setFieldMap(userFields.stream()
                .collect(Collectors.toMap(FieldMetaResp::getId, f -> f)));
            context.setFunctionMap(userFunctions.stream()
                .collect(Collectors.toMap(FunctionMetaResp::getId, f -> f)));

            if (partialDsl == null) {
                // Suggest starting with a group
                suggestions.add(ValidationSuggestion.builder()
                    .type("COMPLETION")
                    .message("Start by creating a group with conditions")
                    .path("$.root")
                    .priority(10)
                    .build());
                completionHints.add("Add a group with AND/OR operator");
                completionHints.add("Add a condition to compare fields");
            } else if (partialDsl instanceof Group) {
                validatePartialGroup((Group) partialDsl, context, errors, warnings, suggestions, completionHints, "$.root");
            } else if (partialDsl instanceof Condition) {
                validatePartialCondition((Condition) partialDsl, context, errors, warnings, suggestions, completionHints, "$.condition");
            }

        } catch (Exception e) {
            log.error("Partial validation error for user {}: {}", userId, e.getMessage(), e);
            auditService.logSecurityEvent("PARTIAL_VALIDATION_ERROR", "Error during partial validation: " + e.getMessage());
            errors.add(ValidationError.builder()
                .code("PARTIAL_VALIDATION_ERROR")
                .message("Error during partial validation: " + e.getMessage())
                .path("$")
                .build());
        }

        return PartialValidationResult.builder()
            .valid(errors.isEmpty())
            .errors(errors)
            .warnings(warnings)
            .suggestions(suggestions)
            .completionHints(completionHints)
            .validatedAt(Instant.now())
            .build();
    }

    /**
     * Generates human-readable descriptions and result estimates for criteria preview.
     */
    public CriteriaPreview previewCriteria(CriteriaDSL dsl, Long userId) {
        // Security check: ensure user is authenticated
        if (userId == null) {
            throw new CriteriaValidationException("User authentication required for criteria preview");
        }

        // Verify current user matches the provided userId (security check)
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            auditService.logSecurityEvent("UNAUTHORIZED_PREVIEW_ATTEMPT", 
                "User " + currentUserId + " attempted preview for user " + userId);
            throw new CriteriaValidationException("Unauthorized: cannot preview criteria for another user");
        }

        try {
            // First validate the DSL
            ValidationResult validation = validateDSL(dsl, userId);
            
            if (!validation.isValid()) {
                return CriteriaPreview.builder()
                    .description("Invalid criteria - please fix validation errors")
                    .complexity("UNKNOWN")
                    .generatedAt(Instant.now())
                    .build();
            }

            // Generate human-readable description
            String description = generateHumanReadableDescription(dsl.getRoot());
            
            // Determine complexity
            String complexity = determineComplexity(dsl);
            
            // Generate performance warning if needed
            String performanceWarning = null;
            if (validation.getWarnings().stream().anyMatch(w -> "PERFORMANCE_CONCERN".equals(w.getCode()))) {
                performanceWarning = "This criteria may impact query performance due to complexity";
            }

            // Generate SQL preview (sanitized)
            String sqlPreview = generateSqlPreview(dsl);

            return CriteriaPreview.builder()
                .description(description)
                .complexity(complexity)
                .performanceWarning(performanceWarning)
                .sqlPreview(sqlPreview)
                .generatedAt(Instant.now())
                .build();

        } catch (Exception e) {
            log.error("Preview generation error for user {}: {}", userId, e.getMessage(), e);
            auditService.logSecurityEvent("PREVIEW_ERROR", "Error generating preview: " + e.getMessage());
            return CriteriaPreview.builder()
                .description("Error generating preview: " + e.getMessage())
                .complexity("UNKNOWN")
                .generatedAt(Instant.now())
                .build();
        }
    }

    /**
     * Gets complete operator metadata with descriptions and compatibility information.
     */
    public List<OperatorInfo> getAllOperators() {
        List<OperatorInfo> operators = new ArrayList<>();

        // Comparison operators
        operators.add(OperatorInfo.builder()
            .operator("=")
            .label("Equals")
            .description("Tests for equality between two values")
            .compatibleTypes(List.of("STRING", "NUMBER", "INTEGER", "DATE", "BOOLEAN", "ENUM", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("COMPARISON")
            .examples(List.of("market_cap = 1000000", "sector = 'Technology'"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator("!=")
            .label("Not Equals")
            .description("Tests for inequality between two values")
            .compatibleTypes(List.of("STRING", "NUMBER", "INTEGER", "DATE", "BOOLEAN", "ENUM", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("COMPARISON")
            .examples(List.of("market_cap != 0", "sector != 'Utilities'"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator(">")
            .label("Greater Than")
            .description("Tests if left value is greater than right value")
            .compatibleTypes(List.of("NUMBER", "INTEGER", "DATE", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("COMPARISON")
            .examples(List.of("market_cap > 1000000", "price > 50"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator(">=")
            .label("Greater Than or Equal")
            .description("Tests if left value is greater than or equal to right value")
            .compatibleTypes(List.of("NUMBER", "INTEGER", "DATE", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("COMPARISON")
            .examples(List.of("market_cap >= 1000000", "price >= 50"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator("<")
            .label("Less Than")
            .description("Tests if left value is less than right value")
            .compatibleTypes(List.of("NUMBER", "INTEGER", "DATE", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("COMPARISON")
            .examples(List.of("market_cap < 1000000", "price < 50"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator("<=")
            .label("Less Than or Equal")
            .description("Tests if left value is less than or equal to right value")
            .compatibleTypes(List.of("NUMBER", "INTEGER", "DATE", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("COMPARISON")
            .examples(List.of("market_cap <= 1000000", "price <= 50"))
            .build());

        // Pattern operators
        operators.add(OperatorInfo.builder()
            .operator("LIKE")
            .label("Like")
            .description("Tests if string matches a pattern (supports wildcards)")
            .compatibleTypes(List.of("STRING"))
            .requiresRightOperand(true)
            .category("PATTERN")
            .examples(List.of("company_name LIKE 'Apple%'", "description LIKE '%technology%'"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator("NOT_LIKE")
            .label("Not Like")
            .description("Tests if string does not match a pattern")
            .compatibleTypes(List.of("STRING"))
            .requiresRightOperand(true)
            .category("PATTERN")
            .examples(List.of("company_name NOT_LIKE 'Test%'"))
            .build());

        // Set operators
        operators.add(OperatorInfo.builder()
            .operator("IN")
            .label("In")
            .description("Tests if value is in a list of values")
            .compatibleTypes(List.of("STRING", "NUMBER", "INTEGER", "DATE", "ENUM", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("RANGE")
            .examples(List.of("sector IN ['Technology', 'Healthcare']", "market_cap IN [1000000, 2000000]"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator("NOT_IN")
            .label("Not In")
            .description("Tests if value is not in a list of values")
            .compatibleTypes(List.of("STRING", "NUMBER", "INTEGER", "DATE", "ENUM", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("RANGE")
            .examples(List.of("sector NOT_IN ['Utilities', 'Energy']"))
            .build());

        // Range operators
        operators.add(OperatorInfo.builder()
            .operator("BETWEEN")
            .label("Between")
            .description("Tests if value is between two values (inclusive)")
            .compatibleTypes(List.of("NUMBER", "INTEGER", "DATE", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("RANGE")
            .examples(List.of("market_cap BETWEEN [1000000, 10000000]", "price BETWEEN [10, 100]"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator("NOT_BETWEEN")
            .label("Not Between")
            .description("Tests if value is not between two values")
            .compatibleTypes(List.of("NUMBER", "INTEGER", "DATE", "PERCENT", "CURRENCY"))
            .requiresRightOperand(true)
            .category("RANGE")
            .examples(List.of("price NOT_BETWEEN [0, 1]"))
            .build());

        // Null operators
        operators.add(OperatorInfo.builder()
            .operator("IS_NULL")
            .label("Is Null")
            .description("Tests if value is null or empty")
            .compatibleTypes(List.of("STRING", "NUMBER", "INTEGER", "DATE", "BOOLEAN", "ENUM", "PERCENT", "CURRENCY"))
            .requiresRightOperand(false)
            .category("NULL_CHECK")
            .examples(List.of("description IS_NULL", "optional_field IS_NULL"))
            .build());

        operators.add(OperatorInfo.builder()
            .operator("IS_NOT_NULL")
            .label("Is Not Null")
            .description("Tests if value is not null or empty")
            .compatibleTypes(List.of("STRING", "NUMBER", "INTEGER", "DATE", "BOOLEAN", "ENUM", "PERCENT", "CURRENCY"))
            .requiresRightOperand(false)
            .category("NULL_CHECK")
            .examples(List.of("description IS_NOT_NULL", "required_field IS_NOT_NULL"))
            .build());

        return operators;
    }

    /**
     * Validates a partial group and provides suggestions.
     */
    private void validatePartialGroup(Group group, ValidationContext context,
                                    List<ValidationError> errors, List<ValidationWarning> warnings,
                                    List<ValidationSuggestion> suggestions, List<String> completionHints, String path) {
        
        if (group.getOperator() == null) {
            suggestions.add(ValidationSuggestion.builder()
                .type("OPERATOR")
                .message("Select a logical operator for this group")
                .path(path + ".operator")
                .options(List.of("AND", "OR", "NOT"))
                .priority(10)
                .build());
            completionHints.add("Choose AND, OR, or NOT operator");
        } else if (!Arrays.asList("AND", "OR", "NOT").contains(group.getOperator())) {
            errors.add(ValidationError.builder()
                .code("INVALID_OPERATOR")
                .message("Invalid group operator: " + group.getOperator())
                .path(path + ".operator")
                .suggestion("Use one of: AND, OR, NOT")
                .build());
        }

        if (group.getChildren() == null || group.getChildren().isEmpty()) {
            suggestions.add(ValidationSuggestion.builder()
                .type("COMPLETION")
                .message("Add conditions or nested groups to this group")
                .path(path + ".children")
                .priority(8)
                .build());
            completionHints.add("Add a condition to compare fields");
            completionHints.add("Add a nested group for complex logic");
        } else {
            // Validate existing children and suggest completions
            for (int i = 0; i < group.getChildren().size(); i++) {
                Object child = group.getChildren().get(i);
                String childPath = path + ".children[" + i + "]";

                if (child instanceof Condition) {
                    validatePartialCondition((Condition) child, context, errors, warnings, suggestions, completionHints, childPath);
                } else if (child instanceof Group) {
                    validatePartialGroup((Group) child, context, errors, warnings, suggestions, completionHints, childPath);
                }
            }

            // Suggest adding more conditions if appropriate
            if (!"NOT".equals(group.getOperator()) && group.getChildren().size() < 5) {
                suggestions.add(ValidationSuggestion.builder()
                    .type("COMPLETION")
                    .message("Add more conditions to this " + group.getOperator() + " group")
                    .path(path + ".children")
                    .priority(3)
                    .build());
            }
        }
    }

    /**
     * Validates a partial condition and provides suggestions.
     */
    private void validatePartialCondition(Condition condition, ValidationContext context,
                                        List<ValidationError> errors, List<ValidationWarning> warnings,
                                        List<ValidationSuggestion> suggestions, List<String> completionHints, String path) {
        
        String leftType = null;

        // Validate left side
        if (condition.getLeft() == null) {
            suggestions.add(ValidationSuggestion.builder()
                .type("FIELD")
                .message("Select a field or function for the left side")
                .path(path + ".left")
                .options(context.getAvailableFields().stream().map(FieldMetaResp::getId).collect(Collectors.toList()))
                .priority(10)
                .build());
            completionHints.add("Choose a field to compare");
        } else {
            leftType = validateLeftSide(condition.getLeft(), context, errors, warnings, path + ".left");
        }

        // Validate operator
        if (condition.getOperator() == null) {
            if (leftType != null) {
                Set<String> compatibleOps = OPERATOR_COMPATIBILITY.get(leftType);
                suggestions.add(ValidationSuggestion.builder()
                    .type("OPERATOR")
                    .message("Select an operator compatible with " + leftType + " fields")
                    .path(path + ".operator")
                    .options(compatibleOps != null ? new ArrayList<>(compatibleOps) : List.of())
                    .priority(9)
                    .build());
            } else {
                suggestions.add(ValidationSuggestion.builder()
                    .type("OPERATOR")
                    .message("Select a comparison operator")
                    .path(path + ".operator")
                    .options(List.of("=", "!=", ">", ">=", "<", "<=", "LIKE", "IN", "IS_NULL"))
                    .priority(9)
                    .build());
            }
            completionHints.add("Choose a comparison operator");
        }

        // Validate right side
        if (condition.getOperator() != null && requiresRightSide(condition.getOperator())) {
            if (condition.getRight() == null) {
                suggestions.add(ValidationSuggestion.builder()
                    .type("VALUE")
                    .message("Enter a value for the " + condition.getOperator() + " operator")
                    .path(path + ".right")
                    .priority(8)
                    .build());
                completionHints.add("Enter a comparison value");
            }
        }
    }

    /**
     * Generates a human-readable description of the criteria.
     */
    private String generateHumanReadableDescription(Group group) {
        if (group == null || group.getChildren() == null || group.getChildren().isEmpty()) {
            return "Empty criteria";
        }

        List<String> childDescriptions = new ArrayList<>();
        for (Object child : group.getChildren()) {
            if (child instanceof Condition) {
                childDescriptions.add(generateConditionDescription((Condition) child));
            } else if (child instanceof Group) {
                childDescriptions.add("(" + generateHumanReadableDescription((Group) child) + ")");
            }
        }

        String operator = group.getOperator();
        if ("NOT".equals(operator)) {
            return "NOT " + childDescriptions.get(0);
        } else {
            return String.join(" " + operator + " ", childDescriptions);
        }
    }

    /**
     * Generates a human-readable description of a condition.
     */
    private String generateConditionDescription(Condition condition) {
        StringBuilder desc = new StringBuilder();

        // Left side
        if (condition.getLeft() instanceof FieldRef) {
            FieldRef fieldRef = (FieldRef) condition.getLeft();
            desc.append(fieldRef.getField());
        } else if (condition.getLeft() instanceof FunctionCall) {
            FunctionCall funcCall = (FunctionCall) condition.getLeft();
            desc.append(funcCall.getName()).append("(...)");
        } else {
            desc.append("field");
        }

        // Operator
        String operator = condition.getOperator();
        if (operator != null) {
            switch (operator) {
                case "=": desc.append(" equals "); break;
                case "!=": desc.append(" does not equal "); break;
                case ">": desc.append(" is greater than "); break;
                case ">=": desc.append(" is greater than or equal to "); break;
                case "<": desc.append(" is less than "); break;
                case "<=": desc.append(" is less than or equal to "); break;
                case "LIKE": desc.append(" is like "); break;
                case "NOT_LIKE": desc.append(" is not like "); break;
                case "IN": desc.append(" is in "); break;
                case "NOT_IN": desc.append(" is not in "); break;
                case "BETWEEN": desc.append(" is between "); break;
                case "NOT_BETWEEN": desc.append(" is not between "); break;
                case "IS_NULL": desc.append(" is null"); break;
                case "IS_NOT_NULL": desc.append(" is not null"); break;
                default: desc.append(" ").append(operator).append(" "); break;
            }
        }

        // Right side (if applicable)
        if (condition.getRight() != null && requiresRightSide(condition.getOperator())) {
            if (condition.getRight() instanceof Literal) {
                Literal literal = (Literal) condition.getRight();
                desc.append(literal.getValue());
            } else if (condition.getRight() instanceof FieldRef) {
                FieldRef fieldRef = (FieldRef) condition.getRight();
                desc.append(fieldRef.getField());
            } else {
                desc.append("value");
            }
        }

        return desc.toString();
    }

    /**
     * Determines the complexity level of the criteria.
     */
    private String determineComplexity(CriteriaDSL dsl) {
        int conditionCount = countConditions(dsl.getRoot());
        int maxDepth = getMaxDepth(dsl.getRoot(), 0);

        if (conditionCount <= 3 && maxDepth <= 2) {
            return "LOW";
        } else if (conditionCount <= 10 && maxDepth <= 4) {
            return "MEDIUM";
        } else {
            return "HIGH";
        }
    }

    /**
     * Generates a sanitized SQL preview.
     */
    private String generateSqlPreview(CriteriaDSL dsl) {
        try {
            // This is a simplified preview - actual SQL generation would be in CriteriaSqlService
            return "WHERE " + generateGroupSqlPreview(dsl.getRoot());
        } catch (Exception e) {
            return "SQL preview unavailable";
        }
    }

    /**
     * Generates a simplified SQL preview for a group.
     */
    private String generateGroupSqlPreview(Group group) {
        if (group == null || group.getChildren() == null || group.getChildren().isEmpty()) {
            return "1=1";
        }

        List<String> childSqls = new ArrayList<>();
        for (Object child : group.getChildren()) {
            if (child instanceof Condition) {
                childSqls.add(generateConditionSqlPreview((Condition) child));
            } else if (child instanceof Group) {
                childSqls.add("(" + generateGroupSqlPreview((Group) child) + ")");
            }
        }

        String operator = group.getOperator();
        if ("NOT".equals(operator)) {
            return "NOT (" + childSqls.get(0) + ")";
        } else {
            return String.join(" " + operator + " ", childSqls);
        }
    }

    /**
     * Generates a simplified SQL preview for a condition.
     */
    private String generateConditionSqlPreview(Condition condition) {
        StringBuilder sql = new StringBuilder();

        // Left side
        if (condition.getLeft() instanceof FieldRef) {
            FieldRef fieldRef = (FieldRef) condition.getLeft();
            sql.append(fieldRef.getField());
        } else if (condition.getLeft() instanceof FunctionCall) {
            FunctionCall funcCall = (FunctionCall) condition.getLeft();
            sql.append(funcCall.getName()).append("(...)");
        } else {
            sql.append("field");
        }

        // Operator and right side
        String operator = condition.getOperator();
        if (operator != null) {
            sql.append(" ").append(operator);
            
            if (requiresRightSide(operator) && condition.getRight() != null) {
                sql.append(" ?");
            }
        }

        return sql.toString();
    }

    /**
     * Calculates a hash of the DSL for caching purposes.
     */
    private String calculateDslHash(CriteriaDSL dsl) {
        if (dsl == null) {
            return null;
        }
        
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String dslString = dsl.toString(); // Simple string representation
            byte[] hash = md.digest(dslString.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.warn("Failed to calculate DSL hash", e);
            return null;
        }
    }
}