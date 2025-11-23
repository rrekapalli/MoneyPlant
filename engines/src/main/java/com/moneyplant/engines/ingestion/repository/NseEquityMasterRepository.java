package com.moneyplant.engines.ingestion.repository;

import com.moneyplant.engines.common.entities.NseEquityMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for NSE Equity Master data operations.
 * Uses existing NseEquityMaster entity from com.moneyplant.core.entities.
 * 
 * Requirements: 7.3, 7.6
 */
@Repository
public interface NseEquityMasterRepository extends JpaRepository<NseEquityMaster, String> {
    
    /**
     * Find all symbols by sector
     */
    List<NseEquityMaster> findBySector(String sector);
    
    /**
     * Find all symbols by industry
     */
    List<NseEquityMaster> findByIndustry(String industry);
    
    /**
     * Find all symbols by trading status
     */
    List<NseEquityMaster> findByTradingStatus(String tradingStatus);
    
    /**
     * Find all symbols by status (Listed, Suspended, etc.)
     * Using IgnoreCase to ensure case-insensitive matching
     */
    List<NseEquityMaster> findByStatusIgnoreCase(String status);
    
    /**
     * Find all symbols by sector and trading status
     */
    List<NseEquityMaster> findBySectorAndTradingStatus(String sector, String tradingStatus);
    
    /**
     * Find all FNO (Futures & Options) eligible stocks
     * Uses is_fno_sec field and status = 'Listed'
     */
    @Query("SELECT e FROM NseEquityMaster e WHERE e.isFnoSec = 'True' AND e.status = 'Listed'")
    List<NseEquityMaster> findFnoEligibleStocks();
    
    /**
     * Find all symbols in Nifty 50 index
     * Uses pd_sector_ind field and status = 'Listed'
     */
    @Query("SELECT e FROM NseEquityMaster e WHERE e.pdSectorInd = 'NIFTY 50' AND e.status = 'Listed'")
    List<NseEquityMaster> findNifty50Symbols();
    
    /**
     * Find all symbols in Nifty Bank index
     */
    @Query("SELECT e FROM NseEquityMaster e WHERE e.pdSectorInd = 'NIFTY BANK' AND e.status = 'Listed'")
    List<NseEquityMaster> findNiftyBankSymbols();
    
    /**
     * Find all symbols in a specific index by pd_sector_ind
     */
    @Query("SELECT e FROM NseEquityMaster e WHERE e.pdSectorInd = :indexName AND e.status = 'Listed'")
    List<NseEquityMaster> findByIndex(@Param("indexName") String indexName);
}
