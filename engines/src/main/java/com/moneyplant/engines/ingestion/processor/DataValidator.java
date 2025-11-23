package com.moneyplant.engines.ingestion.processor;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for validating market data quality and integrity.
 * Implements validation rules for price, volume, timestamp, and data completeness.
 * 
 * Key Responsibilities:
 * - Validate price within circuit breaker limits (±20%)
 * - Validate timestamp monotonicity per symbol
 * - Validate volume is positive
 * - Check for required fields
 * - Track validation metrics
 * 
 * Requirements: 4.2, 4.3, 4.4
 */
@Service
public class DataValidator {
    
    private static final Logger log = LoggerFactory.getLogger(DataValidator.class);
    
    // Circuit breaker limits (±20% from previous close)
    private static final BigDecimal CIRCUIT_BREAKER_UPPER_LIMIT = new BigDecimal("1.20");
    private static final BigDecimal CIRCUIT_BREAKER_LOWER_LIMIT = new BigDecimal("0.80");
    
    // Minimum valid price
    private static final BigDecimal MIN_PRICE = new BigDecimal("0.01");
    
    // Maximum reasonable volume (to detect data errors)
    private static final long MAX_REASONABLE_VOLUME = 1_000_000_000L; // 1 billion shares
    
    // Cache for previous close prices per symbol
    private final Map<String, BigDecimal> previousCloseCache = new ConcurrentHashMap<>();
    
    // Cache for last timestamp per symbol (for monotonicity check)
    private final Map<String, Instant> lastTimestampCache = new ConcurrentHashMap<>();
    
    // Validation statistics
    private long totalValidated = 0;
    private long totalInvalid = 0;
    
    /**
     * Validates a stream of TickData.
     * Filters out invalid ticks and logs validation errors.
     * 
     * @param tickFlux Stream of tick data
     * @return Filtered stream of valid tick data
     */
    public Flux<TickData> validate(Flux<TickData> tickFlux) {
        return tickFlux
                .filter(this::validateTickData)
                .doOnNext(tick -> {
                    totalValidated++;
                    log.debug("Validated tick: symbol={}, price={}, volume={}", 
                            tick.getSymbol(), tick.getPrice(), tick.getVolume());
                })
                .doOnError(error -> log.error("Error validating tick data", error));
    }
    
    /**
     * Validates a single TickData instance.
     * 
     * @param tickData Tick data to validate
     * @return true if valid, false otherwise
     */
    public boolean validateTickData(TickData tickData) {
        if (tickData == null) {
            log.warn("Received null tick data for validation");
            totalInvalid++;
            return false;
        }
        
        try {
            // Check completeness
            if (!validateCompleteness(tickData)) {
                log.warn("Incomplete tick data for symbol: {}", tickData.getSymbol());
                totalInvalid++;
                return false;
            }
            
            // Validate price
            if (!validatePrice(tickData.getPrice(), tickData.getSymbol())) {
                log.warn("Invalid price for symbol {}: {}", tickData.getSymbol(), tickData.getPrice());
                totalInvalid++;
                return false;
            }
            
            // Validate volume
            if (!validateVolume(tickData.getVolume())) {
                log.warn("Invalid volume for symbol {}: {}", tickData.getSymbol(), tickData.getVolume());
                totalInvalid++;
                return false;
            }
            
            // Validate timestamp monotonicity
            if (!validateTimestampMonotonicity(tickData.getSymbol(), tickData.getTimestamp())) {
                log.warn("Non-monotonic timestamp for symbol {}: {}", 
                        tickData.getSymbol(), tickData.getTimestamp());
                totalInvalid++;
                return false;
            }
            
            // Validate bid-ask if present
            if (tickData.hasBidAsk() && !validateBidAsk(tickData.getBid(), tickData.getAsk())) {
                log.warn("Invalid bid-ask for symbol {}: bid={}, ask={}", 
                        tickData.getSymbol(), tickData.getBid(), tickData.getAsk());
                totalInvalid++;
                return false;
            }
            
            // Update last timestamp for this symbol
            lastTimestampCache.put(tickData.getSymbol(), tickData.getTimestamp());
            
            return true;
        } catch (Exception e) {
            log.error("Validation error for symbol: {}", tickData.getSymbol(), e);
            totalInvalid++;
            return false;
        }
    }
    
