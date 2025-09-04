package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.PageResp;
import com.moneyplant.screener.dtos.ScreenerCreateReq;
import com.moneyplant.screener.dtos.ScreenerResp;
import com.moneyplant.screener.entities.Screener;
import com.moneyplant.screener.exceptions.AccessDeniedException;
import com.moneyplant.screener.exceptions.ResourceNotFoundException;
import com.moneyplant.screener.mappers.ScreenerMapper;
import com.moneyplant.screener.repositories.ScreenerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing screeners.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerService {

    private final ScreenerRepository screenerRepository;
    private final ScreenerMapper screenerMapper;
    private final CurrentUserService currentUserService;

    /**
     * Creates a new screener.
     */
    public ScreenerResp createScreener(ScreenerCreateReq request) {
        log.info("Creating screener: {}", request.getName());
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerMapper.toEntity(request);
        screener.setOwnerUserId(currentUserId);
        
        Screener savedScreener = screenerRepository.save(screener);
        log.info("Created screener with ID: {}", savedScreener.getScreenerId());
        
        return screenerMapper.toResponse(savedScreener);
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
        
        return screenerMapper.toResponse(screener);
    }

    /**
     * Updates a screener (owner only).
     */
    public ScreenerResp updateScreener(Long screenerId, ScreenerCreateReq request) {
        log.info("Updating screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByScreenerIdAndOwnerUserId(screenerId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("Screener not found or access denied: " + screenerId));
        
        screenerMapper.updateEntity(request, screener);
        Screener savedScreener = screenerRepository.save(screener);
        
        log.info("Updated screener: {}", screenerId);
        return screenerMapper.toResponse(savedScreener);
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
        
        Long currentUserId = currentUserService.getCurrentUserId();
        
        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            if (sortParts.length == 2) {
                Sort.Direction direction = "desc".equalsIgnoreCase(sortParts[1]) ? 
                    Sort.Direction.DESC : Sort.Direction.ASC;
                sortObj = Sort.by(direction, sortParts[0]);
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Screener> screeners = screenerRepository.findByOwnerUserIdOrIsPublicTrueWithSearch(
                currentUserId, search, pageable);
        
        List<ScreenerResp> content = screeners.getContent().stream()
                .map(screenerMapper::toResponse)
                .toList();
        
        return PageResp.<ScreenerResp>builder()
                .content(content)
                .page(screeners.getNumber())
                .size(screeners.getSize())
                .totalElements(screeners.getTotalElements())
                .totalPages(screeners.getTotalPages())
                .sort(sort)
                .build();
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
                .map(screenerMapper::toResponse)
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
                .map(screenerMapper::toResponse)
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
