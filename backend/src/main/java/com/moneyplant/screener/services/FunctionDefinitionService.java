package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.FunctionMetaResp;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for managing function definitions.
 * This is a placeholder implementation - full implementation in task 6.2.
 */
@Service
public class FunctionDefinitionService {

    /**
     * Gets functions available for the specified user.
     * 
     * @param userId the user ID
     * @return list of available functions
     */
    public List<FunctionMetaResp> getFunctionsForUser(Long userId) {
        // TODO: Implement in task 6.2
        return List.of();
    }

    /**
     * Gets a specific function by ID for the user.
     * 
     * @param functionId the function ID
     * @param userId the user ID
     * @return function metadata or null if not found/accessible
     */
    public FunctionMetaResp getFunctionForUser(String functionId, Long userId) {
        // TODO: Implement in task 6.2
        return null;
    }
}