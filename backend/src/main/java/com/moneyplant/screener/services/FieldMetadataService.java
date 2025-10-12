package com.moneyplant.screener.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.screener.dtos.FieldMetaResp;
import com.moneyplant.screener.dtos.OperatorInfo;
import com.moneyplant.screener.dtos.ValueSuggestion;
import com.moneyplant.screener.entities.FieldMetadata;
import com.moneyplant.screener.repositories.FieldMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced service for managing field metadata with visual interface support.
 * Provides field metadata CRUD operations, role-based access control, caching,
 * and visual interface support methods.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FieldMetadataService {

    private final FieldMetadataRepository fieldMetadataRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final CriteriaMetricsService metricsService;

    // Operator compatibility mapping
    private static final Map<String, List<String>> OPERATOR_COMPATIBILITY = Map.of(
        "STRING", List.of("=", "!=", "LIKE", "NOT_LIKE", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL"),
        "NUMBER", List.of("=", "!=", "<", "<=", ">", ">=", "BETWEEN", "NOT_BETWEEN", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL"),
        "INTEGER", List.of("=", "!=", "<", "<=", ">", ">=", "BETWEEN", "NOT_BETWEEN", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL"),
        "DATE", List.of("=", "!=", "<", "<=", ">", ">=", "BETWEEN", "NOT_BETWEEN", "IS_NULL", "IS_NOT_NULL"),
        "BOOLEAN", List.of("=", "!=", "IS_NULL", "IS_NOT_NULL"),
        "ENUM", List.of("=", "!=", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL"),
        "PERCENT", List.of("=", "!=", "<", "<=", ">", ">=", "BETWEEN", "NOT_BETWEEN", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL"),
        "CURRENCY", List.of("=", "!=", "<", "<=", ">", ">=", "BETWEEN", "NOT_BETWEEN", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL")
    );

    /**
     * Gets fields available for the specified user with role-based filtering.
     * 
     * @param userId the user ID
     * @return list of available fields
     */
    @Cacheable(value = "userFields", key = "#userId")
    public List<FieldMetaResp> getFieldsForUser(Long userId) {
        log.debug("Getting fields for user: {}", userId);
        
        // Record cache miss (method execution means cache miss)
        metricsService.recordCacheEvent("userFields", false);
        
        try {
            List<FieldMetadata> activeFields = fieldMetadataRepository.findActiveFieldsOrderedByCategoryAndSort();
            
            return activeFields.stream()
                .filter(field -> hasFieldAccess(field, userId))
                .map(this::mapToFieldMetaResp)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting fields for user {}: {}", userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Gets a specific field by ID for the user.
     * 
     * @param fieldId the field ID (field name)
     * @param userId the user ID
     * @return field metadata or null if not found/accessible
     */
    public FieldMetaResp getFieldForUser(String fieldId, Long userId) {
        log.debug("Getting field {} for user: {}", fieldId, userId);
        
        try {
            Optional<FieldMetadata> fieldOpt = fieldMetadataRepository.findByFieldNameAndIsActiveTrue(fieldId);
            
            if (fieldOpt.isEmpty()) {
                log.warn("Field not found or inactive: {}", fieldId);
                return null;
            }
            
            FieldMetadata field = fieldOpt.get();
            if (!hasFieldAccess(field, userId)) {
                log.warn("User {} does not have access to field: {}", userId, fieldId);
                return null;
            }
            
            return mapToFieldMetaResp(field);
            
        } catch (Exception e) {
            log.error("Error getting field {} for user {}: {}", fieldId, userId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Gets fields by category for the specified user.
     * 
     * @param category the field category
     * @param userId the user ID
     * @return list of fields in the category
     */
    @Cacheable(value = "userFieldsByCategory", key = "#userId + '_' + #category")
    public List<FieldMetaResp> getFieldsByCategory(String category, Long userId) {
        log.debug("Getting fields in category {} for user: {}", category, userId);
        
        try {
            List<FieldMetadata> categoryFields = fieldMetadataRepository.findByCategoryAndIsActiveTrueOrderBySortOrder(category);
            
            return categoryFields.stream()
                .filter(field -> hasFieldAccess(field, userId))
                .map(this::mapToFieldMetaResp)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting fields in category {} for user {}: {}", category, userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Searches fields by name, display name, or description.
     * 
     * @param searchTerm the search term
     * @param userId the user ID
     * @return list of matching fields
     */
    public List<FieldMetaResp> searchFields(String searchTerm, Long userId) {
        log.debug("Searching fields with term '{}' for user: {}", searchTerm, userId);
        
        try {
            List<FieldMetadata> searchResults = fieldMetadataRepository.searchActiveFields(searchTerm);
            
            return searchResults.stream()
                .filter(field -> hasFieldAccess(field, userId))
                .map(this::mapToFieldMetaResp)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error searching fields with term '{}' for user {}: {}", searchTerm, userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Gets available field categories for the user.
     * 
     * @param userId the user ID
     * @return list of available categories
     */
    @Cacheable(value = "userFieldCategories", key = "#userId")
    public List<String> getFieldCategories(Long userId) {
        log.debug("Getting field categories for user: {}", userId);
        
        try {
            List<String> allCategories = fieldMetadataRepository.findDistinctCategoriesByIsActiveTrue();
            
            // Filter categories based on user access to fields in each category
            return allCategories.stream()
                .filter(category -> hasAccessToCategory(category, userId))
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting field categories for user {}: {}", userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Gets compatible operators for a specific field type.
     * 
     * @param fieldId the field ID
     * @param userId the user ID
     * @return list of compatible operators
     */
    public List<OperatorInfo> getCompatibleOperators(String fieldId, Long userId) {
        log.debug("Getting compatible operators for field {} and user: {}", fieldId, userId);
        
        try {
            FieldMetaResp field = getFieldForUser(fieldId, userId);
            if (field == null) {
                log.warn("Field not found or not accessible: {}", fieldId);
                return List.of();
            }
            
            String dataType = field.getDataType();
            List<String> compatibleOps = OPERATOR_COMPATIBILITY.getOrDefault(dataType, List.of());
            
            return compatibleOps.stream()
                .map(this::createOperatorInfo)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting compatible operators for field {} and user {}: {}", fieldId, userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Gets value suggestions for a field with optional query filtering.
     * 
     * @param fieldId the field ID
     * @param query optional query to filter suggestions
     * @param userId the user ID
     * @return list of value suggestions
     */
    public List<ValueSuggestion> getValueSuggestions(String fieldId, String query, Long userId) {
        log.debug("Getting value suggestions for field {} with query '{}' for user: {}", fieldId, query, userId);
        
        try {
            FieldMetaResp field = getFieldForUser(fieldId, userId);
            if (field == null) {
                log.warn("Field not found or not accessible: {}", fieldId);
                return List.of();
            }
            
            // Check if field has a suggestions API endpoint
            if (field.getSuggestionsApi() != null && !field.getSuggestionsApi().isEmpty()) {
                return fetchExternalSuggestions(field.getSuggestionsApi(), query);
            }
            
            // For enum fields, return predefined values from validation rules
            if ("ENUM".equals(field.getDataType()) && field.getValidationRules() != null) {
                return getEnumSuggestions(field.getValidationRules(), query);
            }
            
            // For other field types, return empty list (could be extended with database lookups)
            return List.of();
            
        } catch (Exception e) {
            log.error("Error getting value suggestions for field {} and user {}: {}", fieldId, userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Checks if user has access to a specific field based on role-based permissions.
     * This is a placeholder implementation - should be enhanced with actual role checking.
     * 
     * @param field the field metadata
     * @param userId the user ID
     * @return true if user has access, false otherwise
     */
    private boolean hasFieldAccess(FieldMetadata field, Long userId) {
        // TODO: Implement actual role-based field access control
        // For now, all authenticated users have access to all active fields
        // This should be enhanced to check user roles and field permissions
        
        // Example logic (to be implemented):
        // - Check if field requires specific roles
        // - Check if user has required roles
        // - Check if field is restricted to certain user groups
        
        return field.getIsActive();
    }

    /**
     * Checks if user has access to any fields in the specified category.
     * 
     * @param category the category name
     * @param userId the user ID
     * @return true if user has access to category, false otherwise
     */
    private boolean hasAccessToCategory(String category, Long userId) {
        try {
            List<FieldMetadata> categoryFields = fieldMetadataRepository.findByCategoryAndIsActiveTrueOrderBySortOrder(category);
            return categoryFields.stream().anyMatch(field -> hasFieldAccess(field, userId));
        } catch (Exception e) {
            log.error("Error checking category access for {} and user {}: {}", category, userId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Maps FieldMetadata entity to FieldMetaResp DTO.
     * 
     * @param field the field metadata entity
     * @return the field metadata response DTO
     */
    private FieldMetaResp mapToFieldMetaResp(FieldMetadata field) {
        List<String> allowedOps = OPERATOR_COMPATIBILITY.getOrDefault(field.getDataType(), List.of());
        
        return FieldMetaResp.builder()
            .id(field.getFieldName())
            .label(field.getDisplayName())
            .dbColumn(field.getFieldName()) // Assuming field name is the DB column
            .dataType(field.getDataType())
            .allowedOps(allowedOps)
            .category(field.getCategory())
            .description(field.getDescription())
            .example(field.getExampleValue())
            .validationRules(field.getValidationRules())
            .build();
    }

    /**
     * Creates OperatorInfo for a given operator.
     * 
     * @param operator the operator symbol
     * @return the operator info
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
     * Fetches value suggestions from external API.
     * 
     * @param apiUrl the API URL
     * @param query the query parameter
     * @return list of value suggestions
     */
    private List<ValueSuggestion> fetchExternalSuggestions(String apiUrl, String query) {
        try {
            String url = apiUrl;
            if (query != null && !query.isEmpty()) {
                url += (apiUrl.contains("?") ? "&" : "?") + "query=" + query;
            }
            
            // Make REST call to external API
            ValueSuggestion[] suggestions = restTemplate.getForObject(url, ValueSuggestion[].class);
            return suggestions != null ? Arrays.asList(suggestions) : List.of();
            
        } catch (Exception e) {
            log.error("Error fetching external suggestions from {}: {}", apiUrl, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Gets enum value suggestions from validation rules.
     * 
     * @param validationRules the validation rules object
     * @param query optional query to filter suggestions
     * @return list of enum value suggestions
     */
    private List<ValueSuggestion> getEnumSuggestions(Object validationRules, String query) {
        try {
            // Parse validation rules to extract enum values
            Map<String, Object> rules = objectMapper.convertValue(validationRules, new TypeReference<Map<String, Object>>() {});
            
            @SuppressWarnings("unchecked")
            List<String> enumValues = (List<String>) rules.get("enumValues");
            
            if (enumValues == null) {
                return List.of();
            }
            
            return enumValues.stream()
                .filter(value -> query == null || query.isEmpty() || 
                    value.toLowerCase().contains(query.toLowerCase()))
                .map(value -> ValueSuggestion.builder()
                    .value(value)
                    .label(value)
                    .build())
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error parsing enum suggestions from validation rules: {}", e.getMessage(), e);
            return List.of();
        }
    }

    // Helper methods for operator information
    private String getOperatorLabel(String operator) {
        return switch (operator) {
            case "=" -> "Equals";
            case "!=" -> "Not Equals";
            case "<" -> "Less Than";
            case "<=" -> "Less Than or Equal";
            case ">" -> "Greater Than";
            case ">=" -> "Greater Than or Equal";
            case "LIKE" -> "Contains";
            case "NOT_LIKE" -> "Does Not Contain";
            case "IN" -> "In List";
            case "NOT_IN" -> "Not In List";
            case "BETWEEN" -> "Between";
            case "NOT_BETWEEN" -> "Not Between";
            case "IS_NULL" -> "Is Empty";
            case "IS_NOT_NULL" -> "Is Not Empty";
            default -> operator;
        };
    }

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

    private List<String> getOperatorCompatibleTypes(String operator) {
        return OPERATOR_COMPATIBILITY.entrySet().stream()
            .filter(entry -> entry.getValue().contains(operator))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    private boolean requiresRightOperand(String operator) {
        return !List.of("IS_NULL", "IS_NOT_NULL").contains(operator);
    }

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
}