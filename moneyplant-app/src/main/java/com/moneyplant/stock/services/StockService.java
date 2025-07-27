package com.moneyplant.stock.services;

import com.moneyplant.stock.dtos.StockDto;
import com.moneyplant.stock.dtos.StockResponseDto;
import com.moneyplant.stock.entities.Stock;
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
            Stock newStock = new Stock();

            newStock.setName(stockDto.getName());
            newStock.setSymbol(stockDto.getSymbol());

            stockRepository.save(newStock);

            log.info("Stock created successfully!");

            // TODO:  Need mapper
            return new StockResponseDto(
                    newStock.getId(),
                    newStock.getName(),
                    newStock.getSymbol()
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
                            stock.getId(),
                            stock.getName(),
                            stock.getSymbol()
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("Error retrieving stocks: {}", e.getMessage());
            throw new ServiceException("Error retrieving stocks: " + e.getMessage(), e);
        }
    }

    /**
     * Gets a stock by ID.
     * 
     * @param id The ID of the stock to retrieve
     * @return The stock response
     * @throws ResourceNotFoundException if the stock is not found
     * @throws ServiceException if there is an error retrieving the stock
     */
    @CircuitBreaker(name = STOCK_SERVICE, fallbackMethod = "getStockByIdFallback")
    public StockResponseDto getStockById(String id) {
        try {
            Stock stock = stockRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Stock not found with id: " + id));

            return new StockResponseDto(
                    stock.getId(),
                    stock.getName(),
                    stock.getSymbol()
            );
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving stock with id {}: {}", id, e.getMessage());
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
            Stock stock = stockRepository.findBySymbolIgnoreCase(symbol)
                    .orElseThrow(() -> new ResourceNotFoundException("Stock not found with symbol: " + symbol));

            return new StockResponseDto(
                    stock.getId(),
                    stock.getName(),
                    stock.getSymbol()
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
}
