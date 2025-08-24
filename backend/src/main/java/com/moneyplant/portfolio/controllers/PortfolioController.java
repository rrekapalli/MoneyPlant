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
@RequestMapping("api/v1/portfolio-core")
@RequiredArgsConstructor
@Tag(name = "Portfolio Core", description = "Read-only endpoints for core portfolio entities")
public class PortfolioController {
    private final PortfolioService service;

    @GetMapping("/portfolios")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioDto> getPortfolios() {
        return service.getPortfolios();
    }

    @GetMapping("/portfolios/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PortfolioDto getPortfolio(@PathVariable Long id) {
        return service.getPortfolio(id);
    }

    @GetMapping("/portfolios/{id}/transactions")
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

    @GetMapping("/portfolios/{id}/holdings")
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

    @GetMapping("/portfolios/{id}/cashflows")
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

    @GetMapping("/portfolios/{id}/valuations/daily")
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

    @GetMapping("/portfolios/{id}/holdings/valuations/daily")
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

    @GetMapping("/portfolios/{id}/metrics/daily")
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

    @GetMapping("/portfolios/{id}/benchmarks")
    @ResponseStatus(HttpStatus.OK)
    public List<PortfolioBenchmarkDto> getBenchmarks(@PathVariable Long id) {
        return service.getBenchmarks(id);
    }
}
