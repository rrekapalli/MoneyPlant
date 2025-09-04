package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.ScreenerVersionCreateReq;
import com.moneyplant.screener.dtos.ScreenerVersionResp;
import com.moneyplant.screener.entities.Screener;
import com.moneyplant.screener.entities.ScreenerVersion;
import com.moneyplant.screener.mappers.ScreenerVersionMapper;
import com.moneyplant.screener.repositories.ScreenerRepository;
import com.moneyplant.screener.repositories.ScreenerVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
}
