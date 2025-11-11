package com.moneyplant.engines.ingestion.provider;

import com.moneyplant.engines.common.entities.NseEquityMaster;
import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.reactor.ratelimiter.operator.RateLimiterOperator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/**
 * Yahoo Finance Data Provider implementation.
 * Fetches historical OHLCV data from Yahoo Finance API.
 * 
 * Yahoo Finance API Endpoint:
 * - Historical Data: https://query1.finance.yahoo.com/v7/finance/download/{SYMBOL}
 * 
 * Note: Yahoo Finance does not provide equity master data, so fetchEquityMasterData() returns empty list.
 * 
 * Requirements: 2.1, 6.1
 */
@Component
public class YahooFinanceProvider implements DataProvider {
    
    private static final Logger log = LoggerFactory.getLogger(YahooFinanceProvider.class);
    
    private static final String YAHOO_BASE_URL = "https://query1.finance.yahoo.com";
    private static final String DOWNLOAD_ENDPOINT = "/v7/finance/download";
    
    private final WebClient webClient;
    private final RateLimiter rateLimiter;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param yahooWebClient WebClient configured for Yahoo Finance API
     * @param yahooRateLimiter Rate limiter for Yahoo Finance API (2000 requests/hour)
     */
    public YahooFinanceProvider(
            @Qualifier("yahooWebClient") WebClient yahooWebClient,
            @Qualifier("yahooRateLimiter") RateLimiter yahooRateLimiter) {
        this.webClient = yahooWebClient;
        this.rateLimiter = yahooRateLimiter;
        
        log.info("YahooFinanceProvider initialized with rate limit: 2000 requests/hour");
    }
    
