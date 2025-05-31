package com.moneyplant.stockservice.repositories;

import com.moneyplant.stockservice.entities.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, String> {
}
