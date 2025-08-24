package com.moneyplant.portfolio.repositories;

import com.moneyplant.core.entities.PortfolioBenchmark;
import com.moneyplant.core.entities.PortfolioBenchmarkId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioBenchmarkRepository extends JpaRepository<PortfolioBenchmark, PortfolioBenchmarkId> {
    List<PortfolioBenchmark> findByPortfolio_Id(Long portfolioId);
}
