package com.moneyplant.stock.controllers;

import com.moneyplant.stock.dtos.StockDto;
import com.moneyplant.stock.dtos.StockResponseDto;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.stock.services.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/stock")
@RequiredArgsConstructor
@Tag(name = "Stock", description = "Stock management API")
public class StockController {

    private final StockService stockService;

    /**
     * Creates a new stock
     * 
     * @param stockToCreate The validated stock data to create
     * @return The created stock response
     */
    @Operation(summary = "Create a new stock", description = "Creates a new stock with the provided information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Stock created successfully",
                content = @Content(schema = @Schema(implementation = StockResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StockResponseDto createStock(
            @Parameter(description = "Stock data to create", required = true)
            @Valid @RequestBody StockDto stockToCreate){
        return stockService.createStock(stockToCreate);
    }

    /**
     * Gets all stocks
     * 
     * @return List of stock responses
     */
    @Operation(summary = "Get all stocks", description = "Retrieves a list of all stocks")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved stocks"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
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
    @Operation(summary = "Get a stock by ID", description = "Retrieves a stock by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved stock"),
        @ApiResponse(responseCode = "404", description = "Stock not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public StockResponseDto getStockById(
            @Parameter(description = "ID of the stock to retrieve", required = true)
            @PathVariable String id){
        return stockService.getStockById(id);
    }

    /**
     * Gets a stock by symbol
     * 
     * @param symbol The symbol of the stock to retrieve
     * @return The stock response
     * @throws ResourceNotFoundException if the stock is not found
     */
    @Operation(summary = "Get a stock by symbol", description = "Retrieves a stock by its symbol")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved stock"),
        @ApiResponse(responseCode = "404", description = "Stock not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/symbol/{symbol}")
    @ResponseStatus(HttpStatus.OK)
    public StockResponseDto getStockBySymbol(
            @Parameter(description = "Symbol of the stock to retrieve", required = true)
            @PathVariable String symbol){
        return stockService.getStockBySymbol(symbol);
    }

    /**
     * Gets stocks by industry
     * 
     * @param industry The industry to filter by
     * @return List of stock responses
     */
    @Operation(summary = "Get stocks by industry", description = "Retrieves stocks filtered by industry")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved stocks"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/industry/{industry}")
    @ResponseStatus(HttpStatus.OK)
    public List<StockResponseDto> getStocksByIndustry(
            @Parameter(description = "Industry to filter stocks by", required = true)
            @PathVariable String industry){
        return stockService.getStocksByIndustry(industry);
    }

    /**
     * Gets stocks by sector
     * 
     * @param sector The sector indicator to filter by
     * @return List of stock responses
     */
    @Operation(summary = "Get stocks by sector", description = "Retrieves stocks filtered by sector indicator")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved stocks"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/sector/{sector}")
    @ResponseStatus(HttpStatus.OK)
    public List<StockResponseDto> getStocksBySector(
            @Parameter(description = "Sector indicator to filter stocks by", required = true)
            @PathVariable String sector){
        return stockService.getStocksBySector(sector);
    }

}
