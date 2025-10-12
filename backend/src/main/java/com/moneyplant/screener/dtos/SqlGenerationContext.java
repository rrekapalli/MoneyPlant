package com.moneyplant.screener.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Context for SQL generation containing user-specific metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SqlGenerationContext {

    private Long userId;
    
    @Builder.Default
    private Map<String, FieldMetaResp> fieldMap = new HashMap<>();
    
    @Builder.Default
    private Map<String, FunctionMetaResp> functionMap = new HashMap<>();
    
    private List<FieldMetaResp> availableFields;
    private List<FunctionMetaResp> availableFunctions;

    public SqlGenerationContext(Long userId) {
        this.userId = userId;
        this.fieldMap = new HashMap<>();
        this.functionMap = new HashMap<>();
    }

    /**
     * Gets field metadata by field ID.
     */
    public FieldMetaResp getField(String fieldId) {
        return fieldMap.get(fieldId);
    }

    /**
     * Gets function metadata by function ID.
     */
    public FunctionMetaResp getFunction(String functionId) {
        return functionMap.get(functionId);
    }

    /**
     * Sets available fields and builds lookup map.
     */
    public void setAvailableFields(List<FieldMetaResp> fields) {
        this.availableFields = fields;
        this.fieldMap.clear();
        if (fields != null) {
            fields.forEach(field -> fieldMap.put(field.getId(), field));
        }
    }

    /**
     * Sets available functions and builds lookup map.
     */
    public void setAvailableFunctions(List<FunctionMetaResp> functions) {
        this.availableFunctions = functions;
        this.functionMap.clear();
        if (functions != null) {
            functions.forEach(function -> functionMap.put(function.getId(), function));
        }
    }
}