package com.moneyplant.portfolio.controllers;

import com.moneyplant.portfolio.dtos.*;
import com.moneyplant.portfolio.services.PortfolioService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio Core", description = "Endpoints for portfolio entities")
public class PortfolioController {
    private final PortfolioService service;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioDto> getPortfolios() {
        return service.getPortfolios();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PortfolioDto getPortfolio(@PathVariable Long id) {
        return service.getPortfolio(id);
    }

    // Create a new portfolio with optional symbols to seed holdings
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioDto createPortfolio(@RequestBody PortfolioCreateRequest request) {
        return service.createPortfolio(request);
    }

    // Replace an existing portfolio
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PortfolioDto updatePortfolio(@PathVariable Long id, @RequestBody PortfolioUpdateRequest request) {
        return service.updatePortfolio(id, request);
    }

    // Partially update a portfolio
    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PortfolioDto patchPortfolio(@PathVariable Long id, @RequestBody PortfolioPatchRequest request) {
        return service.patchPortfolio(id, request);
    }

    @GetMapping("/{id}/transactions")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioTransactionDto> getTransactions(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String symbol
    ) {
        if (symbol != null) {
            return service.getTransactionsBySymbol(id, symbol);
        }
        if (start != null && end != null) {
            return service.getTransactionsByDate(id, start, end);
        }
        return service.getTransactions(id);
    }

    // Add a new transaction to the portfolio
    @PostMapping("/{id}/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioTransactionDto addTransaction(
            @PathVariable Long id,
            @RequestBody TransactionCreateRequest request
    ) {
        return service.addTransaction(id, request);
    }

    @GetMapping("/{id}/holdings")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioHoldingDto> getHoldings(
            @PathVariable Long id,
            @RequestParam(required = false) String symbol
    ) {
        if (symbol != null) {
            return service.getHoldingsBySymbol(id, symbol);
        }
        return service.getHoldings(id);
    }

    // Create holdings for a portfolio (one or more symbols)
    @PostMapping("/{id}/holdings")
    @ResponseStatus(HttpStatus.CREATED)
    public List<PortfolioHoldingDto> addHoldings(@PathVariable Long id, @RequestBody HoldingsCreateRequest request) {
        return service.addHoldings(id, request);
    }

    // Replace or create a single holding for a symbol
    @PutMapping("/{id}/holdings/{symbol}")
    @ResponseStatus(HttpStatus.OK)
    public PortfolioHoldingDto putHolding(
            @PathVariable Long id,
            @PathVariable String symbol,
            @RequestBody HoldingUpdateRequest request
    ) {
        return service.putHolding(id, symbol, request);
    }

    // Partially update a holding for a symbol
    @PatchMapping("/{id}/holdings/{symbol}")
    @ResponseStatus(HttpStatus.OK)
    public PortfolioHoldingDto patchHolding(
            @PathVariable Long id,
            @PathVariable String symbol,
            @RequestBody HoldingUpdateRequest request
    ) {
        return service.patchHolding(id, symbol, request);
    }

    @GetMapping("/{id}/cashflows")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioCashFlowDto> getCashFlows(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        if (start != null && end != null) {
            return service.getCashFlowsByDate(id, start, end);
        }
        return service.getCashFlows(id);
    }

    @GetMapping("/{id}/valuations/daily")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioValuationDailyDto> getValuations(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        if (start != null && end != null) {
            return service.getValuationsByDate(id, start, end);
        }
        return service.getValuations(id);
    }

    @GetMapping("/{id}/holdings/valuations/daily")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioHoldingValuationDailyDto> getHoldingValuations(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String symbol
    ) {
        if (symbol != null) {
            return service.getHoldingValuationsBySymbol(id, symbol);
        }
        if (start != null && end != null) {
            return service.getHoldingValuationsByDate(id, start, end);
        }
        return service.getHoldingValuations(id);
    }

    @GetMapping("/{id}/metrics/daily")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioMetricsDailyDto> getMetrics(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        if (start != null && end != null) {
            return service.getMetricsByDate(id, start, end);
        }
        return service.getMetrics(id);
    }

    @GetMapping("/{id}/benchmarks")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioBenchmarkDto> getBenchmarks(@PathVariable Long id) {
        return service.getBenchmarks(id);
    }
}
