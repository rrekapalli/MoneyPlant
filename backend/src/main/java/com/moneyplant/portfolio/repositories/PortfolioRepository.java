package com.moneyplant.portfolio.repositories;

import com.moneyplant.core.entities.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
}
