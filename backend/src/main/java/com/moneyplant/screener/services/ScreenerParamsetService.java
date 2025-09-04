package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.ParamsetCreateReq;
import com.moneyplant.screener.dtos.ParamsetResp;
import com.moneyplant.screener.entities.ScreenerParamset;
import com.moneyplant.screener.entities.ScreenerVersion;
import com.moneyplant.screener.mappers.ParamsetMapper;
import com.moneyplant.screener.repositories.ScreenerParamsetRepository;
import com.moneyplant.screener.repositories.ScreenerVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing screener parameter sets.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerParamsetService {

    private final ScreenerParamsetRepository screenerParamsetRepository;
    private final ScreenerVersionRepository screenerVersionRepository;
    private final ParamsetMapper paramsetMapper;
    private final CurrentUserService currentUserService;

    /**
     * Creates a new parameter set.
     */
    public ParamsetResp createParamset(Long versionId, ParamsetCreateReq request) {
        log.info("Creating paramset for version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndScreenerOwner(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found or access denied: " + versionId));
        
        // Check if paramset name already exists for this version
        if (screenerParamsetRepository.existsByScreenerVersionScreenerVersionIdAndName(versionId, request.getName())) {
            throw new RuntimeException("Parameter set name already exists: " + request.getName());
        }
        
        ScreenerParamset paramset = paramsetMapper.toEntity(request);
        paramset.setScreenerVersion(version);
        paramset.setCreatedByUserId(currentUserId);
        
        ScreenerParamset savedParamset = screenerParamsetRepository.save(paramset);
        log.info("Created paramset {} for version: {}", savedParamset.getName(), versionId);
        
        return paramsetMapper.toResponse(savedParamset);
    }

    /**
     * Gets a parameter set by ID.
     */
    @Transactional(readOnly = true)
    public ParamsetResp getParamset(Long paramsetId) {
        log.info("Getting paramset: {}", paramsetId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerParamset paramset = screenerParamsetRepository.findByIdAndOwnerOrPublic(paramsetId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Parameter set not found: " + paramsetId));
        
        return paramsetMapper.toResponse(paramset);
    }

    /**
     * Lists parameter sets for a version.
     */
    @Transactional(readOnly = true)
    public List<ParamsetResp> listParamsets(Long versionId) {
        log.info("Listing paramsets for version: {}", versionId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerVersion version = screenerVersionRepository.findByIdAndScreenerOwner(versionId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener version not found or access denied: " + versionId));
        
        List<ScreenerParamset> paramsets = screenerParamsetRepository.findByScreenerVersionScreenerVersionIdOrderByCreatedAtDesc(versionId);
        
        return paramsets.stream()
                .map(paramsetMapper::toResponse)
                .toList();
    }

    /**
     * Updates a parameter set.
     */
    public ParamsetResp updateParamset(Long paramsetId, ParamsetCreateReq request) {
        log.info("Updating paramset: {}", paramsetId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerParamset paramset = screenerParamsetRepository.findByIdAndVersionOwner(paramsetId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Parameter set not found or access denied: " + paramsetId));
        
        // Check if new name conflicts with existing paramset (excluding current one)
        if (!paramset.getName().equals(request.getName()) && 
            screenerParamsetRepository.existsByScreenerVersionScreenerVersionIdAndName(
                paramset.getScreenerVersion().getScreenerVersionId(), request.getName())) {
            throw new RuntimeException("Parameter set name already exists: " + request.getName());
        }
        
        paramsetMapper.updateEntity(request, paramset);
        ScreenerParamset savedParamset = screenerParamsetRepository.save(paramset);
        
        log.info("Updated paramset: {}", paramsetId);
        return paramsetMapper.toResponse(savedParamset);
    }

    /**
     * Deletes a parameter set.
     */
    public void deleteParamset(Long paramsetId) {
        log.info("Deleting paramset: {}", paramsetId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerParamset paramset = screenerParamsetRepository.findByIdAndVersionOwner(paramsetId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Parameter set not found or access denied: " + paramsetId));
        
        screenerParamsetRepository.delete(paramset);
        log.info("Deleted paramset: {}", paramsetId);
    }

    /**
     * Gets parameter sets created by current user.
     */
    @Transactional(readOnly = true)
    public List<ParamsetResp> getMyParamsets() {
        log.info("Getting my paramsets");
        
        Long currentUserId = currentUserService.getCurrentUserId();
        List<ScreenerParamset> paramsets = screenerParamsetRepository.findByCreatedByUserIdOrderByCreatedAtDesc(currentUserId);
        
        return paramsets.stream()
                .map(paramsetMapper::toResponse)
                .toList();
    }

    /**
     * Resolves parameter values (defaults vs overrides).
     */
    @Transactional(readOnly = true)
    public Object resolveParameters(Long paramsetId, Object overrideParams) {
        log.info("Resolving parameters for paramset: {}", paramsetId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerParamset paramset = screenerParamsetRepository.findByIdAndOwnerOrPublic(paramsetId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Parameter set not found: " + paramsetId));
        
        // For now, return the paramset's params_json
        // In a real implementation, you would merge with defaults from paramsSchemaJson
        return paramset.getParamsJson();
    }
}
