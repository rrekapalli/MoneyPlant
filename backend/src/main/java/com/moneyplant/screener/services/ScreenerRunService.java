package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.PageResp;
import com.moneyplant.screener.dtos.RunCreateReq;
import com.moneyplant.screener.dtos.RunResp;
import com.moneyplant.screener.entities.ScreenerRun;
import com.moneyplant.screener.mappers.RunMapper;
import com.moneyplant.screener.repositories.ScreenerRunRepository;
import com.moneyplant.screener.repositories.ScreenerVersionRepository;
import com.moneyplant.screener.repositories.ScreenerParamsetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing screener runs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerRunService {

    private final ScreenerRunRepository screenerRunRepository;
    private final ScreenerVersionRepository screenerVersionRepository;
    private final ScreenerParamsetRepository screenerParamsetRepository;
    private final RunMapper runMapper;
    private final CurrentUserService currentUserService;
    
    @Qualifier("noopRunExecutor")
    private final RunExecutor runExecutor;

    /**
     * Creates a new screener run.
     */
    public RunResp createRun(Long screenerId, RunCreateReq request) {
        log.info("Creating run for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        
        // Validate screener version
        var version = screenerVersionRepository.findById(request.getScreenerVersionId())
                .orElseThrow(() -> new RuntimeException("Screener version not found: " + request.getScreenerVersionId()));
        
        if (!version.getScreener().getScreenerId().equals(screenerId)) {
            throw new RuntimeException("Screener version does not belong to screener: " + screenerId);
        }
        
        // Validate paramset if provided
        if (request.getParamsetId() != null) {
            var paramset = screenerParamsetRepository.findById(request.getParamsetId())
                    .orElseThrow(() -> new RuntimeException("Parameter set not found: " + request.getParamsetId()));
            
            if (!paramset.getScreenerVersion().getScreenerVersionId().equals(request.getScreenerVersionId())) {
                throw new RuntimeException("Parameter set does not belong to screener version: " + request.getScreenerVersionId());
            }
        }
        
        // Create run entity
        ScreenerRun run = ScreenerRun.builder()
                .screener(version.getScreener())
                .screenerVersion(version)
                .triggeredByUserId(currentUserId)
                .paramset(request.getParamsetId() != null ? 
                    screenerParamsetRepository.findById(request.getParamsetId()).orElse(null) : null)
                .paramsJson(request.getParamsJson())
                .universeSnapshot(request.getUniverseSymbolIds())
                .runForTradingDay(request.getRunForTradingDay() != null ? 
                    request.getRunForTradingDay() : LocalDate.now())
                .status("running")
                .build();
        
        ScreenerRun savedRun = screenerRunRepository.save(run);
        
        // Execute run asynchronously (for now, synchronously)
        try {
            runExecutor.executeRun(savedRun);
            screenerRunRepository.save(savedRun);
        } catch (Exception e) {
            log.error("Error executing run: {}", e.getMessage(), e);
            savedRun.setStatus("failed");
            savedRun.setErrorMessage(e.getMessage());
            screenerRunRepository.save(savedRun);
        }
        
        log.info("Created run: {}", savedRun.getScreenerRunId());
        return runMapper.toResponse(savedRun);
    }

    /**
     * Gets a run by ID.
     */
    @Transactional(readOnly = true)
    public RunResp getRun(Long runId) {
        log.info("Getting run: {}", runId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerRun run = screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        return runMapper.toResponse(run);
    }

    /**
     * Lists runs for a screener.
     */
    @Transactional(readOnly = true)
    public PageResp<RunResp> listRuns(Long screenerId, int page, int size) {
        log.info("Listing runs for screener: {}, page: {}, size: {}", screenerId, page, size);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        // Check if user has access to screener
        // This would need to be implemented based on your access control logic
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startedAt"));
        Page<ScreenerRun> runs = screenerRunRepository.findByScreenerScreenerIdOrderByStartedAtDesc(screenerId, pageable);
        
        List<RunResp> content = runs.getContent().stream()
                .map(runMapper::toResponse)
                .toList();
        
        return PageResp.<RunResp>builder()
                .content(content)
                .page(runs.getNumber())
                .size(runs.getSize())
                .totalElements(runs.getTotalElements())
                .totalPages(runs.getTotalPages())
                .sort("startedAt,desc")
                .build();
    }

    /**
     * Retries a failed run.
     */
    public RunResp retryRun(Long runId) {
        log.info("Retrying run: {}", runId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        ScreenerRun run = screenerRunRepository.findByIdAndScreenerOwner(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found or access denied: " + runId));
        
        if (!"failed".equals(run.getStatus())) {
            throw new RuntimeException("Can only retry failed runs");
        }
        
        // Reset run status
        run.setStatus("running");
        run.setFinishedAt(null);
        run.setErrorMessage(null);
        run.setTotalCandidates(null);
        run.setTotalMatches(null);
        
        ScreenerRun savedRun = screenerRunRepository.save(run);
        
        // Execute run
        try {
            runExecutor.executeRun(savedRun);
            screenerRunRepository.save(savedRun);
        } catch (Exception e) {
            log.error("Error retrying run: {}", e.getMessage(), e);
            savedRun.setStatus("failed");
            savedRun.setErrorMessage(e.getMessage());
            screenerRunRepository.save(savedRun);
        }
        
        log.info("Retried run: {}", runId);
        return runMapper.toResponse(savedRun);
    }

    /**
     * Gets the latest successful run for a screener.
     */
    @Transactional(readOnly = true)
    public Optional<RunResp> getLatestSuccessfulRun(Long screenerId) {
        log.info("Getting latest successful run for screener: {}", screenerId);
        
        Long currentUserId = currentUserService.getCurrentUserId();
        // Check if user has access to screener
        
        return screenerRunRepository.findLatestSuccessfulRun(screenerId)
                .map(runMapper::toResponse);
    }

    /**
     * Gets runs by status.
     */
    @Transactional(readOnly = true)
    public List<RunResp> getRunsByStatus(String status) {
        log.info("Getting runs by status: {}", status);
        
        List<ScreenerRun> runs = screenerRunRepository.findByStatusOrderByStartedAtDesc(status);
        
        return runs.stream()
                .map(runMapper::toResponse)
                .toList();
    }

    /**
     * Gets runs by user.
     */
    @Transactional(readOnly = true)
    public List<RunResp> getRunsByUser(Long userId) {
        log.info("Getting runs by user: {}", userId);
        
        List<ScreenerRun> runs = screenerRunRepository.findByTriggeredByUserIdOrderByStartedAtDesc(userId);
        
        return runs.stream()
                .map(runMapper::toResponse)
                .toList();
    }
}
