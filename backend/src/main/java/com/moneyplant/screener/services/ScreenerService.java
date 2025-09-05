package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.PageResp;
import com.moneyplant.screener.dtos.ScreenerCreateReq;
import com.moneyplant.screener.dtos.ScreenerResp;
import com.moneyplant.screener.entities.Screener;
import com.moneyplant.screener.exceptions.AccessDeniedException;
import com.moneyplant.screener.exceptions.ResourceNotFoundException;
import com.moneyplant.screener.repositories.ScreenerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing screeners.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerService {

    // --- Manual mapper methods to decouple from MapStruct at runtime ---
    private Screener toEntity(ScreenerCreateReq request) {
        if (request == null) return null;
        Screener.ScreenerBuilder b = Screener.builder();
        b.name(request.getName());
        b.description(request.getDescription());
        b.isPublic(request.getIsPublic());
        b.defaultUniverse(request.getDefaultUniverse());
        return b.build();
    }

    private ScreenerResp toResponse(Screener entity) {
        if (entity == null) return null;
        return ScreenerResp.builder()
                .screenerId(entity.getScreenerId())
                .ownerUserId(entity.getOwnerUserId())
                .name(entity.getName())
                .description(entity.getDescription())
                .isPublic(entity.getIsPublic())
                .defaultUniverse(entity.getDefaultUniverse())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private void updateEntity(ScreenerCreateReq request, Screener entity) {
        if (request == null || entity == null) return;
        if (request.getName() != null) entity.setName(request.getName());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getIsPublic() != null) entity.setIsPublic(request.getIsPublic());
        if (request.getDefaultUniverse() != null) entity.setDefaultUniverse(request.getDefaultUniverse());
    }

    private final ScreenerRepository screenerRepository;
    private final CurrentUserService currentUserService;

    // Use manual mapping to avoid runtime dependency on MapStruct bean in constructor resolution
    // This prevents NoClassDefFoundError during ApplicationContext startup in some environments

    /**
     * Creates a new screener.
     */
    public ScreenerResp createScreener(ScreenerCreateReq request) {
        log.info("Creating screener: {}", request.getName());
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = toEntity(request);
        screener.setOwnerUserId(currentUserId);
        
        Screener savedScreener = screenerRepository.save(screener);
        log.info("Created screener with ID: {}", savedScreener.getScreenerId());
        
        return toResponse(savedScreener);
    }

    /**
     * Gets a screener by ID (owner or public).
     */
    @Transactional(readOnly = true)
    public ScreenerResp getScreener(Long screenerId) {
        log.info("Getting screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByIdAndOwnerOrPublic(screenerId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Screener not found: " + screenerId));
        
        return toResponse(screener);
    }

    /**
     * Updates a screener (owner only).
     */
    public ScreenerResp updateScreener(Long screenerId, ScreenerCreateReq request) {
        log.info("Updating screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByScreenerIdAndOwnerUserId(screenerId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("Screener not found or access denied: " + screenerId));
        
        updateEntity(request, screener);
        Screener savedScreener = screenerRepository.save(screener);
        
        log.info("Updated screener: {}", screenerId);
        return toResponse(savedScreener);
    }

    /**
     * Deletes a screener (owner only).
     */
    public void deleteScreener(Long screenerId) {
        log.info("Deleting screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!screenerRepository.existsByScreenerIdAndOwnerUserId(screenerId, currentUserId)) {
            throw new AccessDeniedException("Screener not found or access denied: " + screenerId);
        }
        
        screenerRepository.deleteById(screenerId);
        log.info("Deleted screener: {}", screenerId);
    }

    /**
     * Lists screeners (mine + public) with search and pagination.
     */
    @Transactional(readOnly = true)
    public PageResp<ScreenerResp> listScreeners(String search, int page, int size, String sort) {
        log.info("Listing screeners - search: {}, page: {}, size: {}", search, page, size);
        
        try {
            Long currentUserId = currentUserService.getCurrentUserId();
            log.info("Current user ID: {}", currentUserId);
            
            // Note: Sorting is handled in the native query, so we don't pass Sort to Pageable
            Pageable pageable = PageRequest.of(page, size);
            log.info("Executing query with userId: {}, search: {}", currentUserId, search);
            
            Page<Screener> screeners = screenerRepository.findByOwnerUserIdOrIsPublicTrueWithSearch(
                    currentUserId, search, pageable);
            
            log.info("Query executed successfully, found {} screeners", screeners.getTotalElements());
            
            List<ScreenerResp> content = screeners.getContent().stream()
                    .map(this::toResponse)
                    .toList();
            
            return PageResp.<ScreenerResp>builder()
                    .content(content)
                    .page(screeners.getNumber())
                    .size(screeners.getSize())
                    .totalElements(screeners.getTotalElements())
                    .totalPages(screeners.getTotalPages())
                    .sort(sort)
                    .build();
        } catch (Exception e) {
            log.error("Error in listScreeners: ", e);
            throw e;
        }
    }

    /**
     * Lists my screeners.
     */
    @Transactional(readOnly = true)
    public List<ScreenerResp> listMyScreeners() {
        log.info("Listing my screeners");
        
        Long currentUserId = currentUserService.getCurrentUserId();
        List<Screener> screeners = screenerRepository.findByOwnerUserIdOrderByCreatedAtDesc(currentUserId);
        
        return screeners.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Lists public screeners.
     */
    @Transactional(readOnly = true)
    public List<ScreenerResp> listPublicScreeners() {
        log.info("Listing public screeners");
        
        List<Screener> screeners = screenerRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        
        return screeners.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Lists starred screeners for current user.
     */
    @Transactional(readOnly = true)
    public List<ScreenerResp> listStarredScreeners() {
        log.info("Listing starred screeners");
        
        Long currentUserId = currentUserService.getCurrentUserId();
        List<Screener> screeners = screenerRepository.findStarredByUserId(currentUserId);
        
        return screeners.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Checks if user has access to screener.
     */
    @Transactional(readOnly = true)
    public boolean hasAccess(Long screenerId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        return screenerRepository.findByIdAndOwnerOrPublic(screenerId, currentUserId).isPresent();
    }

    /**
     * Checks if user owns screener.
     */
    @Transactional(readOnly = true)
    public boolean isOwner(Long screenerId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        return screenerRepository.existsByScreenerIdAndOwnerUserId(screenerId, currentUserId);
    }
}
