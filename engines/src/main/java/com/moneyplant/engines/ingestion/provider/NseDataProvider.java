package com.moneyplant.engines.ingestion.provider;

import com.moneyplant.engines.common.entities.NseEquityMaster;
import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import com.moneyplant.engines.ingestion.model.dto.NseEquityMasterDto;
import com.moneyplant.engines.ingestion.model.dto.NseEquityMasterResponseDto;
import com.moneyplant.engines.ingestion.model.dto.NseHistoricalDataDto;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.reactor.ratelimiter.operator.RateLimiterOperator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * NSE Data Provider implementation.
 * Fetches equity master data and historical OHLCV data from NSE API.
 * 
 * NSE API Endpoints:
 * - Equity Master: https://www.nseindia.com/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O
 * - Historical Data: https://www.nseindia.com/api/historical/cm/equity
 * - Quote Data: https://www.nseindia.com/api/quote-equity
 * 
 * Requirements: 2.2, 7.1
 */
@Component
public class NseDataProvider implements DataProvider {
    
    private static final Logger log = LoggerFactory.getLogger(NseDataProvider.class);
    
    private static final String NSE_BASE_URL = "https://www.nseindia.com";
    private static final String EQUITY_MASTER_ENDPOINT = "/api/equity-stockIndices";
    private static final String HISTORICAL_DATA_ENDPOINT = "/api/historical/cm/equity";
    private static final String QUOTE_ENDPOINT = "/api/quote-equity";
    
    private static final DateTimeFormatter NSE_DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    
    private final WebClient webClient;
    private final RateLimiter rateLimiter;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param nseWebClient WebClient configured for NSE API
     * @param nseRateLimiter Rate limiter for NSE API (1000 requests/hour)
     */
    public NseDataProvider(
            @Qualifier("nseWebClient") WebClient nseWebClient,
            @Qualifier("nseRateLimiter") RateLimiter nseRateLimiter) {
        this.webClient = nseWebClient;
        this.rateLimiter = nseRateLimiter;
        
        log.info("NseDataProvider initialized with rate limit: 1000 requests/hour");
    }
    
