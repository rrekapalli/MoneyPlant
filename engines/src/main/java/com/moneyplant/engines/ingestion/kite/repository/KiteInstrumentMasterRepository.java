package com.moneyplant.engines.ingestion.kite.repository;

import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMaster;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMasterId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for KiteInstrumentMaster entity.
 * Provides CRUD operations and custom queries for instrument master data.
 */
@Repository
public interface KiteInstrumentMasterRepository extends JpaRepository<KiteInstrumentMaster, KiteInstrumentMasterId> {
    
    /**
     * Find instruments by trading symbol.
     * @param tradingsymbol The trading symbol to search for
     * @return List of matching instruments
     */
    List<KiteInstrumentMaster> findByTradingsymbol(String tradingsymbol);
    
    /**
     * Find instruments by trading symbol (case-insensitive).
     * @param tradingsymbol The trading symbol to search for
     * @return List of matching instruments
     */
    List<KiteInstrumentMaster> findByTradingsymbolIgnoreCase(String tradingsymbol);
    
    /**
     * Find instruments by exchange.
     * @param exchange The exchange code
     * @return List of instruments for the exchange
     */
    List<KiteInstrumentMaster> findByExchange(String exchange);
    
    /**
     * Find instruments by instrument type.
     * @param instrumentType The instrument type (e.g., EQ, FUT, OPT)
     * @return List of instruments of the specified type
     */
    List<KiteInstrumentMaster> findByInstrumentType(String instrumentType);
    
    /**
     * Find instruments by exchange and instrument type.
     * @param exchange The exchange code
     * @param instrumentType The instrument type
     * @return List of matching instruments
     */
    List<KiteInstrumentMaster> findByExchangeAndInstrumentType(String exchange, String instrumentType);
    
    /**
     * Count instruments by instrument token (for checking existence).
     * @param instrumentTokens List of instrument tokens
     * @return Count of instruments
     */
    long countByInstrumentTokenIn(List<String> instrumentTokens);
    
    /**
     * Find instruments by list of instrument tokens.
     * @param instrumentTokens List of instrument tokens
     * @return List of matching instruments
     */
    List<KiteInstrumentMaster> findByInstrumentTokenIn(List<String> instrumentTokens);
    
    /**
     * Search instruments by trading symbol pattern.
     * @param pattern The search pattern (use % for wildcard)
     * @return List of matching instruments
     */
    @Query("SELECT k FROM KiteInstrumentMaster k WHERE k.tradingsymbol LIKE :pattern")
    List<KiteInstrumentMaster> searchByTradingsymbolPattern(@Param("pattern") String pattern);
    
    /**
     * Get count of instruments grouped by exchange.
     * @return List of Object arrays [exchange, count]
     */
    @Query("SELECT k.exchange, COUNT(k) FROM KiteInstrumentMaster k GROUP BY k.exchange")
    List<Object[]> countByExchange();
    
    /**
     * Get count of instruments grouped by instrument type.
     * @return List of Object arrays [instrumentType, count]
     */
    @Query("SELECT k.instrumentType, COUNT(k) FROM KiteInstrumentMaster k GROUP BY k.instrumentType")
    List<Object[]> countByInstrumentType();
}