    /**
     * Validates a stream of OhlcvData.
     * Filters out invalid OHLCV records and logs validation errors.
     * 
     * @param ohlcvFlux Stream of OHLCV data
     * @return Filtered stream of valid OHLCV data
     */
    public Flux<OhlcvData> validateOhlcv(Flux<OhlcvData> ohlcvFlux) {
        return ohlcvFlux
                .filter(this::validateOhlcvData)
                .doOnNext(ohlcv -> {
                    totalValidated++;
                    log.debug("Validated OHLCV: symbol={}, close={}, volume={}", 
                            ohlcv.getSymbol(), ohlcv.getClose(), ohlcv.getVolume());
                })
                .doOnError(error -> log.error("Error validating OHLCV data", error));
    }
    
    /**
     * Validates a single OhlcvData instance.
     * 
     * @param ohlcvData OHLCV data to validate
     * @return true if valid, false otherwise
     */
    public boolean validateOhlcvData(OhlcvData ohlcvData) {
        if (ohlcvData == null) {
            log.warn("Received null OHLCV data for validation");
            totalInvalid++;
            return false;
        }
        
        try {
            // Check completeness
            if (!validateOhlcvCompleteness(ohlcvData)) {
                log.warn("Incomplete OHLCV data for symbol: {}", ohlcvData.getSymbol());
                totalInvalid++;
                return false;
            }
            
            // Validate OHLCV structure (high >= low, etc.)
            if (!ohlcvData.isValid()) {
                log.warn("Invalid OHLCV structure for symbol {}: open={}, high={}, low={}, close={}", 
                        ohlcvData.getSymbol(), ohlcvData.getOpen(), ohlcvData.getHigh(), 
                        ohlcvData.getLow(), ohlcvData.getClose());
                totalInvalid++;
                return false;
            }
            
            // Validate prices
            if (!validatePrice(ohlcvData.getOpen(), ohlcvData.getSymbol()) ||
                !validatePrice(ohlcvData.getHigh(), ohlcvData.getSymbol()) ||
                !validatePrice(ohlcvData.getLow(), ohlcvData.getSymbol()) ||
                !validatePrice(ohlcvData.getClose(), ohlcvData.getSymbol())) {
                log.warn("Invalid price in OHLCV for symbol: {}", ohlcvData.getSymbol());
                totalInvalid++;
                return false;
            }
            
            // Validate volume
            if (!validateVolume(ohlcvData.getVolume())) {
                log.warn("Invalid volume for symbol {}: {}", ohlcvData.getSymbol(), ohlcvData.getVolume());
                totalInvalid++;
                return false;
            }
            
            // Validate timestamp monotonicity
            if (!validateTimestampMonotonicity(ohlcvData.getSymbol(), ohlcvData.getTimestamp())) {
                log.warn("Non-monotonic timestamp for symbol {}: {}", 
                        ohlcvData.getSymbol(), ohlcvData.getTimestamp());
                totalInvalid++;
                return false;
            }
            
            // Update last timestamp and close price for this symbol
            lastTimestampCache.put(ohlcvData.getSymbol(), ohlcvData.getTimestamp());
            previousCloseCache.put(ohlcvData.getSymbol(), ohlcvData.getClose());
            
            return true;
        } catch (Exception e) {
            log.error("Validation error for symbol: {}", ohlcvData.getSymbol(), e);
            totalInvalid++;
            return false;
        }
    }
    
