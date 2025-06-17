package com.moneyplant.portfolioservice.services;

import com.moneyplant.portfolioservice.dtos.PortfolioDto;
import com.moneyplant.portfolioservice.dtos.PortfolioResponseDto;
import com.moneyplant.portfolioservice.entities.Portfolio;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.portfolioservice.mappers.PortfolioMapper;
import com.moneyplant.portfolioservice.repositories.PortfolioRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final CircuitBreakerFactory circuitBreakerFactory;
    private final PortfolioMapper portfolioMapper;

    private static final String PORTFOLIO_SERVICE = "portfolioService";

    /**
     * Creates a new portfolio using the programmatic circuit breaker approach.
     * 
     * @param portfolioDto The portfolio data to create
     * @return The created portfolio response
     * @throws ServiceException if there is an error creating the portfolio
     */
    public PortfolioResponseDto createPortfolio(PortfolioDto portfolioDto) {
        return circuitBreakerFactory.create(PORTFOLIO_SERVICE).run(
            () -> {
                try {
                    // Convert DTO to entity using mapper
                    Portfolio newPortfolio = portfolioMapper.toEntity(portfolioDto);

                    // Save the entity
                    portfolioRepository.save(newPortfolio);

                    log.info("Portfolio created successfully!");

                    // Convert entity to response DTO using mapper
                    return portfolioMapper.toResponseDto(newPortfolio);
                } catch (Exception e) {
                    log.error("Error creating portfolio: {}", e.getMessage());
                    throw new ServiceException("Error creating portfolio: " + e.getMessage(), e);
                }
            },
            throwable -> {
                log.error("Circuit breaker triggered for createPortfolio: {}", throwable.getMessage());
                throw new ServiceException("Service unavailable", throwable);
            }
        );
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
                    .map(portfolioMapper::toResponseDto)
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

            return portfolioMapper.toResponseDto(portfolio);
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
