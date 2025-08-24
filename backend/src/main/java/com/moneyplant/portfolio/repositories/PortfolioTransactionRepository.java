package com.moneyplant.portfolio.repositories;

import com.moneyplant.core.entities.PortfolioTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PortfolioTransactionRepository extends JpaRepository<PortfolioTransaction, Long> {
    List<PortfolioTransaction> findByPortfolio_Id(Long portfolioId);
    List<PortfolioTransaction> findByPortfolio_IdAndTradeDateBetween(Long portfolioId, LocalDate start, LocalDate end);
    List<PortfolioTransaction> findByPortfolio_IdAndSymbol_Symbol(Long portfolioId, String symbol);
}
