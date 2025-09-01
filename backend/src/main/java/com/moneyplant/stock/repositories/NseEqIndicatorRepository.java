package com.moneyplant.stock.repositories;

import com.moneyplant.core.entities.NseEqIndicator;
import com.moneyplant.core.entities.NseEqIndicatorId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NseEqIndicatorRepository extends JpaRepository<NseEqIndicator, NseEqIndicatorId> {
    Optional<NseEqIndicator> findTopById_SymbolOrderById_DateDesc(String symbol);

    List<NseEqIndicator> findById_SymbolOrderById_DateDesc(String symbol, Pageable pageable);

    Optional<NseEqIndicator> findById_SymbolAndId_Date(String symbol, LocalDate date);

    @Query("select distinct e.id.symbol from NseEqIndicator e")
    List<String> findDistinctSymbols();
}
