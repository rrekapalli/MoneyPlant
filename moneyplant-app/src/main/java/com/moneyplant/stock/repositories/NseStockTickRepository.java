package com.moneyplant.stock.repositories;

import com.moneyplant.core.entities.NseStockTick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for NseStockTick entity.
 * Provides methods to interact with the nse_stock_tick table in the database.
 */
@Repository
public interface NseStockTickRepository extends JpaRepository<NseStockTick, String> {

    /**
     * Find all stock ticks ordered by priority.
     *
     * @return a list of stock ticks ordered by priority
     */
    List<NseStockTick> findAllByOrderByPriorityAsc();

    /**
     * Find all stock ticks by identifier (index name) using Trino query with joins, ordered by symbol ascending.
     *
     * @param selectedIndexName the identifier (index name) to search for
     * @return a list of stock ticks matching the given identifier, ordered by symbol ascending
     */
    @Query(value = "SELECT t.* FROM nse_stock_tick t " +
            "LEFT JOIN nse_equity_sector_index si ON t.symbol = si.symbol " +
            "LEFT JOIN nse_equity_master qe ON t.symbol = qe.symbol " +
            "WHERE si.pd_sector_index = :selectedIndexName " +
            "ORDER BY t.symbol ASC", 
            nativeQuery = true)
    List<NseStockTick> findAllByIdentifierOrderBySymbolAsc(@Param("selectedIndexName") String selectedIndexName);

}