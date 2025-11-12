package com.moneyplant.engines.ingestion.api;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import com.moneyplant.engines.ingestion.repository.NseEquityMasterCustomRepository;
import com.moneyplant.engines.ingestion.repository.OhlcvRepository;
import com.moneyplant.engines.ingestion.repository.TimescaleRepository;
import com.moneyplant.engines.common.entities.NseEquityMaster;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * REST controller for market data queries.
 * Provides endpoints for accessing tick data, historical OHLCV data, and symbol search.
 * 
 * Requirements: 12.1
 */
@RestController
@RequestMapping("/api/v1/market-data")
@Slf4j
public class MarketDataController {
    
    private final TimescaleRepository timescaleRepository;
    private final OhlcvRepository ohlcvRepository;
    private final NseEquityMasterCustomRepository nseEquityMasterRepository;
    
    @Autowired
    public MarketDataController(
            TimescaleRepository timescaleRepository,
            OhlcvRepository ohlcvRepository,
            NseEquityMasterCustomRepository nseEquityMasterRepository) {
        this.timescaleRepository = timescaleRepository;
        this.ohlcvRepository = ohlcvRepository;
        this.nseEquityMasterRepository = nseEquityMasterRepository;
    }
    
    /**
     * Get latest quote (tick data) for a symbol.
     * 
     * GET /api/v1/market-data/quote/{symbol}
     * 
     * Example: GET /api/v1/market-data/quote/RELIANCE
     * 
     * @param symbol the trading symbol
     * @return latest tick data or 404 if not found
     */
    @GetMapping("/quote/{symbol}")
    public Mono<ResponseEntity<TickData>> getLatestQuote(@PathVariable String symbol) {
        log.debug("Fetching latest quote for symbol: {}", symbol);
        
        return timescaleRepository.getLatestTick(symbol)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build())
            .onErrorResume(error -> {
                log.error("Error fetching latest quote for symbol: {}", symbol, error);
                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            });
    }
    
    /**
     * Get historical OHLCV data for a symbol with pagination.
     * 
     * GET /api/v1/market-data/ohlcv/{symbol}?startDate=2024-01-01&endDate=2024-01-31&timeframe=1day&page=0&size=100
     * 
     * @param symbol the trading symbol
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @param timeframe candle timeframe (1min, 5min, 15min, 1hour, 1day)
     * @param page page number (0-indexed)
     * @param size page size (default 100, max 1000)
     * @return paginated OHLCV data
     */
    @GetMapping("/ohlcv/{symbol}")
    public Mono<ResponseEntity<Page<OhlcvData>>> getHistoricalData(
            @PathVariable String symbol,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Timeframe timeframe,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        // Validate page size
        if (size > 1000) {
            size = 1000;
        }
        if (size < 1) {
            size = 1;
        }
        
        log.debug("Fetching historical OHLCV data for symbol: {}, startDate: {}, endDate: {}, timeframe: {}, page: {}, size: {}",
                symbol, startDate, endDate, timeframe, page, size);
        
        // Convert LocalDate to Instant (start of day in IST)
        ZoneId istZone = ZoneId.of("Asia/Kolkata");
        Instant start = startDate.atStartOfDay(istZone).toInstant();
        Instant end = endDate.plusDays(1).atStartOfDay(istZone).toInstant(); // End of day
        
        Pageable pageable = PageRequest.of(page, size);
        
        return ohlcvRepository.findBySymbolAndTimeframeAndDateRange(symbol, timeframe, start, end, pageable)
            .map(ohlcvList -> {
                // Get total count for pagination
                long totalCount = ohlcvRepository.countBySymbolAndTimeframeAndDateRange(
                        symbol, timeframe, start, end);
                
                Page<OhlcvData> ohlcvPage = new PageImpl<>(ohlcvList, pageable, totalCount);
                return ResponseEntity.ok(ohlcvPage);
            })
            .defaultIfEmpty(ResponseEntity.ok(Page.empty(pageable)))
            .onErrorResume(error -> {
                log.error("Error fetching historical OHLCV data for symbol: {}", symbol, error);
                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            });
    }
    
    /**
     * Search symbols by query string.
     * Searches in symbol, company name, sector, and industry fields.
     * 
     * GET /api/v1/market-data/symbols/search?query=reliance&sector=Energy&limit=20
     * 
     * @param query search query string (searches symbol and company name)
     * @param sector optional sector filter
     * @param industry optional industry filter
     * @param limit maximum number of results (default 20, max 100)
     * @return list of matching symbols
     */
    @GetMapping("/symbols/search")
    public ResponseEntity<List<NseEquityMaster>> searchSymbols(
            @RequestParam String query,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String industry,
            @RequestParam(defaultValue = "20") int limit) {
        
        // Validate limit
        if (limit > 100) {
            limit = 100;
        }
        if (limit < 1) {
            limit = 1;
        }
        
        log.debug("Searching symbols with query: {}, sector: {}, industry: {}, limit: {}",
                query, sector, industry, limit);
        
        try {
            List<NseEquityMaster> results = nseEquityMasterRepository.searchSymbols(
                    query, sector, industry, limit);
            
            return ResponseEntity.ok(results);
        } catch (Exception error) {
            log.error("Error searching symbols with query: {}", query, error);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get symbol details by symbol code.
     * 
     * GET /api/v1/market-data/symbols/{symbol}
     * 
     * Example: GET /api/v1/market-data/symbols/RELIANCE
     * 
     * @param symbol the trading symbol
     * @return symbol details or 404 if not found
     */
    @GetMapping("/symbols/{symbol}")
    public ResponseEntity<NseEquityMaster> getSymbolDetails(@PathVariable String symbol) {
        log.debug("Fetching symbol details for: {}", symbol);
        
        try {
            NseEquityMaster symbolDetails = nseEquityMasterRepository.findBySymbol(symbol);
            
            if (symbolDetails != null) {
                return ResponseEntity.ok(symbolDetails);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception error) {
            log.error("Error fetching symbol details for: {}", symbol, error);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all symbols in a specific sector.
     * 
     * GET /api/v1/market-data/symbols/sector/{sector}?limit=50
     * 
     * @param sector the sector name
     * @param limit maximum number of results (default 50, max 200)
     * @return list of symbols in the sector
     */
    @GetMapping("/symbols/sector/{sector}")
    public ResponseEntity<List<NseEquityMaster>> getSymbolsBySector(
            @PathVariable String sector,
            @RequestParam(defaultValue = "50") int limit) {
        
        // Validate limit
        if (limit > 200) {
            limit = 200;
        }
        if (limit < 1) {
            limit = 1;
        }
        
        log.debug("Fetching symbols for sector: {}, limit: {}", sector, limit);
        
        try {
            List<NseEquityMaster> results = nseEquityMasterRepository.findBySector(sector, limit);
            return ResponseEntity.ok(results);
        } catch (Exception error) {
            log.error("Error fetching symbols for sector: {}", sector, error);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Health check endpoint for market data API.
     * 
     * GET /api/v1/market-data/health
     * 
     * @return health status
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Market data API is running");
    }
}
