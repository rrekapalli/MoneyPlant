package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.SavedViewCreateReq;
import com.moneyplant.screener.dtos.SavedViewResp;
import com.moneyplant.screener.entities.Screener;
import com.moneyplant.screener.entities.ScreenerSavedView;
import com.moneyplant.screener.mappers.SavedViewMapper;
import com.moneyplant.screener.repositories.ScreenerRepository;
import com.moneyplant.screener.repositories.ScreenerSavedViewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing screener saved views.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerSavedViewService {

    private final ScreenerSavedViewRepository screenerSavedViewRepository;
    private final ScreenerRepository screenerRepository;
    private final SavedViewMapper savedViewMapper;
    private final CurrentUserService currentUserService;

    /**
     * Creates a new saved view.
     */
    public SavedViewResp createSavedView(Long screenerId, SavedViewCreateReq request) {
        log.info("Creating saved view for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByIdAndOwnerOrPublic(screenerId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener not found: " + screenerId));
        
        // Check if view name already exists for user and screener
        if (screenerSavedViewRepository.existsByScreenerScreenerIdAndUserIdAndName(screenerId, currentUserId, request.getName())) {
            throw new RuntimeException("Saved view name already exists: " + request.getName());
        }
        
        ScreenerSavedView savedView = savedViewMapper.toEntity(request);
        savedView.setScreener(screener);
        savedView.setUserId(currentUserId);
        
        ScreenerSavedView saved = screenerSavedViewRepository.save(savedView);
        log.info("Created saved view: {} for screener: {}", saved.getName(), screenerId);
        
        return savedViewMapper.toResponse(saved);
    }

    /**
     * Gets a saved view by ID.
     */
    @Transactional(readOnly = true)
    public SavedViewResp getSavedView(Long savedViewId) {
        log.info("Getting saved view: {}", savedViewId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerSavedView savedView = screenerSavedViewRepository.findBySavedViewIdAndUserId(savedViewId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Saved view not found: " + savedViewId));
        
        return savedViewMapper.toResponse(savedView);
    }

    /**
     * Lists saved views for a screener.
     */
    @Transactional(readOnly = true)
    public List<SavedViewResp> listSavedViews(Long screenerId) {
        log.info("Listing saved views for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByIdAndOwnerOrPublic(screenerId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener not found: " + screenerId));
        
        List<ScreenerSavedView> savedViews = screenerSavedViewRepository.findByScreenerScreenerIdAndUserIdOrderByCreatedAtDesc(screenerId, currentUserId);
        
        return savedViews.stream()
                .map(savedViewMapper::toResponse)
                .toList();
    }

    /**
     * Lists all saved views for current user.
     */
    @Transactional(readOnly = true)
    public List<SavedViewResp> listMySavedViews() {
        log.info("Listing my saved views");
        
        Long currentUserId = currentUserService.getCurrentUserId();
        List<ScreenerSavedView> savedViews = screenerSavedViewRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
        
        return savedViews.stream()
                .map(savedViewMapper::toResponse)
                .toList();
    }

    /**
     * Updates a saved view.
     */
    public SavedViewResp updateSavedView(Long savedViewId, SavedViewCreateReq request) {
        log.info("Updating saved view: {}", savedViewId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerSavedView savedView = screenerSavedViewRepository.findBySavedViewIdAndUserId(savedViewId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Saved view not found: " + savedViewId));
        
        // Check if new name conflicts with existing view (excluding current one)
        if (!savedView.getName().equals(request.getName()) && 
            screenerSavedViewRepository.existsByScreenerScreenerIdAndUserIdAndName(
                savedView.getScreener().getScreenerId(), currentUserId, request.getName())) {
            throw new RuntimeException("Saved view name already exists: " + request.getName());
        }
        
        savedViewMapper.updateEntity(request, savedView);
        ScreenerSavedView saved = screenerSavedViewRepository.save(savedView);
        
        log.info("Updated saved view: {}", savedViewId);
        return savedViewMapper.toResponse(saved);
    }

    /**
     * Deletes a saved view.
     */
    public void deleteSavedView(Long savedViewId) {
        log.info("Deleting saved view: {}", savedViewId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerSavedView savedView = screenerSavedViewRepository.findBySavedViewIdAndUserId(savedViewId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Saved view not found: " + savedViewId));
        
        screenerSavedViewRepository.delete(savedView);
        log.info("Deleted saved view: {}", savedViewId);
    }

    /**
     * Gets saved view count for current user.
     */
    @Transactional(readOnly = true)
    public long getMySavedViewCount() {
        Long currentUserId = currentUserService.getCurrentUserId();
        return screenerSavedViewRepository.countByUserId(currentUserId);
    }

    /**
     * Gets saved view count for a screener.
     */
    @Transactional(readOnly = true)
    public long getSavedViewCount(Long screenerId) {
        return screenerSavedViewRepository.countByScreenerScreenerId(screenerId);
    }
}
