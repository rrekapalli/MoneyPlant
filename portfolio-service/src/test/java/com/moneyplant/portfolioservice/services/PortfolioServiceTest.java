package com.moneyplant.portfolioservice.services;

import com.moneyplant.portfolioservice.dtos.PortfolioDto;
import com.moneyplant.portfolioservice.dtos.PortfolioResponseDto;
import com.moneyplant.portfolioservice.entities.Portfolio;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.portfolioservice.repositories.PortfolioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private PortfolioRepository portfolioRepository;

    @InjectMocks
    private PortfolioService portfolioService;

    private Portfolio portfolio;
    private PortfolioDto portfolioDto;
    private PortfolioResponseDto portfolioResponseDto;

    @BeforeEach
    void setUp() {
        // Setup test data
        portfolio = new Portfolio();
        portfolio.setId("test-id");
        portfolio.setName("Test Portfolio");
        portfolio.setDescription("Test Description");

        portfolioDto = new PortfolioDto();
        portfolioDto.setName("Test Portfolio");
        portfolioDto.setDescription("Test Description");

        portfolioResponseDto = new PortfolioResponseDto();
        portfolioResponseDto.setId("test-id");
        portfolioResponseDto.setName("Test Portfolio");
        portfolioResponseDto.setDescription("Test Description");
    }

    @Test
    void createPortfolio_Success() {
        // Arrange
        when(portfolioRepository.save(any(Portfolio.class))).thenReturn(portfolio);

        // Act
        PortfolioResponseDto result = portfolioService.createPortfolio(portfolioDto);

        // Assert
        assertNotNull(result);
        assertEquals("test-id", result.getId());
        assertEquals("Test Portfolio", result.getName());
        assertEquals("Test Description", result.getDescription());
        verify(portfolioRepository, times(1)).save(any(Portfolio.class));
    }

    @Test
    void createPortfolio_ThrowsServiceException_WhenRepositoryThrowsException() {
        // Arrange
        when(portfolioRepository.save(any(Portfolio.class))).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThrows(ServiceException.class, () -> portfolioService.createPortfolio(portfolioDto));
    }

    @Test
    void getAllPortfolios_Success() {
        // Arrange
        List<Portfolio> portfolios = Arrays.asList(portfolio);
        when(portfolioRepository.findAll()).thenReturn(portfolios);

        // Act
        List<PortfolioResponseDto> result = portfolioService.getAllPortfolios();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("test-id", result.get(0).getId());
        verify(portfolioRepository, times(1)).findAll();
    }

    @Test
    void getAllPortfolios_ThrowsServiceException_WhenRepositoryThrowsException() {
        // Arrange
        when(portfolioRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThrows(ServiceException.class, () -> portfolioService.getAllPortfolios());
    }

    @Test
    void getPortfolioById_Success() {
        // Arrange
        when(portfolioRepository.findById("test-id")).thenReturn(Optional.of(portfolio));

        // Act
        PortfolioResponseDto result = portfolioService.getPortfolioById("test-id");

        // Assert
        assertNotNull(result);
        assertEquals("test-id", result.getId());
        assertEquals("Test Portfolio", result.getName());
        assertEquals("Test Description", result.getDescription());
        verify(portfolioRepository, times(1)).findById("test-id");
    }

    @Test
    void getPortfolioById_ThrowsResourceNotFoundException_WhenPortfolioNotFound() {
        // Arrange
        when(portfolioRepository.findById("non-existent-id")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> portfolioService.getPortfolioById("non-existent-id"));
    }

    @Test
    void getPortfolioById_ThrowsServiceException_WhenRepositoryThrowsException() {
        // Arrange
        when(portfolioRepository.findById("test-id")).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThrows(ServiceException.class, () -> portfolioService.getPortfolioById("test-id"));
    }
}
