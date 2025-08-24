package com.moneyplant.portfolio.repositories;

import com.moneyplant.core.entities.PortfolioMetricsDaily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PortfolioMetricsDailyRepository extends JpaRepository<PortfolioMetricsDaily, Long> {
    List<PortfolioMetricsDaily> findByPortfolio_Id(Long portfolioId);
    List<PortfolioMetricsDaily> findByPortfolio_IdAndDateBetween(Long portfolioId, LocalDate start, LocalDate end);
}
