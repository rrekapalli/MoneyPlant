package com.moneyplant.portfolio.repositories;

import com.moneyplant.core.entities.PortfolioCashFlow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PortfolioCashFlowRepository extends JpaRepository<PortfolioCashFlow, Long> {
    List<PortfolioCashFlow> findByPortfolio_Id(Long portfolioId);
    List<PortfolioCashFlow> findByPortfolio_IdAndFlowDateBetween(Long portfolioId, LocalDate start, LocalDate end);
}
