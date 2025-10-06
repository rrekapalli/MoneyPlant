package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.FieldMetaResp;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for managing field metadata.
 * This is a placeholder implementation - full implementation in task 6.1.
 */
@Service
public class FieldMetadataService {

    /**
     * Gets fields available for the specified user.
     * 
     * @param userId the user ID
     * @return list of available fields
     */
    public List<FieldMetaResp> getFieldsForUser(Long userId) {
        // TODO: Implement in task 6.1
        return List.of();
    }

    /**
     * Gets a specific field by ID for the user.
     * 
     * @param fieldId the field ID
     * @param userId the user ID
     * @return field metadata or null if not found/accessible
     */
    public FieldMetaResp getFieldForUser(String fieldId, Long userId) {
        // TODO: Implement in task 6.1
        return null;
    }
}