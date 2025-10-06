package com.moneyplant.screener.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Context object containing user-specific validation information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationContext {

    private Long userId;
    private List<FieldMetaResp> availableFields;
    private List<FunctionMetaResp> availableFunctions;
    private Map<String, FieldMetaResp> fieldMap;
    private Map<String, FunctionMetaResp> functionMap;
    private int currentDepth;
    private int maxDepth;
    private int conditionCount;
    private int maxConditions;

    public ValidationContext(Long userId) {
        this.userId = userId;
        this.currentDepth = 0;
        this.maxDepth = 10; // Default max depth
        this.conditionCount = 0;
        this.maxConditions = 100; // Default max conditions
    }

    public FieldMetaResp getField(String fieldId) {
        return fieldMap != null ? fieldMap.get(fieldId) : null;
    }

    public FunctionMetaResp getFunction(String functionId) {
        return functionMap != null ? functionMap.get(functionId) : null;
    }

    public void incrementDepth() {
        this.currentDepth++;
    }

    public void decrementDepth() {
        this.currentDepth--;
    }

    public void incrementConditionCount() {
        this.conditionCount++;
    }
}