package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerResult;
import com.moneyplant.screener.entities.ScreenerResultId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository for ScreenerResult entity with custom queries.
 */
@Repository
public interface ScreenerResultRepository extends JpaRepository<ScreenerResult, ScreenerResultId> {

    /**
     * Finds results by run ID with pagination and filters.
     */
    @Query("SELECT sr FROM ScreenerResult sr WHERE sr.screenerRun.screenerRunId = :runId " +
           "AND (:matched IS NULL OR sr.matched = :matched) " +
           "AND (:minScore IS NULL OR sr.score0To1 >= :minScore) " +
           "AND (:symbolId IS NULL OR sr.symbol = :symbolId) " +
           "ORDER BY " +
           "CASE WHEN :sortBy = 'rank' THEN sr.rankInRun END ASC NULLS LAST, " +
           "CASE WHEN :sortBy = 'score' THEN sr.score0To1 END DESC NULLS LAST, " +
           "sr.symbol ASC")
    Page<ScreenerResult> findByRunIdWithFilters(
            @Param("runId") Long runId,
            @Param("matched") Boolean matched,
            @Param("minScore") BigDecimal minScore,
            @Param("symbolId") String symbolId,
            @Param("sortBy") String sortBy,
            Pageable pageable);

    /**
     * Finds results by run ID.
     */
    List<ScreenerResult> findByScreenerRunScreenerRunIdOrderByRankInRunAsc(Long runId);

    /**
     * Finds matched results by run ID.
     */
    List<ScreenerResult> findByScreenerRunScreenerRunIdAndMatchedTrueOrderByRankInRunAsc(Long runId);

    /**
     * Finds results by run ID and symbol.
     */
    Optional<ScreenerResult> findByScreenerRunScreenerRunIdAndSymbol(Long runId, String symbol);

    /**
     * Counts results by run ID.
     */
    long countByScreenerRunScreenerRunId(Long runId);

    /**
     * Counts matched results by run ID.
     */
    long countByScreenerRunScreenerRunIdAndMatchedTrue(Long runId);

    /**
     * Finds top results by run ID.
     */
    @Query("SELECT sr FROM ScreenerResult sr WHERE sr.screenerRun.screenerRunId = :runId " +
           "ORDER BY sr.rankInRun ASC NULLS LAST, sr.score0To1 DESC NULLS LAST")
    List<ScreenerResult> findTopResultsByRunId(@Param("runId") Long runId, Pageable pageable);

    /**
     * Finds results by run ID and minimum score.
     */
    List<ScreenerResult> findByScreenerRunScreenerRunIdAndScore0To1GreaterThanEqualOrderByScore0To1Desc(
            Long runId, BigDecimal minScore);
}
