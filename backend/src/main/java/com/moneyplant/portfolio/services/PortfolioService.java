package com.moneyplant.portfolio.services;

import com.moneyplant.core.entities.*;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.portfolio.dtos.*;
import com.moneyplant.portfolio.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final PortfolioTransactionRepository transactionRepository;
    private final PortfolioHoldingRepository holdingRepository;
    private final PortfolioValuationDailyRepository valuationDailyRepository;
    private final PortfolioHoldingValuationDailyRepository holdingValuationDailyRepository;
    private final PortfolioCashFlowRepository cashFlowRepository;
    private final PortfolioMetricsDailyRepository metricsDailyRepository;
    private final PortfolioBenchmarkRepository benchmarkRepository;

    public List<PortfolioDto> getPortfolios() {
        return portfolioRepository.findAll().stream().map(this::toDto).toList();
    }

    public PortfolioDto getPortfolio(Long id) {
        return toDto(portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found: " + id)));
    }

    public List<PortfolioTransactionDto> getTransactions(Long portfolioId) {
        return transactionRepository.findByPortfolio_Id(portfolioId).stream().map(this::toDto).toList();
    }

    public List<PortfolioTransactionDto> getTransactionsByDate(Long portfolioId, java.time.LocalDate start, java.time.LocalDate end) {
        return transactionRepository.findByPortfolio_IdAndTradeDateBetween(portfolioId, start, end).stream().map(this::toDto).toList();
    }

    public List<PortfolioTransactionDto> getTransactionsBySymbol(Long portfolioId, String symbol) {
        return transactionRepository.findByPortfolio_IdAndSymbol_Symbol(portfolioId, symbol).stream().map(this::toDto).toList();
    }

    public List<PortfolioHoldingDto> getHoldings(Long portfolioId) {
        return holdingRepository.findByPortfolio_Id(portfolioId).stream().map(this::toDto).toList();
    }

    public List<PortfolioHoldingDto> getHoldingsBySymbol(Long portfolioId, String symbol) {
        return holdingRepository.findByPortfolio_IdAndSymbol_Symbol(portfolioId, symbol).stream().map(this::toDto).toList();
    }

    public List<PortfolioValuationDailyDto> getValuations(Long portfolioId) {
        return valuationDailyRepository.findByPortfolio_Id(portfolioId).stream().map(this::toDto).toList();
    }

    public List<PortfolioValuationDailyDto> getValuationsByDate(Long portfolioId, java.time.LocalDate start, java.time.LocalDate end) {
        return valuationDailyRepository.findByPortfolio_IdAndDateBetween(portfolioId, start, end).stream().map(this::toDto).toList();
    }

    public List<PortfolioHoldingValuationDailyDto> getHoldingValuations(Long portfolioId) {
        return holdingValuationDailyRepository.findByPortfolio_Id(portfolioId).stream().map(this::toDto).toList();
    }

    public List<PortfolioHoldingValuationDailyDto> getHoldingValuationsByDate(Long portfolioId, java.time.LocalDate start, java.time.LocalDate end) {
        return holdingValuationDailyRepository.findByPortfolio_IdAndDateBetween(portfolioId, start, end).stream().map(this::toDto).toList();
    }

    public List<PortfolioHoldingValuationDailyDto> getHoldingValuationsBySymbol(Long portfolioId, String symbol) {
        return holdingValuationDailyRepository.findByPortfolio_IdAndSymbol_Symbol(portfolioId, symbol).stream().map(this::toDto).toList();
    }

    public List<PortfolioCashFlowDto> getCashFlows(Long portfolioId) {
        return cashFlowRepository.findByPortfolio_Id(portfolioId).stream().map(this::toDto).toList();
    }

    public List<PortfolioCashFlowDto> getCashFlowsByDate(Long portfolioId, java.time.LocalDate start, java.time.LocalDate end) {
        return cashFlowRepository.findByPortfolio_IdAndFlowDateBetween(portfolioId, start, end).stream().map(this::toDto).toList();
    }

    public List<PortfolioMetricsDailyDto> getMetrics(Long portfolioId) {
        return metricsDailyRepository.findByPortfolio_Id(portfolioId).stream().map(this::toDto).toList();
    }

    public List<PortfolioMetricsDailyDto> getMetricsByDate(Long portfolioId, java.time.LocalDate start, java.time.LocalDate end) {
        return metricsDailyRepository.findByPortfolio_IdAndDateBetween(portfolioId, start, end).stream().map(this::toDto).toList();
    }

    public List<PortfolioBenchmarkDto> getBenchmarks(Long portfolioId) {
        return benchmarkRepository.findByPortfolio_Id(portfolioId).stream().map(this::toDto).toList();
    }

    private PortfolioDto toDto(Portfolio p) {
        return new PortfolioDto(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getBaseCurrency(),
                p.getInceptionDate(),
                p.getRiskProfile(),
                p.getIsActive()
        );
    }

    private PortfolioTransactionDto toDto(PortfolioTransaction t) {
        return new PortfolioTransactionDto(
                t.getId(),
                t.getPortfolio() != null ? t.getPortfolio().getId() : null,
                t.getSymbol() != null ? t.getSymbol().getSymbol() : null,
                t.getTradeDate(),
                t.getTradeTime(),
                t.getTxnType(),
                t.getQuantity(),
                t.getPrice(),
                t.getFees(),
                t.getTaxes(),
                t.getNotes()
        );
    }

    private PortfolioHoldingDto toDto(PortfolioHolding h) {
        return new PortfolioHoldingDto(
                h.getId(),
                h.getPortfolio() != null ? h.getPortfolio().getId() : null,
                h.getSymbol() != null ? h.getSymbol().getSymbol() : null,
                h.getQuantity(),
                h.getAvgCost(),
                h.getRealizedPnl(),
                h.getLastUpdated()
        );
    }

    private PortfolioValuationDailyDto toDto(PortfolioValuationDaily v) {
        return new PortfolioValuationDailyDto(
                v.getId(),
                v.getPortfolio() != null ? v.getPortfolio().getId() : null,
                v.getDate(),
                v.getTotalMarketValue(),
                v.getTotalCostBasis(),
                v.getCashBalance(),
                v.getNetInvested(),
                v.getPnlDaily(),
                v.getPnlTotal(),
                v.getReturnDailyPct(),
                v.getReturnCumulativePct(),
                v.getTwrDailyPct(),
                v.getTwrCumulativePct(),
                v.getMwrCumulativePct()
        );
    }

    private PortfolioHoldingValuationDailyDto toDto(PortfolioHoldingValuationDaily hv) {
        return new PortfolioHoldingValuationDailyDto(
                hv.getId(),
                hv.getPortfolio() != null ? hv.getPortfolio().getId() : null,
                hv.getSymbol() != null ? hv.getSymbol().getSymbol() : null,
                hv.getDate(),
                hv.getQuantity(),
                hv.getMarketPrice(),
                hv.getMarketValue(),
                hv.getCostBasis(),
                hv.getPnlDaily(),
                hv.getPnlTotal(),
                hv.getWeightPct()
        );
    }

    private PortfolioCashFlowDto toDto(PortfolioCashFlow c) {
        return new PortfolioCashFlowDto(
                c.getId(),
                c.getPortfolio() != null ? c.getPortfolio().getId() : null,
                c.getFlowDate(),
                c.getAmount(),
                c.getFlowType(),
                c.getReferenceTxn() != null ? c.getReferenceTxn().getId() : null
        );
    }

    private PortfolioMetricsDailyDto toDto(PortfolioMetricsDaily m) {
        PortfolioMetricsDailyDto dto = new PortfolioMetricsDailyDto(
                m.getId(),
                m.getPortfolio() != null ? m.getPortfolio().getId() : null,
                m.getDate(),
                m.getNav(),
                m.getTwrDailyPct(),
                m.getTwrCumulativePct(),
                m.getMwrCumulativePct(),
                m.getIrrToDatePct(),
                m.getIrrAnnualizedPct(),
                m.getXirrToDatePct(),
                m.getXirrAnnualizedPct(),
                m.getCagrPct(),
                m.getYtdReturnPct(),
                m.getReturn1mPct(),
                m.getReturn3mPct(),
                m.getReturn6mPct(),
                m.getReturn1yPct(),
                m.getReturn3yAnnualizedPct(),
                m.getReturn5yAnnualizedPct(),
                m.getDrawdownPct(),
                m.getMaxDrawdownPct(),
                m.getVolatility30dPct(),
                m.getVolatility90dPct(),
                m.getDownsideDeviation30dPct(),
                m.getSharpe30d(),
                m.getSortino30d(),
                m.getCalmar1y(),
                m.getTreynor30d(),
                m.getBeta30d(),
                m.getAlpha30d(),
                m.getTrackingError30d(),
                m.getInformationRatio30d(),
                m.getVar9530d(),
                m.getCvar9530d(),
                m.getUpsideCapture1y(),
                m.getDownsideCapture1y(),
                m.getActiveReturn30dPct()
        );
        return dto;
    }

    private PortfolioBenchmarkDto toDto(PortfolioBenchmark b) {
        return new PortfolioBenchmarkDto(
                b.getPortfolio() != null ? b.getPortfolio().getId() : null,
                b.getIndexName() != null ? b.getIndexName().getIndexName() : null,
                b.getWeightPct()
        );
    }
}
