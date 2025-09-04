package com.moneyplant.screener.services;

import com.moneyplant.screener.entities.Screener;
import com.moneyplant.screener.entities.ScreenerStar;
import com.moneyplant.screener.repositories.ScreenerRepository;
import com.moneyplant.screener.repositories.ScreenerStarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing screener stars.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerStarService {

    private final ScreenerStarRepository screenerStarRepository;
    private final ScreenerRepository screenerRepository;
    private final CurrentUserService currentUserService;

    /**
     * Toggles star status for a screener.
     */
    public boolean toggleStar(Long screenerId, boolean starred) {
        log.info("Toggling star for screener: {}, starred: {}", screenerId, starred);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByIdAndOwnerOrPublic(screenerId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener not found: " + screenerId));
        
        Optional<ScreenerStar> existingStar = screenerStarRepository.findByScreenerScreenerIdAndUserId(screenerId, currentUserId);
        
        if (starred && existingStar.isEmpty()) {
            // Add star
            ScreenerStar star = ScreenerStar.builder()
                    .screener(screener)
                    .userId(currentUserId)
                    .build();
            screenerStarRepository.save(star);
            log.info("Added star for screener: {}", screenerId);
            return true;
        } else if (!starred && existingStar.isPresent()) {
            // Remove star
            screenerStarRepository.delete(existingStar.get());
            log.info("Removed star for screener: {}", screenerId);
            return false;
        }
        
        return existingStar.isPresent();
    }

    /**
     * Checks if user has starred a screener.
     */
    @Transactional(readOnly = true)
    public boolean isStarred(Long screenerId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        return screenerStarRepository.existsByScreenerScreenerIdAndUserId(screenerId, currentUserId);
    }

    /**
     * Gets users who starred a screener (owner only).
     */
    @Transactional(readOnly = true)
    public List<Long> getStarredUsers(Long screenerId) {
        log.info("Getting starred users for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        Screener screener = screenerRepository.findByScreenerIdAndOwnerUserId(screenerId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener not found or access denied: " + screenerId));
        
        List<ScreenerStar> stars = screenerStarRepository.findByScreenerScreenerIdOrderByCreatedAtDesc(screenerId);
        
        return stars.stream()
                .map(ScreenerStar::getUserId)
                .toList();
    }

    /**
     * Gets starred screeners for current user.
     */
    @Transactional(readOnly = true)
    public List<Screener> getStarredScreeners() {
        log.info("Getting starred screeners for current user");
        
        Long currentUserId = currentUserService.getCurrentUserId();
        List<ScreenerStar> stars = screenerStarRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
        
        return stars.stream()
                .map(ScreenerStar::getScreener)
                .toList();
    }

    /**
     * Gets star count for a screener.
     */
    @Transactional(readOnly = true)
    public long getStarCount(Long screenerId) {
        return screenerStarRepository.countByScreenerScreenerId(screenerId);
    }

    /**
     * Gets star count for current user.
     */
    @Transactional(readOnly = true)
    public long getMyStarCount() {
        Long currentUserId = currentUserService.getCurrentUserId();
        return screenerStarRepository.countByUserId(currentUserId);
    }
}
