package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerResultDiff;
import com.moneyplant.screener.entities.ScreenerResultDiffId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ScreenerResultDiff entity with custom queries.
 */
@Repository
public interface ScreenerResultDiffRepository extends JpaRepository<ScreenerResultDiff, ScreenerResultDiffId> {

    /**
     * Finds diffs by run ID.
     */
    List<ScreenerResultDiff> findByScreenerRunScreenerRunIdOrderByNewRankAsc(Long runId);

    /**
     * Finds diffs by run ID and change type.
     */
    List<ScreenerResultDiff> findByScreenerRunScreenerRunIdAndChangeTypeOrderByNewRankAsc(
            Long runId, String changeType);

    /**
     * Finds diffs by previous run ID.
     */
    List<ScreenerResultDiff> findByPrevScreenerRunScreenerRunIdOrderByNewRankAsc(Long prevRunId);

    /**
     * Finds diffs by symbol.
     */
    List<ScreenerResultDiff> findBySymbolOrderByScreenerRunStartedAtDesc(String symbol);

    /**
     * Counts diffs by run ID.
     */
    long countByScreenerRunScreenerRunId(Long runId);

    /**
     * Counts diffs by run ID and change type.
     */
    long countByScreenerRunScreenerRunIdAndChangeType(Long runId, String changeType);

    /**
     * Finds diffs by run ID with pagination.
     */
    @Query("SELECT srd FROM ScreenerResultDiff srd WHERE srd.screenerRun.screenerRunId = :runId " +
           "ORDER BY srd.newRank ASC NULLS LAST, srd.symbol ASC")
    List<ScreenerResultDiff> findByRunIdWithPagination(@Param("runId") Long runId, 
                                                       org.springframework.data.domain.Pageable pageable);
}
