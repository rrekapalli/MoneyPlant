package com.moneyplant.stock.controllers;

import com.moneyplant.core.entities.NseEqIndicator;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.stock.repositories.NseEqIndicatorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/indicators")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Stock Indicators", description = "NSE Equity indicators API (read-only)")
public class StockIndicatorsControllers {

    private final NseEqIndicatorRepository repository;

    @GetMapping("/symbols")
    @Operation(summary = "Get available symbols that have indicators")
    public List<String> getAvailableSymbols() {
        try {
            return repository.findDistinctSymbols();
        } catch (Exception e) {
            log.error("Error fetching symbols: {}", e.getMessage(), e);
            throw new ServiceException("Failed to fetch symbols", e);
        }
    }

    @GetMapping("/{symbol}/latest")
    @Operation(summary = "Get latest indicators for a symbol",
            responses = {
                    @ApiResponse(responseCode = "200", description = "OK",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = NseEqIndicator.class))),
                    @ApiResponse(responseCode = "404", description = "Not Found")
            })
    public NseEqIndicator getLatestForSymbol(
            @Parameter(description = "Stock symbol", required = true)
            @PathVariable String symbol) {
        try {
            return repository.findTopById_SymbolOrderById_DateDesc(symbol)
                    .orElseThrow(() -> new ResourceNotFoundException("No indicators found for symbol: " + symbol));
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching latest indicators for {}: {}", symbol, e.getMessage(), e);
            throw new ServiceException("Failed to fetch latest indicators for: " + symbol, e);
        }
    }

    @GetMapping("/{symbol}")
    @Operation(summary = "Get recent indicators for a symbol (most recent first)")
    public List<NseEqIndicator> getRecentForSymbol(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "30") int limit) {
        try {
            int pageSize = Math.max(1, Math.min(limit, 500));
            List<NseEqIndicator> list = repository.findById_SymbolOrderById_DateDesc(symbol, PageRequest.of(0, pageSize));
            if (list.isEmpty()) {
                throw new ResourceNotFoundException("No indicators found for symbol: " + symbol);
            }
            return list;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching indicators for {}: {}", symbol, e.getMessage(), e);
            throw new ServiceException("Failed to fetch indicators for: " + symbol, e);
        }
    }

    @GetMapping("/{symbol}/{date}")
    @Operation(summary = "Get indicators for a symbol on a specific date (yyyy-MM-dd)")
    public NseEqIndicator getForSymbolOnDate(
            @PathVariable String symbol,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            return repository.findById_SymbolAndId_Date(symbol, date)
                    .orElseThrow(() -> new ResourceNotFoundException("Indicators not found for symbol: " + symbol + " on date: " + date));
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching indicators for {} on {}: {}", symbol, date, e.getMessage(), e);
            throw new ServiceException("Failed to fetch indicators for: " + symbol + " on: " + date, e);
        }
    }
}
