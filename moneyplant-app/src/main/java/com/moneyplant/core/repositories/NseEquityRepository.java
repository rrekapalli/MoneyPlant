package com.moneyplant.core.repositories;

import com.moneyplant.core.entities.NseEquity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NseEquityRepository extends JpaRepository<NseEquity, String> {
    Optional<NseEquity> findBySymbolIgnoreCase(String symbol);
}