    /**
     * Fetches equity master data from NSE API.
     * Returns comprehensive symbol metadata including trading status, sector, industry, etc.
     * 
     * @return Mono containing list of NseEquityMaster entities
     */
    @Override
    public Mono<List<NseEquityMaster>> fetchEquityMasterData() {
        log.info("Fetching equity master data from NSE API");
        
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("www.nseindia.com")
                        .path(EQUITY_MASTER_ENDPOINT)
                        .queryParam("index", "SECURITIES IN F&O")
                        .build())
                .header(HttpHeaders.REFERER, NSE_BASE_URL)
                .retrieve()
                .onStatus(status -> status.isError(), response -> {
                    log.error("NSE API error: {}", response.statusCode());
                    return response.bodyToMono(String.class)
                            .flatMap(body -> Mono.error(new RuntimeException(
                                    "NSE API error: " + response.statusCode() + " - " + body)));
                })
                .bodyToMono(NseEquityMasterResponseDto.class)
                .transformDeferred(RateLimiterOperator.of(rateLimiter))
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(10))
                        .filter(throwable -> !(throwable instanceof IllegalArgumentException)))
                .map(this::convertToNseEquityMasterList)
                .doOnSuccess(list -> log.info("Successfully fetched {} equity master records", list.size()))
                .doOnError(error -> log.error("Failed to fetch equity master data", error));
    }
    
    /**
     * Fetches historical OHLCV data for a symbol from NSE API.
     * 
     * @param symbol Trading symbol (e.g., "RELIANCE")
     * @param start Start date (inclusive)
     * @param end End date (inclusive)
     * @param timeframe Data timeframe (NSE only supports daily data)
     * @return Mono containing list of OHLCV data
     */
    @Override
    public Mono<List<OhlcvData>> fetchHistorical(String symbol, LocalDate start, LocalDate end, Timeframe timeframe) {
        log.info("Fetching historical data for symbol: {} from {} to {}", symbol, start, end);
        
        // NSE API only supports daily data
        if (timeframe != Timeframe.ONE_DAY) {
            log.warn("NSE API only supports daily data. Requested timeframe: {}", timeframe);
        }
        
        String fromDate = start.format(NSE_DATE_FORMAT);
        String toDate = end.format(NSE_DATE_FORMAT);
        
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("www.nseindia.com")
                        .path(HISTORICAL_DATA_ENDPOINT)
                        .queryParam("symbol", symbol)
                        .queryParam("series", "[\"EQ\"]")
                        .queryParam("from", fromDate)
                        .queryParam("to", toDate)
                        .build())
                .header(HttpHeaders.REFERER, NSE_BASE_URL)
                .retrieve()
                .onStatus(status -> status.isError(), response -> {
                    log.error("NSE API error for symbol {}: {}", symbol, response.statusCode());
                    return response.bodyToMono(String.class)
                            .flatMap(body -> Mono.error(new RuntimeException(
                                    "NSE API error: " + response.statusCode() + " - " + body)));
                })
                .bodyToMono(NseHistoricalDataDto.class)
                .transformDeferred(RateLimiterOperator.of(rateLimiter))
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(10))
                        .filter(throwable -> !(throwable instanceof IllegalArgumentException)))
                .map(dto -> convertToOhlcvDataList(dto, symbol))
                .doOnSuccess(list -> log.info("Successfully fetched {} historical records for {}", list.size(), symbol))
                .doOnError(error -> log.error("Failed to fetch historical data for {}", symbol, error));
    }
    
    /**
     * Checks if NSE API is healthy by making a test request.
     * 
     * @return Mono containing health status
     */
    @Override
    public Mono<Boolean> isHealthy() {
        return webClient.get()
                .uri(NSE_BASE_URL)
                .retrieve()
                .toBodilessEntity()
                .map(response -> response.getStatusCode().is2xxSuccessful())
                .timeout(Duration.ofSeconds(5))
                .onErrorReturn(false)
                .doOnNext(healthy -> log.debug("NSE provider health check: {}", healthy));
    }
    
    @Override
    public ProviderType getType() {
        return ProviderType.NSE;
    }
    
    /**
     * Converts NSE API response DTO to NseEquityMaster entity list.
     * 
     * @param responseDto NSE API response
     * @return List of NseEquityMaster entities
     */
    private List<NseEquityMaster> convertToNseEquityMasterList(NseEquityMasterResponseDto responseDto) {
        if (responseDto == null || responseDto.getData() == null) {
            log.warn("Empty response from NSE API");
            return new ArrayList<>();
        }
        
        return responseDto.getData().stream()
                .map(this::convertToNseEquityMaster)
                .collect(Collectors.toList());
    }
    
    /**
     * Converts NSE equity master DTO to entity.
     * 
     * @param dto NSE equity master DTO
     * @return NseEquityMaster entity
     */
    private NseEquityMaster convertToNseEquityMaster(NseEquityMasterDto dto) {
        NseEquityMaster entity = new NseEquityMaster();
        
        // Basic fields
        entity.setSymbol(dto.getSymbol());
        entity.setCompanyName(dto.getCompanyName());
        entity.setIndustry(dto.getIndustry());
        entity.setSector(dto.getSector());
        entity.setBasicIndustry(dto.getBasicIndustry());
        entity.setIsin(dto.getIsin());
        entity.setSeries(dto.getSeries());
        
        // Trading status fields
        entity.setIsFnoSec(dto.getIsFnoSec() != null && dto.getIsFnoSec() ? "Yes" : "No");
        entity.setIsSuspended(dto.getIsSuspended() != null && dto.getIsSuspended() ? "Yes" : "No");
        entity.setIsDelisted(dto.getIsDelisted() != null && dto.getIsDelisted() ? "Yes" : "No");
        entity.setTradingStatus(dto.getTradingStatus());
        entity.setTradingSegment(dto.getTradingSegment());
        
        // Price data
        entity.setLastPrice(dto.getLastPrice());
        entity.setPreviousClose(dto.getPreviousClose());
        entity.setOpen(dto.getOpen());
        entity.setClose(dto.getClose());
        entity.setVwap(dto.getVwap());
        entity.setTotalTradedVolume(dto.getTotalTradedVolume());
        
        // PE ratios
        entity.setPdSectorPe(dto.getPdSectorPe());
        entity.setPdSymbolPe(dto.getPdSymbolPe());
        entity.setPdSectorInd(dto.getPdSectorInd());
        
        // Other metadata
        entity.setFaceValue(dto.getFaceValue());
        entity.setIssuedSize(dto.getIssuedSize());
        entity.setListingDate(dto.getListingDate());
        entity.setLastUpdateTime(dto.getLastUpdateTime());
        
        return entity;
    }
    
    /**
     * Converts NSE historical data DTO to OhlcvData list.
     * 
     * @param dto NSE historical data DTO
     * @param symbol Trading symbol
     * @return List of OhlcvData
     */
    private List<OhlcvData> convertToOhlcvDataList(NseHistoricalDataDto dto, String symbol) {
        if (dto == null || dto.getData() == null) {
            log.warn("Empty historical data response for symbol: {}", symbol);
            return new ArrayList<>();
        }
        
        return dto.getData().stream()
                .map(record -> convertToOhlcvData(record, symbol))
                .collect(Collectors.toList());
    }
    
    /**
     * Converts NSE historical record to OhlcvData.
     * 
     * @param record NSE historical record
     * @param symbol Trading symbol
     * @return OhlcvData
     */
    private OhlcvData convertToOhlcvData(NseHistoricalDataDto.HistoricalRecord record, String symbol) {
        try {
            // Parse timestamp (format: "01-JAN-2024" or similar)
            LocalDate date = LocalDate.parse(record.getTimestamp(), 
                    DateTimeFormatter.ofPattern("dd-MMM-yyyy"));
            Instant timestamp = date.atStartOfDay().atZone(java.time.ZoneId.of("Asia/Kolkata")).toInstant();
            
            // Parse prices (NSE returns as strings)
            BigDecimal open = new BigDecimal(record.getOpenPrice());
            BigDecimal high = new BigDecimal(record.getHighPrice());
            BigDecimal low = new BigDecimal(record.getLowPrice());
            BigDecimal close = new BigDecimal(record.getClosePrice());
            
            // Parse volume
            Long volume = Long.parseLong(record.getTotalTradedQty());
            
            // Parse VWAP if available
            BigDecimal vwap = record.getVwap() != null && !record.getVwap().isEmpty() 
                    ? new BigDecimal(record.getVwap()) 
                    : null;
            
            return OhlcvData.builder()
                    .symbol(symbol)
                    .timestamp(timestamp)
                    .timeframe(Timeframe.ONE_DAY)
                    .open(open)
                    .high(high)
                    .low(low)
                    .close(close)
                    .volume(volume)
                    .vwap(vwap)
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse historical record for symbol: {}", symbol, e);
            throw new RuntimeException("Failed to parse historical data", e);
        }
    }
}
