package com.moneyplant.engines.ingestion.processor;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Map;

/**
 * Service for normalizing market data from various providers to standard formats.
 * Handles timezone conversions, symbol name normalization, and format standardization.
 * 
 * Key Responsibilities:
 * - Convert provider-specific formats to TickData/OhlcvData
 * - Handle timezone conversions (IST for NSE, UTC for others)
 * - Normalize symbol names across providers
 * - Add metadata fields
 * 
 * Requirements: 4.1
 */
@Service
public class DataNormalizer {
    
    private static final Logger log = LoggerFactory.getLogger(DataNormalizer.class);
    
    // Timezone constants
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private static final ZoneId UTC_ZONE = ZoneId.of("UTC");
    
    // Symbol suffix mappings for different exchanges
    private static final Map<String, String> EXCHANGE_SUFFIXES = Map.of(
            "NSE", ".NS",
            "BSE", ".BO",
            "NYSE", "",
            "NASDAQ", ""
    );
    
    /**
     * Normalizes a stream of TickData.
     * Applies timezone conversion and symbol normalization.
     * 
     * @param tickFlux Stream of tick data
     * @return Normalized stream of tick data
     */
    public Flux<TickData> normalize(Flux<TickData> tickFlux) {
        return tickFlux
                .map(this::normalizeTickData)
                .doOnNext(tick -> log.debug("Normalized tick: symbol={}, timestamp={}, price={}", 
                        tick.getSymbol(), tick.getTimestamp(), tick.getPrice()))
                .doOnError(error -> log.error("Error normalizing tick data", error));
    }
    
    /**
     * Normalizes a single TickData instance.
     * 
     * @param tickData Raw tick data
     * @return Normalized tick data
     */
    public TickData normalizeTickData(TickData tickData) {
        if (tickData == null) {
            log.warn("Received null tick data for normalization");
            return null;
        }
        
        try {
            // Normalize symbol (remove exchange suffixes for internal storage)
            String normalizedSymbol = normalizeSymbol(tickData.getSymbol());
            
            // Convert timestamp to IST if needed
            Instant normalizedTimestamp = convertToIST(tickData.getTimestamp());
            
            // Build normalized tick data
            return TickData.builder()
                    .symbol(normalizedSymbol)
                    .timestamp(normalizedTimestamp)
                    .price(tickData.getPrice())
                    .volume(tickData.getVolume())
                    .bid(tickData.getBid())
                    .ask(tickData.getAsk())
                    .metadata(tickData.getMetadata())
                    .build();
        } catch (Exception e) {
            log.error("Failed to normalize tick data for symbol: {}", tickData.getSymbol(), e);
            throw new RuntimeException("Normalization failed", e);
        }
    }
    
    /**
     * Normalizes a stream of OhlcvData.
     * Applies timezone conversion and symbol normalization.
     * 
     * @param ohlcvFlux Stream of OHLCV data
     * @return Normalized stream of OHLCV data
     */
    public Flux<OhlcvData> normalizeOhlcv(Flux<OhlcvData> ohlcvFlux) {
        return ohlcvFlux
                .map(this::normalizeOhlcvData)
                .doOnNext(ohlcv -> log.debug("Normalized OHLCV: symbol={}, timestamp={}, close={}", 
                        ohlcv.getSymbol(), ohlcv.getTimestamp(), ohlcv.getClose()))
                .doOnError(error -> log.error("Error normalizing OHLCV data", error));
    }
    
    /**
     * Normalizes a single OhlcvData instance.
     * 
     * @param ohlcvData Raw OHLCV data
     * @return Normalized OHLCV data
     */
    public OhlcvData normalizeOhlcvData(OhlcvData ohlcvData) {
        if (ohlcvData == null) {
            log.warn("Received null OHLCV data for normalization");
            return null;
        }
        
        try {
            // Normalize symbol (remove exchange suffixes for internal storage)
            String normalizedSymbol = normalizeSymbol(ohlcvData.getSymbol());
            
            // Convert timestamp to IST if needed
            Instant normalizedTimestamp = convertToIST(ohlcvData.getTimestamp());
            
            // Build normalized OHLCV data
            return OhlcvData.builder()
                    .symbol(normalizedSymbol)
                    .timestamp(normalizedTimestamp)
                    .timeframe(ohlcvData.getTimeframe())
                    .open(ohlcvData.getOpen())
                    .high(ohlcvData.getHigh())
                    .low(ohlcvData.getLow())
                    .close(ohlcvData.getClose())
                    .volume(ohlcvData.getVolume())
                    .vwap(ohlcvData.getVwap())
                    .tradeCount(ohlcvData.getTradeCount())
                    .build();
        } catch (Exception e) {
            log.error("Failed to normalize OHLCV data for symbol: {}", ohlcvData.getSymbol(), e);
            throw new RuntimeException("Normalization failed", e);
        }
    }
    
