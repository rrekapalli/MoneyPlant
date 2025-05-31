package com.moneyplant.portfolioservice.repositories;

import com.moneyplant.portfolioservice.entities.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, String> {
}
