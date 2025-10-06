package com.moneyplant.stock.repositories;

import com.moneyplant.core.entities.NseEquityHistoricData;
import com.moneyplant.core.entities.NseEquityHistoricDataId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NseEquityHistoricDataRepository extends JpaRepository<NseEquityHistoricData, NseEquityHistoricDataId> {

    Optional<NseEquityHistoricData> findFirstById_SymbolOrderById_DateDesc(String symbol);
}
