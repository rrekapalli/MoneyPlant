package com.moneyplant.stock.services;

import com.moneyplant.stock.dtos.StockDto;
import com.moneyplant.stock.dtos.StockResponseDto;
import com.moneyplant.core.entities.NseEquityMaster;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.stock.repositories.StockRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository stockRepository;

    private static final String STOCK_SERVICE = "stockService";

    /**
     * Creates a new stock using the annotation-based circuit breaker approach.
     * 
     * @param stockDto The stock data to create
     * @return The created stock response
     * @throws ServiceException if there is an error creating the stock
     */
    @CircuitBreaker(name = STOCK_SERVICE, fallbackMethod = "createStockFallback")
    public StockResponseDto createStock(StockDto stockDto) {
        try {
            NseEquityMaster newStock = new NseEquityMaster();

            newStock.setSymbol(stockDto.getSymbol());
            newStock.setCompanyName(stockDto.getCompanyName());
            newStock.setIndustry(stockDto.getIndustry());
            newStock.setPdSectorInd(stockDto.getPdSectorInd());

            stockRepository.save(newStock);

            log.info("Stock created successfully!");

            return new StockResponseDto(
                    newStock.getSymbol(),
                    newStock.getCompanyName(),
                    newStock.getIndustry(),
                    newStock.getPdSectorInd()
            );
        } catch (Exception e) {
            log.error("Error creating stock: {}", e.getMessage());
            throw new ServiceException("Error creating stock: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback method for createStock when the circuit is open.
     * 
     * @param stockDto The stock data that was being created
     * @param e The exception that triggered the fallback
     * @return null
     */
    public StockResponseDto createStockFallback(StockDto stockDto, Exception e) {
        log.error("Circuit breaker triggered for createStock: {}", e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Gets all stocks using the annotation-based circuit breaker approach.
     * 
     * @return List of stock responses
     * @throws ServiceException if there is an error retrieving stocks
     */
    @CircuitBreaker(name = STOCK_SERVICE, fallbackMethod = "getAllStocksFallback")
    public List<StockResponseDto> getAllStocks() {
        try {
            return stockRepository.findAll()
                    .stream()
                    .map(stock -> new StockResponseDto(
                            stock.getSymbol(),
                            stock.getCompanyName(),
                            stock.getIndustry(),
                            stock.getPdSectorInd()
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("Error retrieving stocks: {}", e.getMessage());
            throw new ServiceException("Error retrieving stocks: " + e.getMessage(), e);
        }
    }

    /**
     * Gets a stock by ID (symbol).
     * 
     * @param id The symbol of the stock to retrieve
     * @return The stock response
     * @throws ResourceNotFoundException if the stock is not found
     * @throws ServiceException if there is an error retrieving the stock
     */
    @CircuitBreaker(name = STOCK_SERVICE, fallbackMethod = "getStockByIdFallback")
    public StockResponseDto getStockById(String id) {
        try {
            NseEquityMaster stock = stockRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Stock not found with symbol: " + id));

            return new StockResponseDto(
                    stock.getSymbol(),
                    stock.getCompanyName(),
                    stock.getIndustry(),
                    stock.getPdSectorInd()
            );
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving stock with symbol {}: {}", id, e.getMessage());
            throw new ServiceException("Error retrieving stock: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback method for getAllStocks when the circuit is open.
     * 
     * @param e The exception that triggered the fallback
     * @return An empty list of stocks
     */
    public List<StockResponseDto> getAllStocksFallback(Exception e) {
        log.error("Circuit breaker triggered for getAllStocks: {}", e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Fallback method for getStockById when the circuit is open.
     * 
     * @param id The ID of the stock that was being retrieved
     * @param e The exception that triggered the fallback
     * @return null
     */
    public StockResponseDto getStockByIdFallback(String id, Exception e) {
        log.error("Circuit breaker triggered for getStockById with id {}: {}", id, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Gets a stock by symbol.
     * 
     * @param symbol The symbol of the stock to retrieve
     * @return The stock response
     * @throws ResourceNotFoundException if the stock is not found
     * @throws ServiceException if there is an error retrieving the stock
     */
    @CircuitBreaker(name = STOCK_SERVICE, fallbackMethod = "getStockBySymbolFallback")
    public StockResponseDto getStockBySymbol(String symbol) {
        try {
            NseEquityMaster stock = stockRepository.findBySymbolIgnoreCase(symbol)
                    .orElseThrow(() -> new ResourceNotFoundException("Stock not found with symbol: " + symbol));

            return new StockResponseDto(
                    stock.getSymbol(),
                    stock.getCompanyName(),
                    stock.getIndustry(),
                    stock.getPdSectorInd()
            );
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving stock with symbol {}: {}", symbol, e.getMessage());
            throw new ServiceException("Error retrieving stock: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback method for getStockBySymbol when the circuit is open.
     * 
     * @param symbol The symbol of the stock that was being retrieved
     * @param e The exception that triggered the fallback
     * @return null
     */
    public StockResponseDto getStockBySymbolFallback(String symbol, Exception e) {
        log.error("Circuit breaker triggered for getStockBySymbol with symbol {}: {}", symbol, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Gets stocks by industry.
     * 
     * @param industry The industry to filter by
     * @return List of stock responses
     * @throws ServiceException if there is an error retrieving stocks
     */
    @CircuitBreaker(name = STOCK_SERVICE, fallbackMethod = "getStocksByIndustryFallback")
    public List<StockResponseDto> getStocksByIndustry(String industry) {
        try {
            return stockRepository.findByIndustryIgnoreCase(industry)
                    .stream()
                    .map(stock -> new StockResponseDto(
                            stock.getSymbol(),
                            stock.getCompanyName(),
                            stock.getIndustry(),
                            stock.getPdSectorInd()
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("Error retrieving stocks by industry {}: {}", industry, e.getMessage());
            throw new ServiceException("Error retrieving stocks by industry: " + e.getMessage(), e);
        }
    }

    /**
     * Gets stocks by sector indicator.
     * 
     * @param sectorInd The sector indicator to filter by
     * @return List of stock responses
     * @throws ServiceException if there is an error retrieving stocks
     */
    @CircuitBreaker(name = STOCK_SERVICE, fallbackMethod = "getStocksBySectorFallback")
    public List<StockResponseDto> getStocksBySector(String sectorInd) {
        try {
            return stockRepository.findByPdSectorIndIgnoreCase(sectorInd)
                    .stream()
                    .map(stock -> new StockResponseDto(
                            stock.getSymbol(),
                            stock.getCompanyName(),
                            stock.getIndustry(),
                            stock.getPdSectorInd()
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("Error retrieving stocks by sector {}: {}", sectorInd, e.getMessage());
            throw new ServiceException("Error retrieving stocks by sector: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback method for getStocksByIndustry when the circuit is open.
     * 
     * @param industry The industry that was being searched
     * @param e The exception that triggered the fallback
     * @return empty list
     */
    public List<StockResponseDto> getStocksByIndustryFallback(String industry, Exception e) {
        log.error("Circuit breaker triggered for getStocksByIndustry with industry {}: {}", industry, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Fallback method for getStocksBySector when the circuit is open.
     * 
     * @param sectorInd The sector indicator that was being searched
     * @param e The exception that triggered the fallback
     * @return empty list
     */
    public List<StockResponseDto> getStocksBySectorFallback(String sectorInd, Exception e) {
        log.error("Circuit breaker triggered for getStocksBySector with sector {}: {}", sectorInd, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }
}
