package com.moneyplant.screener.services;

import com.moneyplant.screener.dtos.PageResp;
import com.moneyplant.screener.dtos.ResultDiffResp;
import com.moneyplant.screener.dtos.ResultResp;
import com.moneyplant.screener.entities.ScreenerResult;
import com.moneyplant.screener.entities.ScreenerResultDiff;
import com.moneyplant.screener.mappers.ResultMapper;
import com.moneyplant.screener.repositories.ScreenerResultDiffRepository;
import com.moneyplant.screener.repositories.ScreenerResultRepository;
import com.moneyplant.screener.repositories.ScreenerRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service for managing screener results.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScreenerResultService {

    private final ScreenerResultRepository screenerResultRepository;
    private final ScreenerResultDiffRepository screenerResultDiffRepository;
    private final ScreenerRunRepository screenerRunRepository;
    private final ResultMapper resultMapper;
    private final CurrentUserService currentUserService;

    /**
     * Gets paged results for a run with filters.
     */
    @Transactional(readOnly = true)
    public PageResp<ResultResp> getResults(Long runId, Boolean matched, BigDecimal minScore, 
                                          String symbolId, int page, int size, String sort) {
        log.info("Getting results for run: {}, matched: {}, minScore: {}, symbolId: {}", 
                runId, matched, minScore, symbolId);
        
        // Validate run access
        Long currentUserId = currentUserService.getCurrentUserId();
        screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        // Determine sort field
        String sortBy = "rank";
        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            if (sortParts.length > 0) {
                sortBy = sortParts[0];
            }
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ScreenerResult> results = screenerResultRepository.findByRunIdWithFilters(
                runId, matched, minScore, symbolId, sortBy, pageable);
        
        List<ResultResp> content = results.getContent().stream()
                .map(resultMapper::toResponse)
                .toList();
        
        return PageResp.<ResultResp>builder()
                .content(content)
                .page(results.getNumber())
                .size(results.getSize())
                .totalElements(results.getTotalElements())
                .totalPages(results.getTotalPages())
                .sort(sort)
                .build();
    }

    /**
     * Gets all results for a run.
     */
    @Transactional(readOnly = true)
    public List<ResultResp> getAllResults(Long runId) {
        log.info("Getting all results for run: {}", runId);
        
        // Validate run access
        Long currentUserId = currentUserService.getCurrentUserId();
        screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        List<ScreenerResult> results = screenerResultRepository.findByScreenerRunScreenerRunIdOrderByRankInRunAsc(runId);
        
        return results.stream()
                .map(resultMapper::toResponse)
                .toList();
    }

    /**
     * Gets matched results for a run.
     */
    @Transactional(readOnly = true)
    public List<ResultResp> getMatchedResults(Long runId) {
        log.info("Getting matched results for run: {}", runId);
        
        // Validate run access
        Long currentUserId = currentUserService.getCurrentUserId();
        screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        List<ScreenerResult> results = screenerResultRepository.findByScreenerRunScreenerRunIdAndMatchedTrueOrderByRankInRunAsc(runId);
        
        return results.stream()
                .map(resultMapper::toResponse)
                .toList();
    }

    /**
     * Gets result diffs for a run.
     */
    @Transactional(readOnly = true)
    public List<ResultDiffResp> getResultDiffs(Long runId) {
        log.info("Getting result diffs for run: {}", runId);
        
        // Validate run access
        Long currentUserId = currentUserService.getCurrentUserId();
        screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        List<ScreenerResultDiff> diffs = screenerResultDiffRepository.findByScreenerRunScreenerRunIdOrderByNewRankAsc(runId);
        
        return diffs.stream()
                .map(resultMapper::toDiffResponse)
                .toList();
    }

    /**
     * Gets result diffs by change type.
     */
    @Transactional(readOnly = true)
    public List<ResultDiffResp> getResultDiffsByChangeType(Long runId, String changeType) {
        log.info("Getting result diffs for run: {} with change type: {}", runId, changeType);
        
        // Validate run access
        Long currentUserId = currentUserService.getCurrentUserId();
        screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        List<ScreenerResultDiff> diffs = screenerResultDiffRepository.findByScreenerRunScreenerRunIdAndChangeTypeOrderByNewRankAsc(runId, changeType);
        
        return diffs.stream()
                .map(resultMapper::toDiffResponse)
                .toList();
    }

    /**
     * Gets top results for a run.
     */
    @Transactional(readOnly = true)
    public List<ResultResp> getTopResults(Long runId, int limit) {
        log.info("Getting top {} results for run: {}", limit, runId);
        
        // Validate run access
        Long currentUserId = currentUserService.getCurrentUserId();
        screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        Pageable pageable = PageRequest.of(0, limit);
        List<ScreenerResult> results = screenerResultRepository.findTopResultsByRunId(runId, pageable);
        
        return results.stream()
                .map(resultMapper::toResponse)
                .toList();
    }

    /**
     * Gets results by minimum score.
     */
    @Transactional(readOnly = true)
    public List<ResultResp> getResultsByMinScore(Long runId, BigDecimal minScore) {
        log.info("Getting results for run: {} with min score: {}", runId, minScore);
        
        // Validate run access
        Long currentUserId = currentUserService.getCurrentUserId();
        screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        List<ScreenerResult> results = screenerResultRepository.findByScreenerRunScreenerRunIdAndScore0To1GreaterThanEqualOrderByScore0To1Desc(runId, minScore);
        
        return results.stream()
                .map(resultMapper::toResponse)
                .toList();
    }

    /**
     * Gets result statistics for a run.
     */
    @Transactional(readOnly = true)
    public ResultStats getResultStats(Long runId) {
        log.info("Getting result stats for run: {}", runId);
        
        // Validate run access
        Long currentUserId = currentUserService.getCurrentUserId();
        screenerRunRepository.findByIdAndOwnerOrPublic(runId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Screener run not found: " + runId));
        
        long totalCandidates = screenerResultRepository.countByScreenerRunScreenerRunId(runId);
        long totalMatches = screenerResultRepository.countByScreenerRunScreenerRunIdAndMatchedTrue(runId);
        
        return new ResultStats(totalCandidates, totalMatches);
    }

    /**
     * Result statistics record.
     */
    public record ResultStats(long totalCandidates, long totalMatches) {}
}
