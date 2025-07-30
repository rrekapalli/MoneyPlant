package com.moneyplant.core.repositories;

import com.moneyplant.core.entities.NseStockTick;
import org.springframework.data.jpa.repository.JpaRepository;
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
     * Find all stock ticks by identifier (index name) ordered by symbol ascending.
     *
     * @param identifier the identifier (index name) to search for
     * @return a list of stock ticks matching the given identifier, ordered by symbol ascending
     */
    List<NseStockTick> findAllByIdentifierOrderBySymbolAsc(String identifier);

}