package com.moneyplant.screener.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.screener.dtos.FunctionMetaResp;
import com.moneyplant.screener.dtos.FunctionParameterResp;
import com.moneyplant.screener.dtos.FunctionSignature;
import com.moneyplant.screener.entities.ScreenerFunction;
import com.moneyplant.screener.entities.ScreenerFunctionParam;
import com.moneyplant.screener.repositories.ScreenerFunctionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced database-driven service for managing function definitions.
 * Provides function metadata operations using database tables with caching,
 * validation, and visual interface support.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FunctionDefinitionService {

    private final ScreenerFunctionRepository functionRepository;

    private final ObjectMapper objectMapper;

    /**
     * Gets functions available for the specified user with role-based filtering.
     * 
     * @param userId the user ID
     * @return list of available functions
     */
    @Cacheable(value = "userFunctions", key = "#userId")
    public List<FunctionMetaResp> getFunctionsForUser(Long userId) {
        log.debug("Getting functions for user: {}", userId);
        
        try {
            List<ScreenerFunction> activeFunctions = functionRepository.findActiveFunctionsWithParameters();
            
            return activeFunctions.stream()
                .filter(function -> hasFunctionAccess(function, userId))
                .map(this::mapToFunctionMetaResp)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting functions for user {}: {}", userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Gets a specific function by ID for the user.
     * 
     * @param functionId the function ID (function name)
     * @param userId the user ID
     * @return function metadata or null if not found/accessible
     */
    public FunctionMetaResp getFunctionForUser(String functionId, Long userId) {
        log.debug("Getting function {} for user: {}", functionId, userId);
        
        try {
            Optional<ScreenerFunction> functionOpt = functionRepository.findByFunctionNameWithParameters(functionId);
            
            if (functionOpt.isEmpty()) {
                log.warn("Function not found or inactive: {}", functionId);
                return null;
            }
            
            ScreenerFunction function = functionOpt.get();
            if (!hasFunctionAccess(function, userId)) {
                log.warn("User {} does not have access to function: {}", userId, functionId);
                return null;
            }
            
            return mapToFunctionMetaResp(function);
            
        } catch (Exception e) {
            log.error("Error getting function {} for user {}: {}", functionId, userId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Gets functions by category for the specified user.
     * 
     * @param category the function category
     * @param userId the user ID
     * @return list of functions in the category
     */
    @Cacheable(value = "userFunctionsByCategory", key = "#userId + '_' + #category")
    public List<FunctionMetaResp> getFunctionsByCategory(String category, Long userId) {
        log.debug("Getting functions in category {} for user: {}", category, userId);
        
        try {
            List<ScreenerFunction> categoryFunctions = functionRepository.findByCategoryAndIsActiveTrueOrderBySortOrder(category);
            
            return categoryFunctions.stream()
                .filter(function -> hasFunctionAccess(function, userId))
                .map(this::mapToFunctionMetaResp)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting functions in category {} for user {}: {}", category, userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Searches functions by name, display name, or description.
     * 
     * @param searchTerm the search term
     * @param userId the user ID
     * @return list of matching functions
     */
    public List<FunctionMetaResp> searchFunctions(String searchTerm, Long userId) {
        log.debug("Searching functions with term '{}' for user: {}", searchTerm, userId);
        
        try {
            List<ScreenerFunction> searchResults = functionRepository.searchActiveFunctions(searchTerm);
            
            return searchResults.stream()
                .filter(function -> hasFunctionAccess(function, userId))
                .map(this::mapToFunctionMetaResp)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error searching functions with term '{}' for user {}: {}", searchTerm, userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Gets available function categories for the user.
     * 
     * @param userId the user ID
     * @return list of available categories
     */
    @Cacheable(value = "userFunctionCategories", key = "#userId")
    public List<String> getFunctionCategories(Long userId) {
        log.debug("Getting function categories for user: {}", userId);
        
        try {
            List<String> allCategories = functionRepository.findDistinctCategoriesByIsActiveTrue();
            
            // Filter categories based on user access to functions in each category
            return allCategories.stream()
                .filter(category -> hasAccessToFunctionCategory(category, userId))
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting function categories for user {}: {}", userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Gets detailed function signature information for visual interface dialogs.
     * 
     * @param functionId the function ID
     * @param userId the user ID
     * @return detailed function signature or null if not found/accessible
     */
    public FunctionSignature getFunctionSignature(String functionId, Long userId) {
        log.debug("Getting function signature for {} and user: {}", functionId, userId);
        
        try {
            Optional<ScreenerFunction> functionOpt = functionRepository.findByFunctionNameWithParameters(functionId);
            
            if (functionOpt.isEmpty()) {
                log.warn("Function not found or inactive: {}", functionId);
                return null;
            }
            
            ScreenerFunction function = functionOpt.get();
            if (!hasFunctionAccess(function, userId)) {
                log.warn("User {} does not have access to function: {}", userId, functionId);
                return null;
            }
            
            return mapToFunctionSignature(function);
            
        } catch (Exception e) {
            log.error("Error getting function signature for {} and user {}: {}", functionId, userId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Gets functions by return type for the specified user.
     * 
     * @param returnType the return type
     * @param userId the user ID
     * @return list of functions with the specified return type
     */
    public List<FunctionMetaResp> getFunctionsByReturnType(String returnType, Long userId) {
        log.debug("Getting functions with return type {} for user: {}", returnType, userId);
        
        try {
            List<ScreenerFunction> typeFunctions = functionRepository.findByReturnTypeAndIsActiveTrueOrderByDisplayName(returnType);
            
            return typeFunctions.stream()
                .filter(function -> hasFunctionAccess(function, userId))
                .map(this::mapToFunctionMetaResp)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting functions with return type {} for user {}: {}", returnType, userId, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Validates function SQL template for safety.
     * 
     * @param functionId the function ID
     * @param userId the user ID
     * @return true if function is valid and safe, false otherwise
     */
    public boolean validateFunction(String functionId, Long userId) {
        log.debug("Validating function {} for user: {}", functionId, userId);
        
        try {
            FunctionMetaResp function = getFunctionForUser(functionId, userId);
            if (function == null) {
                return false;
            }
            
            // Validate SQL template safety
            return validateSqlTemplate(function.getSqlTemplate());
            
        } catch (Exception e) {
            log.error("Error validating function {} for user {}: {}", functionId, userId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Invalidates function cache when database tables are modified.
     * This method should be called when function or parameter data is updated.
     */
    @CacheEvict(value = {"userFunctions", "userFunctionsByCategory", "userFunctionCategories"}, allEntries = true)
    public void invalidateFunctionCache() {
        log.info("Invalidating function cache due to database modifications");
    }

    /**
     * Checks if user has access to a specific function based on role-based permissions.
     * This is a placeholder implementation - should be enhanced with actual role checking.
     * 
     * @param function the function entity
     * @param userId the user ID
     * @return true if user has access, false otherwise
     */
    private boolean hasFunctionAccess(ScreenerFunction function, Long userId) {
        // TODO: Implement actual role-based function access control
        // For now, all authenticated users have access to all active functions
        // This should be enhanced to check user roles and function permissions
        
        // Example logic (to be implemented):
        // - Check if function requires specific roles
        // - Check if user has required roles
        // - Check if function is whitelisted for user groups
        
        return function.getIsActive();
    }

    /**
     * Checks if user has access to any functions in the specified category.
     * 
     * @param category the category name
     * @param userId the user ID
     * @return true if user has access to category, false otherwise
     */
    private boolean hasAccessToFunctionCategory(String category, Long userId) {
        try {
            List<ScreenerFunction> categoryFunctions = functionRepository.findByCategoryAndIsActiveTrueOrderBySortOrder(category);
            return categoryFunctions.stream().anyMatch(function -> hasFunctionAccess(function, userId));
        } catch (Exception e) {
            log.error("Error checking function category access for {} and user {}: {}", category, userId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Maps ScreenerFunction entity to FunctionMetaResp DTO.
     * 
     * @param function the function entity
     * @return the function metadata response DTO
     */
    private FunctionMetaResp mapToFunctionMetaResp(ScreenerFunction function) {
        List<String> examples = parseExamples(function.getExamples());
        List<FunctionParameterResp> parameters = mapParameters(function.getParameters());
        
        return FunctionMetaResp.builder()
            .id(function.getFunctionName())
            .label(function.getDisplayName())
            .returnType(function.getReturnType())
            .sqlTemplate(function.getSqlTemplate())
            .category(function.getCategory())
            .description(function.getDescription())
            .examples(examples)
            .parameters(parameters)
            .build();
    }

    /**
     * Maps ScreenerFunction entity to FunctionSignature DTO with detailed information.
     * 
     * @param function the function entity
     * @return the detailed function signature DTO
     */
    private FunctionSignature mapToFunctionSignature(ScreenerFunction function) {
        List<String> examples = parseExamples(function.getExamples());
        List<FunctionParameterResp> parameters = mapParameters(function.getParameters());
        
        long requiredParams = parameters.stream().mapToLong(p -> p.isRequired() ? 1 : 0).sum();
        
        return FunctionSignature.builder()
            .functionId(function.getFunctionName())
            .label(function.getDisplayName())
            .description(function.getDescription())
            .returnType(function.getReturnType())
            .category(function.getCategory())
            .parameters(parameters)
            .examples(examples)
            .sqlTemplate(function.getSqlTemplate())
            .minParameters((int) requiredParams)
            .maxParameters(parameters.size())
            .build();
    }

    /**
     * Maps ScreenerFunctionParam entities to FunctionParameterResp DTOs.
     * 
     * @param parameters the parameter entities
     * @return list of parameter response DTOs
     */
    private List<FunctionParameterResp> mapParameters(List<ScreenerFunctionParam> parameters) {
        return parameters.stream()
            .map(param -> FunctionParameterResp.builder()
                .name(param.getParamName())
                .type(param.getDataType())
                .required(param.getIsRequired())
                .defaultValue(param.getDefaultValue())
                .validationRules(param.getValidationRules())
                .helpText(param.getHelpText())
                .order(param.getParamOrder())
                .build())
            .collect(Collectors.toList());
    }

    /**
     * Parses examples from JSON object to list of strings.
     * 
     * @param examples the examples object
     * @return list of example strings
     */
    private List<String> parseExamples(Object examples) {
        if (examples == null) {
            return List.of();
        }
        
        try {
            if (examples instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> exampleList = (List<String>) examples;
                return exampleList;
            } else {
                // Try to parse as JSON array
                List<String> exampleList = objectMapper.convertValue(examples, new TypeReference<List<String>>() {});
                return exampleList != null ? exampleList : List.of();
            }
        } catch (Exception e) {
            log.warn("Error parsing function examples: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Validates SQL template for safety and injection prevention.
     * 
     * @param sqlTemplate the SQL template to validate
     * @return true if template is safe, false otherwise
     */
    private boolean validateSqlTemplate(String sqlTemplate) {
        if (sqlTemplate == null || sqlTemplate.trim().isEmpty()) {
            return false;
        }
        
        // Basic SQL injection prevention checks
        String upperTemplate = sqlTemplate.toUpperCase();
        
        // Check for dangerous SQL keywords
        List<String> dangerousKeywords = List.of(
            "DROP", "DELETE", "INSERT", "UPDATE", "CREATE", "ALTER", 
            "TRUNCATE", "EXEC", "EXECUTE", "UNION", "DECLARE", "CURSOR"
        );
        
        for (String keyword : dangerousKeywords) {
            if (upperTemplate.contains(keyword)) {
                log.warn("Dangerous SQL keyword '{}' found in template: {}", keyword, sqlTemplate);
                return false;
            }
        }
        
        // Check for SQL comments that could be used for injection
        if (sqlTemplate.contains("--") || sqlTemplate.contains("/*") || sqlTemplate.contains("*/")) {
            log.warn("SQL comments found in template: {}", sqlTemplate);
            return false;
        }
        
        // Check for semicolons that could terminate statements
        if (sqlTemplate.contains(";")) {
            log.warn("Semicolon found in template: {}", sqlTemplate);
            return false;
        }
        
        return true;
    }
}