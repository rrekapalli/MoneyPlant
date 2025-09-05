package com.moneyplant.stock.controllers;

import com.moneyplant.stock.dtos.StockDto;
import com.moneyplant.stock.dtos.StockResponseDto;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.stock.dtos.StockHistoricalDataDto;
import com.moneyplant.stock.dtos.StockHistoryRequest;
import com.moneyplant.stock.services.StockHistoryService;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("api/v1/stock")
@RequiredArgsConstructor
@Tag(name = "Stock", description = "Stock management API")
public class StockController {

    private final StockService stockService;
    private final StockHistoryService stockHistoryService;

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

    /**
     * Get historical OHLCV data for a stock between startDate and endDate using direct SQL (Trino query).
     * Accepts dates in yyyy-MM-dd format.
     *
     * @param symbol The stock symbol (path)
     * @param request The request body containing optional symbol, startDate, endDate
     * @return List of historical OHLCV data
     */
    @Operation(summary = "Get stock historical OHLCV by date range", description = "Retrieves historical OHLCV for a stock between startDate and endDate from nse_eq_ohlcv_historic using Trino SQL. Dates should be in yyyy-MM-dd format.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved historical data",
                content = @Content(schema = @Schema(implementation = StockHistoricalDataDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data or date format"),
        @ApiResponse(responseCode = "404", description = "Data not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/{symbol}/history")
    @ResponseStatus(HttpStatus.OK)
    public List<StockHistoricalDataDto> getStockHistory(
            @Parameter(description = "Symbol of the stock", required = true)
            @PathVariable String symbol,
            @Valid @RequestBody StockHistoryRequest request
    ){
        try {
            // Validate symbol consistency
            if (request.getSymbol() != null && !request.getSymbol().isBlank() && !symbol.equalsIgnoreCase(request.getSymbol())) {
                throw new IllegalArgumentException("Symbol in path and payload must match");
            }
            
            // Validate date formats
            request.validateDates();
            
            // Get dates as LocalDate objects
            LocalDate startDate = request.getStartDateAsLocalDate();
            LocalDate endDate = request.getEndDateAsLocalDate();
            
            return stockHistoryService.getHistory(symbol, startDate, endDate);
            
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid request parameters: " + e.getMessage());
        }
    }

    /**
     * Get all historical OHLCV data for a stock using direct SQL (Trino query).
     *
     * @param symbol The stock symbol (path)
     * @return List of historical OHLCV data
     */
    @Operation(summary = "Get all historical OHLCV for a stock", description = "Retrieves all historical OHLCV for a stock from nse_eq_ohlcv_historic using Trino SQL")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved historical data",
                content = @Content(schema = @Schema(implementation = StockHistoricalDataDto.class))),
        @ApiResponse(responseCode = "404", description = "Data not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{symbol}/historic/all")
    @ResponseStatus(HttpStatus.OK)
    public List<StockHistoricalDataDto> getAllStockHistory(
            @Parameter(description = "Symbol of the stock", required = true)
            @PathVariable String symbol
    ){
        return stockHistoryService.getAllHistory(symbol);
    }


}
