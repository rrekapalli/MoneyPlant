package com.moneyplant.stock.repositories;

import com.moneyplant.stock.entities.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, String> {
}
