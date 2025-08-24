package com.moneyplant.portfolio.repositories;

import com.moneyplant.core.entities.PortfolioValuationDaily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PortfolioValuationDailyRepository extends JpaRepository<PortfolioValuationDaily, Long> {
    List<PortfolioValuationDaily> findByPortfolio_Id(Long portfolioId);
    List<PortfolioValuationDaily> findByPortfolio_IdAndDateBetween(Long portfolioId, LocalDate start, LocalDate end);
}
