package com.moneyplant.screener.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyplant.screener.dtos.*;
import com.moneyplant.screener.entities.Screener;
import com.moneyplant.screener.entities.ScreenerVersion;
import com.moneyplant.screener.exceptions.CriteriaValidationException;
import com.moneyplant.screener.mappers.ScreenerVersionMapper;
import com.moneyplant.screener.repositories.ScreenerRepository;
import com.moneyplant.screener.repositories.ScreenerVersionRepository;
import com.moneyplant.screener.utils.ScreenerIntegrationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing screener versions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerVersionService {

    private final ScreenerVersionRepository screenerVersionRepository;
    private final ScreenerRepository screenerRepository;
    private final ScreenerVersionMapper screenerVersionMapper;
    private final CurrentUserService currentUserService;
    private final CriteriaValidationService criteriaValidationService;
    private final CriteriaSqlService criteriaSqlService;
    private final ObjectMapper objectMapper;
    private final ScreenerIntegrationUtils integrationUtils;

    /**
     * Creates a new screener version.
     */
    public ScreenerVersionResp createVersion(Long screenerId, ScreenerVersionCreateReq request) {
        log.info("Creating version for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByScreenerIdAndOwnerUserId(screenerId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener not found or access denied: " + screenerId));
        
        // Check if version number already exists
        if (screenerVersionRepository.existsByScreenerScreenerIdAndVersionNumber(screenerId, request.getVersionNumber())) {
            throw new RuntimeException("Version number already exists: " + request.getVersionNumber());
        }
        
        ScreenerVersion version = screenerVersionMapper.toEntity(request);
        version.setScreener(screener);
        
        ScreenerVersion savedVersion = screenerVersionRepository.save(version);
        log.info("Created version {} for screener: {}", savedVersion.getVersionNumber(), screenerId);
        
        return screenerVersionMapper.toResponse(savedVersion);
    }

    /**
     * Gets a screener version by ID.
     */
    @Transactional(readOnly = true)
    public ScreenerVersionResp getVersion(Long versionId) {
        log.info("Getting screener version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndOwnerOrPublic(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found: " + versionId));
        
        return screenerVersionMapper.toResponse(version);
    }

    /**
     * Lists versions for a screener.
     */
    @Transactional(readOnly = true)
    public List<ScreenerVersionResp> listVersions(Long screenerId) {
        log.info("Listing versions for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!screenerRepository.existsByScreenerIdAndOwnerUserId(screenerId, currentUserId)) {
            throw new RuntimeException("Screener not found or access denied: " + screenerId);
        }
        
        List<ScreenerVersion> versions = screenerVersionRepository.findByScreenerScreenerIdOrderByVersionNumberDesc(screenerId);
        
        return versions.stream()
                .map(screenerVersionMapper::toResponse)
                .toList();
    }

    /**
     * Updates a screener version.
     */
    public ScreenerVersionResp updateVersion(Long versionId, ScreenerVersionCreateReq request) {
        log.info("Updating screener version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndScreenerOwner(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found or access denied: " + versionId));
        
        screenerVersionMapper.updateEntity(request, version);
        ScreenerVersion savedVersion = screenerVersionRepository.save(version);
        
        log.info("Updated screener version: {}", versionId);
        return screenerVersionMapper.toResponse(savedVersion);
    }

    /**
     * Archives a screener version.
     */
    public void archiveVersion(Long versionId) {
        log.info("Archiving screener version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndScreenerOwner(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found or access denied: " + versionId));
        
        version.setStatus("archived");
        screenerVersionRepository.save(version);
        
        log.info("Archived screener version: {}", versionId);
    }

    /**
     * Activates a screener version.
     */
    public void activateVersion(Long versionId) {
        log.info("Activating screener version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndScreenerOwner(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found or access denied: " + versionId));
        
        version.setStatus("active");
        screenerVersionRepository.save(version);
        
        log.info("Activated screener version: {}", versionId);
    }

    /**
     * Gets the latest version for a screener.
     */
    @Transactional(readOnly = true)
    public Optional<ScreenerVersionResp> getLatestVersion(Long screenerId) {
        log.info("Getting latest version for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!screenerRepository.existsByScreenerIdAndOwnerUserId(screenerId, currentUserId)) {
            throw new RuntimeException("Screener not found or access denied: " + screenerId);
        }
        
        return screenerVersionRepository.findLatestByScreenerId(screenerId)
                .map(screenerVersionMapper::toResponse);
    }

    /**
     * Gets the next version number for a screener.
     */
    @Transactional(readOnly = true)
    public Integer getNextVersionNumber(Long screenerId) {
        return screenerVersionRepository.getNextVersionNumber(screenerId);
    }

    /**
     * Creates a new screener version with criteria DSL validation and SQL generation.
     * This method integrates with the criteria builder functionality.
     */
    public ScreenerVersionResp createVersionWithCriteria(Long screenerId, ScreenerVersionCreateReq request) {
        log.info("Creating version with criteria DSL for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByScreenerIdAndOwnerUserId(screenerId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener not found or access denied: " + screenerId));
        
        // Check if version number already exists
        if (screenerVersionRepository.existsByScreenerScreenerIdAndVersionNumber(screenerId, request.getVersionNumber())) {
            throw new RuntimeException("Version number already exists: " + request.getVersionNumber());
        }

        // If request contains criteria DSL, validate and generate SQL
        if (request.getDslJson() != null) {
            try {
                // Convert DSL JSON to CriteriaDSL object
                CriteriaDSL dsl = objectMapper.convertValue(request.getDslJson(), CriteriaDSL.class);
                
                // Validate the DSL
                ValidationResult validation = criteriaValidationService.validateDSL(dsl, currentUserId);
                if (!validation.isValid()) {
                    log.warn("Invalid criteria DSL for screener {}: {} errors", screenerId, validation.getErrors().size());
                    throw new CriteriaValidationException("Invalid criteria DSL", validation.getErrors());
                }
                
                // Generate SQL from validated DSL
                SqlGenerationResult sqlResult = criteriaSqlService.generateSql(dsl, currentUserId);
                
                // Validate SQL compatibility with screener infrastructure
                if (!integrationUtils.isValidScreenerSql(sqlResult.getSql())) {
                    throw new RuntimeException("Generated SQL is not compatible with screener execution framework");
                }
                
                // Validate parameter mapping
                if (!integrationUtils.validateParameterMapping(sqlResult.getSql(), sqlResult.getParameters())) {
                    throw new RuntimeException("SQL parameter mapping validation failed");
                }

                // Update request with generated SQL and parameters
                request.setCompiledSql(sqlResult.getSql());
                request.setParamsSchemaJson(integrationUtils.createParameterSchema(sqlResult.getParameters()));
                
                log.info("Generated SQL for screener {} version {}: {} with {} parameters", 
                    screenerId, request.getVersionNumber(), sqlResult.getSql(), sqlResult.getParameters().size());
                
            } catch (CriteriaValidationException e) {
                // Re-throw validation exceptions as-is
                throw e;
            } catch (Exception e) {
                log.error("Failed to process criteria DSL for screener {}: {}", screenerId, e.getMessage(), e);
                throw new RuntimeException("Failed to process criteria DSL: " + e.getMessage(), e);
            }
        }
        
        // Create the version using the standard method
        ScreenerVersion version = screenerVersionMapper.toEntity(request);
        version.setScreener(screener);
        
        ScreenerVersion savedVersion = screenerVersionRepository.save(version);
        log.info("Created version {} with criteria for screener: {}", savedVersion.getVersionNumber(), screenerId);
        
        return screenerVersionMapper.toResponse(savedVersion);
    }

    /**
     * Validates criteria DSL in an existing screener version.
     * Used before execution to ensure DSL is still valid.
     */
    @Transactional(readOnly = true)
    public ValidationResult validateVersionCriteria(Long versionId) {
        log.info("Validating criteria for screener version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndOwnerOrPublic(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found: " + versionId));
        
        if (version.getDslJson() == null) {
            // No criteria DSL to validate
            return ValidationResult.builder()
                .valid(true)
                .errors(List.of())
                .warnings(List.of())
                .build();
        }
        
        try {
            CriteriaDSL dsl = objectMapper.convertValue(version.getDslJson(), CriteriaDSL.class);
            return criteriaValidationService.validateDSL(dsl, currentUserId);
        } catch (Exception e) {
            log.error("Failed to validate criteria for version {}: {}", versionId, e.getMessage(), e);
            return ValidationResult.builder()
                .valid(false)
                .errors(List.of(ValidationError.builder()
                    .code("DSL_PARSE_ERROR")
                    .message("Failed to parse criteria DSL: " + e.getMessage())
                    .path("$.root")
                    .build()))
                .warnings(List.of())
                .build();
        }
    }

    /**
     * Migrates DSL format for a screener version to current version.
     * Provides tools to update old DSL format to current version within screener versions.
     */
    public ScreenerVersionResp migrateDslFormat(Long versionId) {
        log.info("Migrating DSL format for screener version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndScreenerOwner(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found or access denied: " + versionId));
        
        if (version.getDslJson() == null) {
            throw new RuntimeException("Version does not contain criteria DSL: " + versionId);
        }
        
        try {
            // Parse existing DSL
            CriteriaDSL dsl = objectMapper.convertValue(version.getDslJson(), CriteriaDSL.class);
            
            // Apply any format migrations (this would be expanded as DSL format evolves)
            CriteriaDSL migratedDsl = applyDslMigrations(dsl);
            
            // Re-validate migrated DSL
            ValidationResult validation = criteriaValidationService.validateDSL(migratedDsl, currentUserId);
            if (!validation.isValid()) {
                throw new CriteriaValidationException("Migrated DSL validation failed", validation.getErrors());
            }
            
            // Regenerate SQL with migrated DSL
            SqlGenerationResult sqlResult = criteriaSqlService.generateSql(migratedDsl, currentUserId);
            
            // Validate SQL compatibility
            if (!integrationUtils.isValidScreenerSql(sqlResult.getSql())) {
                throw new RuntimeException("Migrated SQL is not compatible with screener execution framework");
            }
            
            // Update version with migrated DSL and new SQL
            @SuppressWarnings("unchecked")
            Map<String, Object> dslMap = objectMapper.convertValue(migratedDsl, Map.class);
            version.setDslJson(dslMap);
            version.setCompiledSql(sqlResult.getSql());
            version.setParamsSchemaJson(integrationUtils.createParameterSchema(sqlResult.getParameters()));
            
            ScreenerVersion savedVersion = screenerVersionRepository.save(version);
            log.info("Migrated DSL format for version {}", versionId);
            
            return screenerVersionMapper.toResponse(savedVersion);
            
        } catch (Exception e) {
            log.error("Failed to migrate DSL format for version {}: {}", versionId, e.getMessage(), e);
            throw new RuntimeException("Failed to migrate DSL format: " + e.getMessage(), e);
        }
    }

    /**
     * Applies DSL format migrations to update old DSL structures to current version.
     */
    private CriteriaDSL applyDslMigrations(CriteriaDSL dsl) {
        // This method would contain logic to migrate old DSL formats to current version
        // For now, return the DSL as-is since we're starting with the current format
        log.debug("Applying DSL migrations - no migrations needed for current format");
        return dsl;
    }

    /**
     * Regenerates SQL for a screener version with criteria DSL.
     * Useful when function definitions or field metadata changes.
     */
    public ScreenerVersionResp regenerateVersionSql(Long versionId) {
        log.info("Regenerating SQL for screener version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndScreenerOwner(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found or access denied: " + versionId));
        
        if (version.getDslJson() == null) {
            throw new RuntimeException("Version does not contain criteria DSL: " + versionId);
        }
        
        try {
            CriteriaDSL dsl = objectMapper.convertValue(version.getDslJson(), CriteriaDSL.class);
            
            // Re-validate DSL
            ValidationResult validation = criteriaValidationService.validateDSL(dsl, currentUserId);
            if (!validation.isValid()) {
                throw new CriteriaValidationException("Invalid criteria DSL during regeneration", validation.getErrors());
            }
            
            // Regenerate SQL
            SqlGenerationResult sqlResult = criteriaSqlService.generateSql(dsl, currentUserId);
            
            // Validate SQL compatibility
            if (!integrationUtils.isValidScreenerSql(sqlResult.getSql())) {
                throw new RuntimeException("Regenerated SQL is not compatible with screener execution framework");
            }
            
            if (!integrationUtils.validateParameterMapping(sqlResult.getSql(), sqlResult.getParameters())) {
                throw new RuntimeException("Regenerated SQL parameter mapping validation failed");
            }

            // Update version with new SQL
            version.setCompiledSql(sqlResult.getSql());
            version.setParamsSchemaJson(integrationUtils.createParameterSchema(sqlResult.getParameters()));
            
            ScreenerVersion savedVersion = screenerVersionRepository.save(version);
            log.info("Regenerated SQL for version {}: {}", versionId, sqlResult.getSql());
            
            return screenerVersionMapper.toResponse(savedVersion);
            
        } catch (Exception e) {
            log.error("Failed to regenerate SQL for version {}: {}", versionId, e.getMessage(), e);
            throw new RuntimeException("Failed to regenerate SQL: " + e.getMessage(), e);
        }
    }


}