    /**
     * Validates price against circuit breaker limits and minimum price.
     * Circuit breaker: ±20% from previous close.
     * 
     * @param price Price to validate
     * @param symbol Trading symbol
     * @return true if valid, false otherwise
     */
    public boolean validatePrice(BigDecimal price, String symbol) {
        if (price == null) {
            return false;
        }
        
        // Check minimum price
        if (price.compareTo(MIN_PRICE) < 0) {
            log.debug("Price below minimum for symbol {}: {}", symbol, price);
            return false;
        }
        
        // Check circuit breaker limits if we have previous close
        BigDecimal previousClose = previousCloseCache.get(symbol);
        if (previousClose != null) {
            BigDecimal upperLimit = previousClose.multiply(CIRCUIT_BREAKER_UPPER_LIMIT);
            BigDecimal lowerLimit = previousClose.multiply(CIRCUIT_BREAKER_LOWER_LIMIT);
            
            if (price.compareTo(upperLimit) > 0 || price.compareTo(lowerLimit) < 0) {
                log.warn("Price outside circuit breaker limits for symbol {}: price={}, previousClose={}, limits=[{}, {}]",
                        symbol, price, previousClose, lowerLimit, upperLimit);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Validates volume is positive and within reasonable limits.
     * 
     * @param volume Volume to validate
     * @return true if valid, false otherwise
     */
    public boolean validateVolume(Long volume) {
        if (volume == null) {
            return false;
        }
        
        // Volume must be non-negative
        if (volume < 0) {
            log.debug("Negative volume: {}", volume);
            return false;
        }
        
        // Check for unreasonably high volume (potential data error)
        if (volume > MAX_REASONABLE_VOLUME) {
            log.warn("Volume exceeds reasonable limit: {}", volume);
            return false;
        }
        
        return true;
    }
    
    /**
     * Validates timestamp monotonicity per symbol.
     * Ensures timestamps are increasing for each symbol.
     * 
     * @param symbol Trading symbol
     * @param timestamp Current timestamp
     * @return true if monotonic, false otherwise
     */
    public boolean validateTimestampMonotonicity(String symbol, Instant timestamp) {
        if (timestamp == null) {
            return false;
        }
        
        Instant lastTimestamp = lastTimestampCache.get(symbol);
        if (lastTimestamp != null) {
            // Current timestamp must be >= last timestamp
            if (timestamp.isBefore(lastTimestamp)) {
                log.debug("Non-monotonic timestamp for symbol {}: current={}, last={}", 
                        symbol, timestamp, lastTimestamp);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Validates bid-ask spread is positive.
     * 
     * @param bid Bid price
     * @param ask Ask price
     * @return true if valid, false otherwise
     */
    public boolean validateBidAsk(BigDecimal bid, BigDecimal ask) {
        if (bid == null || ask == null) {
            return false;
        }
        
        // Ask must be >= bid
        if (ask.compareTo(bid) < 0) {
            log.debug("Invalid bid-ask: bid={}, ask={}", bid, ask);
            return false;
        }
        
        // Check for reasonable spread (not more than 10% of bid)
        BigDecimal spread = ask.subtract(bid);
        BigDecimal maxSpread = bid.multiply(new BigDecimal("0.10"));
        
        if (spread.compareTo(maxSpread) > 0) {
            log.warn("Bid-ask spread too wide: bid={}, ask={}, spread={}", bid, ask, spread);
            return false;
        }
        
        return true;
    }
    
    /**
     * Validates completeness of TickData (all required fields present).
     * 
     * @param tickData Tick data to check
     * @return true if complete, false otherwise
     */
    public boolean validateCompleteness(TickData tickData) {
        return tickData.getSymbol() != null && !tickData.getSymbol().isEmpty()
                && tickData.getTimestamp() != null
                && tickData.getPrice() != null
                && tickData.getVolume() != null;
    }
    
    /**
     * Validates completeness of OhlcvData (all required fields present).
     * 
     * @param ohlcvData OHLCV data to check
     * @return true if complete, false otherwise
     */
    public boolean validateOhlcvCompleteness(OhlcvData ohlcvData) {
        return ohlcvData.getSymbol() != null && !ohlcvData.getSymbol().isEmpty()
                && ohlcvData.getTimestamp() != null
                && ohlcvData.getTimeframe() != null
                && ohlcvData.getOpen() != null
                && ohlcvData.getHigh() != null
                && ohlcvData.getLow() != null
                && ohlcvData.getClose() != null
                && ohlcvData.getVolume() != null;
    }
    
    /**
     * Sets the previous close price for a symbol.
     * Used for circuit breaker validation.
     * 
     * @param symbol Trading symbol
     * @param previousClose Previous close price
     */
    public void setPreviousClose(String symbol, BigDecimal previousClose) {
        if (symbol != null && previousClose != null) {
            previousCloseCache.put(symbol, previousClose);
            log.debug("Set previous close for {}: {}", symbol, previousClose);
        }
    }
    
    /**
     * Gets the previous close price for a symbol.
     * 
     * @param symbol Trading symbol
     * @return Previous close price or null if not available
     */
    public BigDecimal getPreviousClose(String symbol) {
        return previousCloseCache.get(symbol);
    }
    
    /**
     * Clears the previous close cache.
     * Useful for resetting state at start of trading day.
     */
    public void clearPreviousCloseCache() {
        previousCloseCache.clear();
        log.info("Cleared previous close cache");
    }
    
    /**
     * Clears the timestamp cache.
     * Useful for resetting state at start of trading day.
     */
    public void clearTimestampCache() {
        lastTimestampCache.clear();
        log.info("Cleared timestamp cache");
    }
    
    /**
     * Gets validation statistics.
     * 
     * @return Map containing validation metrics
     */
    public Map<String, Long> getValidationStats() {
        return Map.of(
                "totalValidated", totalValidated,
                "totalInvalid", totalInvalid,
                "validationRate", totalValidated + totalInvalid > 0 
                        ? (totalValidated * 100) / (totalValidated + totalInvalid) 
                        : 0L
        );
    }
    
    /**
     * Resets validation statistics.
     */
    public void resetStats() {
        totalValidated = 0;
        totalInvalid = 0;
        log.info("Reset validation statistics");
    }
}
