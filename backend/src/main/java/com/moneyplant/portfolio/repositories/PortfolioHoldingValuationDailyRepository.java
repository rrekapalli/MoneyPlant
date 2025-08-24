package com.moneyplant.portfolio.repositories;

import com.moneyplant.core.entities.PortfolioHoldingValuationDaily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PortfolioHoldingValuationDailyRepository extends JpaRepository<PortfolioHoldingValuationDaily, Long> {
    List<PortfolioHoldingValuationDaily> findByPortfolio_Id(Long portfolioId);
    List<PortfolioHoldingValuationDaily> findByPortfolio_IdAndDateBetween(Long portfolioId, LocalDate start, LocalDate end);
    List<PortfolioHoldingValuationDaily> findByPortfolio_IdAndSymbol_Symbol(Long portfolioId, String symbol);
}
