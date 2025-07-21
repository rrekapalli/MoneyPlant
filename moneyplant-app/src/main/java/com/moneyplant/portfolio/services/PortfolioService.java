package com.moneyplant.portfolio.services;

import com.moneyplant.portfolio.dtos.PortfolioDto;
import com.moneyplant.portfolio.dtos.PortfolioResponseDto;
import com.moneyplant.portfolio.entities.Portfolio;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.portfolio.repositories.PortfolioRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;

    private static final String PORTFOLIO_SERVICE = "portfolioService";

    /**
     * Creates a new portfolio using the annotation-based circuit breaker approach.
     * 
     * @param portfolioDto The portfolio data to create
     * @return The created portfolio response
     * @throws ServiceException if there is an error creating the portfolio
     */
    @CircuitBreaker(name = PORTFOLIO_SERVICE, fallbackMethod = "createPortfolioFallback")
    public PortfolioResponseDto createPortfolio(PortfolioDto portfolioDto) {
        try {
            // Convert DTO to entity manually
            Portfolio newPortfolio = new Portfolio();
            newPortfolio.setName(portfolioDto.getName());
            newPortfolio.setDescription(portfolioDto.getDescription());

            // Save the entity
            portfolioRepository.save(newPortfolio);

            log.info("Portfolio created successfully!");

            // Convert entity to response DTO manually
            return new PortfolioResponseDto(
                newPortfolio.getId(),
                newPortfolio.getName(),
                newPortfolio.getDescription()
            );
        } catch (Exception e) {
            log.error("Error creating portfolio: {}", e.getMessage());
            throw new ServiceException("Error creating portfolio: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback method for createPortfolio when the circuit is open.
     * 
     * @param portfolioDto The portfolio data that was being created
     * @param e The exception that triggered the fallback
     * @return null
     */
    public PortfolioResponseDto createPortfolioFallback(PortfolioDto portfolioDto, Exception e) {
        log.error("Circuit breaker triggered for createPortfolio: {}", e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Gets all portfolios using the annotation-based circuit breaker approach.
     * 
     * @return List of portfolio responses
     * @throws ServiceException if there is an error retrieving portfolios
     */
    @CircuitBreaker(name = PORTFOLIO_SERVICE, fallbackMethod = "getAllPortfoliosFallback")
    public List<PortfolioResponseDto> getAllPortfolios() {
        try {
            return portfolioRepository.findAll()
                    .stream()
                    .map(portfolio -> new PortfolioResponseDto(
                        portfolio.getId(),
                        portfolio.getName(),
                        portfolio.getDescription()
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("Error retrieving portfolios: {}", e.getMessage());
            throw new ServiceException("Error retrieving portfolios: " + e.getMessage(), e);
        }
    }

    /**
     * Gets a portfolio by ID.
     * 
     * @param id The ID of the portfolio to retrieve
     * @return The portfolio response
     * @throws ResourceNotFoundException if the portfolio is not found
     * @throws ServiceException if there is an error retrieving the portfolio
     */
    @CircuitBreaker(name = PORTFOLIO_SERVICE, fallbackMethod = "getPortfolioByIdFallback")
    public PortfolioResponseDto getPortfolioById(String id) {
        try {
            Portfolio portfolio = portfolioRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + id));

            return new PortfolioResponseDto(
                portfolio.getId(),
                portfolio.getName(),
                portfolio.getDescription()
            );
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving portfolio with id {}: {}", id, e.getMessage());
            throw new ServiceException("Error retrieving portfolio: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback method for getAllPortfolios when the circuit is open.
     * 
     * @param e The exception that triggered the fallback
     * @return An empty list of portfolios
     */
    public List<PortfolioResponseDto> getAllPortfoliosFallback(Exception e) {
        log.error("Circuit breaker triggered for getAllPortfolios: {}", e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Fallback method for getPortfolioById when the circuit is open.
     * 
     * @param id The ID of the portfolio that was being retrieved
     * @param e The exception that triggered the fallback
     * @return null
     */
    public PortfolioResponseDto getPortfolioByIdFallback(String id, Exception e) {
        log.error("Circuit breaker triggered for getPortfolioById with id {}: {}", id, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }
}
