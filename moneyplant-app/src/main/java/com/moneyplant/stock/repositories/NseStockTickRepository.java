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

    /**
     * Find enriched stock ticks by index with additional fields from nse_equity_master.
     * Returns comprehensive stock data including basic_industry, pd_sector_ind, macro, sector, and company_name.
     *
     * @param selectedIndex the sector index to search for
     * @return a list of enriched stock tick data matching the given index
     */
    @Query(value = "SELECT " +
            "t.symbol, t.priority, t.identifier, t.series, t.open_price, t.day_high, t.day_low, " +
            "t.last_price, t.previous_close, t.price_change, t.percent_change, t.total_traded_volume, " +
            "t.stock_ind_close_price, t.total_traded_value, t.year_high, t.ffmc, t.year_low, " +
            "t.near_week_high, t.near_week_low, t.percent_change_365d, t.date_365d_ago, t.chart_365d_path, " +
            "t.date_30d_ago, t.percent_change_30d, t.chart_30d_path, t.chart_today_path, t.company_name, " +
            "t.industry, t.is_fno_sec, t.is_ca_sec, t.is_slb_sec, t.is_debt_sec, t.is_suspended, " +
            "t.is_etf_sec, t.is_delisted, t.isin, t.slb_isin, t.listing_date, t.is_municipal_bond, " +
            "t.is_hybrid_symbol, t.equity_time, t.pre_open_time, t.quote_pre_open_flag, t.created_at, " +
            "t.updated_at, qe.basic_industry, qe.pd_sector_ind, qe.macro, qe.sector " +
            "FROM nse_stock_tick t " +
            "LEFT JOIN nse_equity_sector_index si ON t.symbol = si.symbol " +
            "LEFT JOIN nse_equity_master qe ON t.symbol = qe.symbol " +
            "WHERE si.pd_sector_index = :selectedIndex", 
            nativeQuery = true)
    List<Object[]> getStockTicksByIndex(@Param("selectedIndex") String selectedIndex);

}