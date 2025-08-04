package com.moneyplant.stock.repositories;

import com.moneyplant.core.entities.NseEquityMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<NseEquityMaster, String> {
    Optional<NseEquityMaster> findBySymbolIgnoreCase(String symbol);
    List<NseEquityMaster> findByIndustryIgnoreCase(String industry);
    List<NseEquityMaster> findByPdSectorIndIgnoreCase(String pdSectorInd);
    List<NseEquityMaster> findByIndustryIgnoreCaseOrPdSectorIndIgnoreCase(String industry, String pdSectorInd);
}
