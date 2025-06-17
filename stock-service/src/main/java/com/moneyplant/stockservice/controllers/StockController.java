package com.moneyplant.stockservice.controllers;

import com.moneyplant.stockservice.dtos.StockDto;
import com.moneyplant.stockservice.dtos.StockResponseDto;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.stockservice.services.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    /**
     * Creates a new stock
     * 
     * @param stockToCreate The validated stock data to create
     * @return The created stock response
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StockResponseDto createStock(@Valid @RequestBody StockDto stockToCreate){
        return stockService.createStock(stockToCreate);
    }

    /**
     * Gets all stocks
     * 
     * @return List of stock responses
     */
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<StockResponseDto> getAllStocks(){
        return stockService.getAllStocks();
    }

    /**
     * Gets a stock by ID
     * 
     * @param id The ID of the stock to retrieve
     * @return The stock response
     * @throws ResourceNotFoundException if the stock is not found
     */
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public StockResponseDto getStockById(@PathVariable String id){
        return stockService.getStockById(id);
    }

}
