package com.moneyplant.portfolio.services;

import com.moneyplant.core.entities.*;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.portfolio.dtos.*;
import com.moneyplant.portfolio.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.moneyplant.core.repository.UserRepository;
import com.moneyplant.stock.repositories.StockRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Objects;

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
    private final UserRepository userRepository;
    private final StockRepository stockRepository;

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

    // Create a new portfolio, optionally seeding holdings by symbols
    public PortfolioDto createPortfolio(PortfolioCreateRequest req) {
        System.out.println("=== PORTFOLIO CREATION DEBUG ===");
        System.out.println("Create Request: " + req);
        System.out.println("Request userId: " + req.getUserId());
        System.out.println("Request name: " + req.getName());
        System.out.println("Request baseCurrency: " + req.getBaseCurrency());
        System.out.println("Request description: " + req.getDescription());
        System.out.println("Request riskProfile: " + req.getRiskProfile());
        System.out.println("Request isActive: " + req.getIsActive());
        System.out.println("=================================");
        
        if (req.getUserId() == null || req.getName() == null) {
            throw new IllegalArgumentException("userId and name are required");
        }
        var user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getUserId()));
        
        System.out.println("Found user: " + user.getEmail());
        
        var p = new Portfolio();
        p.setUser(user);
        p.setName(req.getName());
        p.setBaseCurrency(req.getBaseCurrency()); // Now optional - can be null
        p.setDescription(req.getDescription());
        p.setInceptionDate(req.getInceptionDate());
        p.setRiskProfile(req.getRiskProfile());
        if (req.getIsActive() != null) {
            p.setIsActive(req.getIsActive());
        }
        p.setCreatedAt(OffsetDateTime.now());
        p.setUpdatedAt(OffsetDateTime.now());
        
        System.out.println("About to save portfolio with baseCurrency: " + p.getBaseCurrency());
        
        try {
            var saved = portfolioRepository.save(p);
            System.out.println("Portfolio created successfully with ID: " + saved.getId());
            
            // Handle optional symbols for seeding holdings
            if (req.getSymbols() != null && !req.getSymbols().isEmpty()) {
                var qty = reqQuantityOrZero(null);
                var cost = reqCostOrZero(null);
                // use defaults 0/0 for seeding
                for (String sym : req.getSymbols()) {
                    var sem = stockRepository.findBySymbolIgnoreCase(sym)
                            .orElseThrow(() -> new ResourceNotFoundException("Symbol not found: " + sym));
                    var h = new PortfolioHolding();
                    h.setPortfolio(saved);
                    h.setSymbol(sem);
                    h.setQuantity(qty);
                    h.setAvgCost(cost);
                    h.setRealizedPnl(BigDecimal.ZERO);
                    h.setLastUpdated(OffsetDateTime.now());
                    holdingRepository.save(h);
                }
            }
            
            return toDto(saved);
        } catch (Exception e) {
            System.err.println("Error creating portfolio: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public PortfolioDto updatePortfolio(Long id, PortfolioUpdateRequest req) {
        System.out.println("=== PORTFOLIO UPDATE DEBUG ===");
        System.out.println("Portfolio ID: " + id);
        System.out.println("Update Request: " + req);
        System.out.println("Request name: " + req.getName());
        System.out.println("Request description: " + req.getDescription());
        System.out.println("Request riskProfile: " + req.getRiskProfile());
        System.out.println("Request baseCurrency: " + req.getBaseCurrency());
        System.out.println("=================================");
        
        if (req.getName() == null) {
            throw new IllegalArgumentException("name is required for PUT");
        }
        var p = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found: " + id));
        
        System.out.println("Found portfolio: " + p.getName());
        System.out.println("Current baseCurrency: " + p.getBaseCurrency());
        
        p.setName(req.getName());
        p.setBaseCurrency(req.getBaseCurrency());
        p.setDescription(req.getDescription());
        p.setInceptionDate(req.getInceptionDate());
        p.setRiskProfile(req.getRiskProfile());
        if (req.getIsActive() != null) p.setIsActive(req.getIsActive());
        p.setUpdatedAt(OffsetDateTime.now());
        
        System.out.println("About to save portfolio with baseCurrency: " + p.getBaseCurrency());
        
        try {
            var saved = portfolioRepository.save(p);
            System.out.println("Portfolio saved successfully with ID: " + saved.getId());
            return toDto(saved);
        } catch (Exception e) {
            System.err.println("Error saving portfolio: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public PortfolioDto patchPortfolio(Long id, PortfolioPatchRequest req) {
        var p = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found: " + id));
        if (req.getName() != null) p.setName(req.getName());
        if (req.getBaseCurrency() != null) p.setBaseCurrency(req.getBaseCurrency());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getInceptionDate() != null) p.setInceptionDate(req.getInceptionDate());
        if (req.getRiskProfile() != null) p.setRiskProfile(req.getRiskProfile());
        if (req.getIsActive() != null) p.setIsActive(req.getIsActive());
        p.setUpdatedAt(OffsetDateTime.now());
        return toDto(portfolioRepository.save(p));
    }

    public List<PortfolioHoldingDto> addHoldings(Long portfolioId, HoldingsCreateRequest req) {
        var p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found: " + portfolioId));
        if (req.getSymbols() == null || req.getSymbols().isEmpty()) {
            throw new IllegalArgumentException("symbols are required");
        }
        var qty = reqQuantityOrZero(req.getQuantity());
        var cost = reqCostOrZero(req.getAvgCost());
        for (String sym : req.getSymbols()) {
            var sem = stockRepository.findBySymbolIgnoreCase(sym)
                    .orElseThrow(() -> new ResourceNotFoundException("Symbol not found: " + sym));
            var h = new PortfolioHolding();
            h.setPortfolio(p);
            h.setSymbol(sem);
            h.setQuantity(qty);
            h.setAvgCost(cost);
            h.setRealizedPnl(BigDecimal.ZERO);
            h.setLastUpdated(OffsetDateTime.now());
            holdingRepository.save(h);
        }
        return getHoldings(portfolioId);
    }

    public PortfolioHoldingDto putHolding(Long portfolioId, String symbol, HoldingUpdateRequest req) {
        // PUT: quantity and avgCost must both be present
        if (req.getQuantity() == null || req.getAvgCost() == null) {
            throw new IllegalArgumentException("quantity and avgCost are required for PUT");
        }
        return upsertHolding(portfolioId, symbol, req, true);
    }

    public PortfolioHoldingDto patchHolding(Long portfolioId, String symbol, HoldingUpdateRequest req) {
        return upsertHolding(portfolioId, symbol, req, false);
    }

    private PortfolioHoldingDto upsertHolding(Long portfolioId, String symbol, HoldingUpdateRequest req, boolean isPut) {
        var p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found: " + portfolioId));
        var sem = stockRepository.findBySymbolIgnoreCase(symbol)
                .orElseThrow(() -> new ResourceNotFoundException("Symbol not found: " + symbol));
        var existing = holdingRepository.findByPortfolio_IdAndSymbol_Symbol(portfolioId, sem.getSymbol());
        PortfolioHolding h;
        if (existing.isEmpty()) {
            if (isPut || (req.getQuantity() != null || req.getAvgCost() != null || req.getRealizedPnl() != null)) {
                h = new PortfolioHolding();
                h.setPortfolio(p);
                h.setSymbol(sem);
                h.setQuantity(reqQuantityOrZero(req.getQuantity()));
                h.setAvgCost(reqCostOrZero(req.getAvgCost()));
                h.setRealizedPnl(req.getRealizedPnl() != null ? req.getRealizedPnl() : BigDecimal.ZERO);
                h.setLastUpdated(OffsetDateTime.now());
                h = holdingRepository.save(h);
            } else {
                throw new ResourceNotFoundException("Holding not found for symbol: " + symbol);
            }
        } else {
            // if multiple exist, target the first (should not happen with uniqueness expected)
            h = existing.get(0);
            if (isPut) {
                h.setQuantity(Objects.requireNonNull(req.getQuantity(), "quantity required"));
                h.setAvgCost(Objects.requireNonNull(req.getAvgCost(), "avgCost required"));
            } else {
                if (req.getQuantity() != null) h.setQuantity(req.getQuantity());
                if (req.getAvgCost() != null) h.setAvgCost(req.getAvgCost());
            }
            if (req.getRealizedPnl() != null) h.setRealizedPnl(req.getRealizedPnl());
            h.setLastUpdated(OffsetDateTime.now());
            h = holdingRepository.save(h);
        }
        return toDto(h);
    }

    public PortfolioTransactionDto addTransaction(Long portfolioId, TransactionCreateRequest req) {
        var p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found: " + portfolioId));
        var t = new PortfolioTransaction();
        t.setPortfolio(p);
        if (req.getSymbol() != null && !req.getSymbol().isBlank()) {
            var sem = stockRepository.findBySymbolIgnoreCase(req.getSymbol())
                    .orElseThrow(() -> new ResourceNotFoundException("Symbol not found: " + req.getSymbol()));
            t.setSymbol(sem);
        }
        if (req.getTradeDate() == null || req.getTxnType() == null || req.getQuantity() == null || req.getPrice() == null) {
            throw new IllegalArgumentException("tradeDate, txnType, quantity, price are required");
        }
        t.setTradeDate(req.getTradeDate());
        t.setTradeTime(req.getTradeTime());
        t.setTxnType(req.getTxnType());
        t.setQuantity(req.getQuantity());
        t.setPrice(req.getPrice());
        t.setFees(req.getFees() != null ? req.getFees() : BigDecimal.ZERO);
        t.setTaxes(req.getTaxes() != null ? req.getTaxes() : BigDecimal.ZERO);
        t.setNotes(req.getNotes());
        t.setCreatedAt(OffsetDateTime.now());
        t.setUpdatedAt(OffsetDateTime.now());
        t = transactionRepository.save(t);
        return toDto(t);
    }

    private BigDecimal reqQuantityOrZero(BigDecimal q) {
        return q != null ? q : BigDecimal.ZERO;
    }

    private BigDecimal reqCostOrZero(BigDecimal c) {
        return c != null ? c : BigDecimal.ZERO;
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
