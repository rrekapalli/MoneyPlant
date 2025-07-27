package com.moneyplant.stock.repositories;

import com.moneyplant.stock.entities.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, String> {
    Optional<Stock> findBySymbolIgnoreCase(String symbol);
}
