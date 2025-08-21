package com.moneyplant.stock.repositories;

import com.moneyplant.core.entities.NseStockTick;
import com.moneyplant.stock.dtos.EnrichedStockTickDto;
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
     * Find all stock ticks by identifier (index name) using a Trino query with joins, ordered by symbol ascending.
     *
     * @param selectedIndexName the identifier (index name) to search for
     * @return a list of stock ticks matching the given identifier, ordered by symbol ascending
     */
    @Query(value = "SELECT t.* " +
            "FROM nse_eq_ohlcv_historic t " +
            "LEFT JOIN nse_eq_sector_index si ON t.symbol = si.symbol " +
            "LEFT JOIN nse_eq_master qe ON t.symbol = qe.symbol " +
            "WHERE si.pd_sector_index = :selectedIndexName " +
            "ORDER BY t.symbol ASC", 
            nativeQuery = true)
    List<NseStockTick> findAllByIdentifierOrderBySymbolAsc(@Param("selectedIndexName") String selectedIndexName);

    /**
     * Find enriched stock ticks by index with additional fields from nse_equity_master.
     * Returns comprehensive stock data including basic_industry, pd_sector_ind, macro, sector, and company_name.
     *
     * @param selectedIndex the sector index to search for
     * @return a list of enriched stock tick data matching the given index
     */
    @Query(value = "SELECT t.*, (t.close - t.open) as price_change, ((t.close - t.open) / t.open) * 100.0 as percent_change" +
            ", qe.basic_industry, qe.pd_sector_ind, qe.macro, qe.sector " +
            "FROM nse_eq_ohlcv_historic t " +
            "LEFT JOIN nse_eq_sector_index si ON t.symbol = si.symbol " +
            "LEFT JOIN nse_eq_master qe ON t.symbol = qe.symbol " +
            "JOIN (SELECT symbol, MAX(date) AS max_date FROM nse_eq_ohlcv_historic GROUP BY symbol) latest " +
            "ON latest.symbol = t.symbol AND latest.max_date = t.date " +
            "WHERE si.pd_sector_index = :selectedIndex " +
            "ORDER BY t.symbol ASC", 
            nativeQuery = true)
    List<java.util.Map<String, Object>> getStockTicksByIndex(@Param("selectedIndex") String selectedIndex);

}