    /**
     * Normalizes symbol name by removing exchange-specific suffixes.
     * Examples:
     * - "RELIANCE.NS" -> "RELIANCE"
     * - "TCS.BO" -> "TCS"
     * - "AAPL" -> "AAPL"
     * 
     * @param symbol Raw symbol name
     * @return Normalized symbol name
     */
    public String normalizeSymbol(String symbol) {
        if (symbol == null || symbol.isEmpty()) {
            return symbol;
        }
        
        // Remove common exchange suffixes
        String normalized = symbol;
        for (String suffix : EXCHANGE_SUFFIXES.values()) {
            if (!suffix.isEmpty() && normalized.endsWith(suffix)) {
                normalized = normalized.substring(0, normalized.length() - suffix.length());
                break;
            }
        }
        
        // Convert to uppercase for consistency
        normalized = normalized.toUpperCase().trim();
        
        log.trace("Normalized symbol: {} -> {}", symbol, normalized);
        return normalized;
    }
    
    /**
     * Converts timestamp to IST timezone.
     * NSE market operates in IST, so all timestamps are normalized to IST.
     * 
     * @param timestamp Original timestamp
     * @return Timestamp in IST
     */
    public Instant convertToIST(Instant timestamp) {
        if (timestamp == null) {
            return null;
        }
        
        // Convert to IST and back to Instant
        // This ensures the timestamp represents the same moment in time but is aligned to IST
        ZonedDateTime istTime = timestamp.atZone(IST_ZONE);
        
        log.trace("Converted timestamp to IST: {} -> {}", timestamp, istTime);
        return istTime.toInstant();
    }
    
    /**
     * Converts timestamp from IST to UTC.
     * Useful for storing data in UTC format.
     * 
     * @param istTimestamp Timestamp in IST
     * @return Timestamp in UTC
     */
    public Instant convertToUTC(Instant istTimestamp) {
        if (istTimestamp == null) {
            return null;
        }
        
        // Convert IST to UTC
        ZonedDateTime utcTime = istTimestamp.atZone(IST_ZONE).withZoneSameInstant(UTC_ZONE);
        
        log.trace("Converted timestamp to UTC: {} -> {}", istTimestamp, utcTime);
        return utcTime.toInstant();
    }
    
    /**
     * Adds exchange suffix to symbol based on exchange type.
     * 
     * @param symbol Base symbol name
     * @param exchange Exchange name (NSE, BSE, NYSE, NASDAQ)
     * @return Symbol with exchange suffix
     */
    public String addExchangeSuffix(String symbol, String exchange) {
        if (symbol == null || exchange == null) {
            return symbol;
        }
        
        String suffix = EXCHANGE_SUFFIXES.getOrDefault(exchange.toUpperCase(), "");
        return symbol + suffix;
    }
    
    /**
     * Normalizes price to standard precision (4 decimal places).
     * 
     * @param price Raw price
     * @return Normalized price with 4 decimal places
     */
    public BigDecimal normalizePrice(BigDecimal price) {
        if (price == null) {
            return null;
        }
        
        return price.setScale(4, BigDecimal.ROUND_HALF_UP);
    }
    
    /**
     * Normalizes volume to ensure it's non-negative.
     * 
     * @param volume Raw volume
     * @return Normalized volume (0 if negative)
     */
    public Long normalizeVolume(Long volume) {
        if (volume == null) {
            return 0L;
        }
        
        return Math.max(0L, volume);
    }
    
    /**
     * Creates metadata JSON string from provider-specific data.
     * 
     * @param providerName Provider name (NSE, YAHOO_FINANCE, etc.)
     * @param additionalData Additional metadata as key-value pairs
     * @return JSON metadata string
     */
    public String createMetadata(String providerName, Map<String, Object> additionalData) {
        StringBuilder metadata = new StringBuilder("{");
        metadata.append("\"provider\":\"").append(providerName).append("\"");
        
        if (additionalData != null && !additionalData.isEmpty()) {
            for (Map.Entry<String, Object> entry : additionalData.entrySet()) {
                metadata.append(",\"").append(entry.getKey()).append("\":\"")
                        .append(entry.getValue()).append("\"");
            }
        }
        
        metadata.append("}");
        return metadata.toString();
    }
}
