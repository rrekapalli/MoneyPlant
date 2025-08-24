package com.moneyplant.portfolio.repositories;

import com.moneyplant.core.entities.PortfolioHolding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, Long> {
    List<PortfolioHolding> findByPortfolio_Id(Long portfolioId);
    List<PortfolioHolding> findByPortfolio_IdAndSymbol_Symbol(Long portfolioId, String symbol);
}