    /**
     * Fetches historical OHLCV data for a symbol from Yahoo Finance API.
     * Yahoo Finance returns data in CSV format.
     * 
     * @param symbol Trading symbol (e.g., "RELIANCE.NS" for NSE stocks)
     * @param start Start date (inclusive)
     * @param end End date (inclusive)
     * @param timeframe Data timeframe (1min, 5min, 1day, etc.)
     * @return Mono containing list of OHLCV data
     */
    @Override
    public Mono<List<OhlcvData>> fetchHistorical(String symbol, LocalDate start, LocalDate end, Timeframe timeframe) {
        log.info("Fetching historical data from Yahoo Finance for symbol: {} from {} to {}", symbol, start, end);
        
        // Convert symbol to Yahoo Finance format (add .NS for NSE stocks if not present)
        String yahooSymbol = symbol.contains(".") ? symbol : symbol + ".NS";
        
        // Convert dates to Unix timestamps
        long startTimestamp = start.atStartOfDay(ZoneId.of("Asia/Kolkata")).toEpochSecond();
        long endTimestamp = end.atTime(23, 59, 59).atZone(ZoneId.of("Asia/Kolkata")).toEpochSecond();
        
        // Map timeframe to Yahoo Finance interval
        String interval = mapTimeframeToInterval(timeframe);
        
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("query1.finance.yahoo.com")
                        .path(DOWNLOAD_ENDPOINT + "/" + yahooSymbol)
                        .queryParam("period1", startTimestamp)
                        .queryParam("period2", endTimestamp)
                        .queryParam("interval", interval)
                        .queryParam("events", "history")
                        .queryParam("includeAdjustedClose", "true")
                        .build())
                .retrieve()
                .onStatus(status -> status.isError(), response -> {
                    log.error("Yahoo Finance API error for symbol {}: {}", yahooSymbol, response.statusCode());
                    return response.bodyToMono(String.class)
                            .flatMap(body -> Mono.error(new RuntimeException(
                                    "Yahoo Finance API error: " + response.statusCode() + " - " + body)));
                })
                .bodyToMono(String.class)
                .transformDeferred(RateLimiterOperator.of(rateLimiter))
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .maxBackoff(Duration.ofSeconds(10))
                        .filter(throwable -> !(throwable instanceof IllegalArgumentException)))
                .map(csv -> parseCsvToOhlcvData(csv, symbol, timeframe))
                .doOnSuccess(list -> log.info("Successfully fetched {} historical records for {} from Yahoo Finance", 
                        list.size(), symbol))
                .doOnError(error -> log.error("Failed to fetch historical data for {} from Yahoo Finance", symbol, error));
    }
    
    /**
     * Yahoo Finance does not provide equity master data.
     * This method returns an empty list.
     * 
     * @return Mono containing empty list
     */
    @Override
    public Mono<List<NseEquityMaster>> fetchEquityMasterData() {
        log.warn("Yahoo Finance does not support equity master data fetching");
        return Mono.just(new ArrayList<>());
    }
    
    /**
     * Checks if Yahoo Finance API is healthy by making a test request.
     * 
     * @return Mono containing health status
     */
    @Override
    public Mono<Boolean> isHealthy() {
        // Test with a known symbol (Apple stock)
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("query1.finance.yahoo.com")
                        .path("/v7/finance/download/AAPL")
                        .queryParam("period1", Instant.now().minusSeconds(86400).getEpochSecond())
                        .queryParam("period2", Instant.now().getEpochSecond())
                        .queryParam("interval", "1d")
                        .build())
                .retrieve()
                .toBodilessEntity()
                .map(response -> response.getStatusCode().is2xxSuccessful())
                .timeout(Duration.ofSeconds(5))
                .onErrorReturn(false)
                .doOnNext(healthy -> log.debug("Yahoo Finance provider health check: {}", healthy));
    }
    
    @Override
    public ProviderType getType() {
        return ProviderType.YAHOO_FINANCE;
    }
    
    /**
     * Maps Timeframe enum to Yahoo Finance interval string.
     * 
     * @param timeframe Timeframe enum
     * @return Yahoo Finance interval string
     */
    private String mapTimeframeToInterval(Timeframe timeframe) {
        return switch (timeframe) {
            case ONE_MINUTE -> "1m";
            case FIVE_MINUTES -> "5m";
            case FIFTEEN_MINUTES -> "15m";
            case THIRTY_MINUTES -> "30m";
            case ONE_HOUR -> "1h";
            case ONE_DAY -> "1d";
            case ONE_WEEK -> "1wk";
            case ONE_MONTH -> "1mo";
        };
    }
    
    /**
     * Parses CSV response from Yahoo Finance to OhlcvData list.
     * 
     * CSV Format:
     * Date,Open,High,Low,Close,Adj Close,Volume
     * 2024-01-01,2450.50,2455.00,2448.00,2452.75,2452.75,1250000
     * 
     * @param csv CSV string
     * @param symbol Trading symbol
     * @param timeframe Data timeframe
     * @return List of OhlcvData
     */
    private List<OhlcvData> parseCsvToOhlcvData(String csv, String symbol, Timeframe timeframe) {
        List<OhlcvData> result = new ArrayList<>();
        
        if (csv == null || csv.isEmpty()) {
            log.warn("Empty CSV response for symbol: {}", symbol);
            return result;
        }
        
        String[] lines = csv.split("\n");
        
        // Skip header line
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) {
                continue;
            }
            
            try {
                String[] fields = line.split(",");
                if (fields.length < 7) {
                    log.warn("Invalid CSV line for symbol {}: {}", symbol, line);
                    continue;
                }
                
                // Parse fields
                LocalDate date = LocalDate.parse(fields[0]);
                Instant timestamp = date.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
                
                BigDecimal open = new BigDecimal(fields[1]);
                BigDecimal high = new BigDecimal(fields[2]);
                BigDecimal low = new BigDecimal(fields[3]);
                BigDecimal close = new BigDecimal(fields[4]);
                // fields[5] is Adj Close - we use regular close
                Long volume = Long.parseLong(fields[6]);
                
                OhlcvData ohlcv = OhlcvData.builder()
                        .symbol(symbol)
                        .timestamp(timestamp)
                        .timeframe(timeframe)
                        .open(open)
                        .high(high)
                        .low(low)
                        .close(close)
                        .volume(volume)
                        .build();
                
                result.add(ohlcv);
            } catch (Exception e) {
                log.error("Failed to parse CSV line for symbol {}: {}", symbol, line, e);
            }
        }
        
        log.debug("Parsed {} OHLCV records from CSV for symbol: {}", result.size(), symbol);
        return result;
    }
}
