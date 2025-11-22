package com.moneyplant.engines.ingestion.kite.client;

import com.moneyplant.engines.ingestion.kite.config.KiteIngestionConfig;
import com.moneyplant.engines.ingestion.kite.exception.KiteApiException;
import com.moneyplant.engines.ingestion.kite.exception.KiteAuthenticationException;
import com.moneyplant.engines.ingestion.kite.exception.KiteRateLimitException;
import com.zerodhatech.kiteconnect.KiteConnect;
import com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException;
import com.zerodhatech.models.HistoricalData;
import com.zerodhatech.models.Instrument;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Component
@Slf4j
public class KiteConnectClient {
    
    private final KiteConnect kiteConnect;
    private final KiteIngestionConfig config;
    
    public KiteConnectClient(KiteIngestionConfig config) {
        this.config = config;
        this.kiteConnect = new KiteConnect(config.getApi().getKey());
        
        if (config.getApi().getAccessToken() != null && !config.getApi().getAccessToken().isEmpty()) {
            this.kiteConnect.setAccessToken(config.getApi().getAccessToken());
            log.info("KiteConnect client initialized with access token");
        } else {
            log.warn("KiteConnect client initialized without access token - authentication required");
        }
    }
    
    @CircuitBreaker(name = "kiteApi", fallbackMethod = "getInstrumentsFallback")
    @RateLimiter(name = "kiteApi")
    @Retry(name = "kiteApi")
    public List<Instrument> getInstruments() {
        log.info("Fetching instruments from Kite API");
        
        try {
            validateAuthentication();
            
            List<Instrument> instruments = kiteConnect.getInstruments();
            log.info("Fetched {} instruments from Kite API", instruments.size());
            return instruments;
            
        } catch (KiteException e) {
            log.error("Failed to fetch instruments from Kite API: {}", e.getMessage(), e);
            
            if (isAuthenticationError(e)) {
                throw new KiteAuthenticationException("Authentication failed: " + e.getMessage(), e);
            } else if (isRateLimitError(e)) {
                throw new KiteRateLimitException("Rate limit exceeded: " + e.getMessage(), 60, e);
            } else {
                throw new KiteApiException("Failed to fetch instruments: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            log.error("Unexpected error while fetching instruments", e);
            throw new KiteApiException("Unexpected error: " + e.getMessage(), e);
        }
    }
    
    @CircuitBreaker(name = "kiteApi", fallbackMethod = "getHistoricalDataFallback")
    @RateLimiter(name = "kiteApi")
    @Retry(name = "kiteApi")
    public HistoricalData getHistoricalData(
        String instrumentToken,
        LocalDate fromDate,
        LocalDate toDate,
        String interval,
        boolean continuous
    ) {
        log.info("Fetching historical data for instrument {} from {} to {} with interval {}", 
            instrumentToken, fromDate, toDate, interval);
        
        try {
            validateAuthentication();
            
            Date from = Date.from(fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
            Date to = Date.from(toDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
            
            HistoricalData data = kiteConnect.getHistoricalData(
                from, to, instrumentToken, interval, continuous, false
            );
            
            int candleCount = data.dataArrayList != null ? data.dataArrayList.size() : 0;
            log.info("Fetched {} candles for instrument {}", candleCount, instrumentToken);
            return data;
            
        } catch (KiteException e) {
            log.error("Failed to fetch historical data for instrument {}: {}", instrumentToken, e.getMessage(), e);
            
            if (isAuthenticationError(e)) {
                throw new KiteAuthenticationException("Authentication failed: " + e.getMessage(), e);
            } else if (isRateLimitError(e)) {
                throw new KiteRateLimitException("Rate limit exceeded: " + e.getMessage(), 60, e);
            } else {
                throw new KiteApiException("Failed to fetch historical data: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            log.error("Unexpected error while fetching historical data for instrument {}", instrumentToken, e);
            throw new KiteApiException("Unexpected error: " + e.getMessage(), e);
        }
    }
    
    private void validateAuthentication() {
        if (kiteConnect.getAccessToken() == null || kiteConnect.getAccessToken().isEmpty()) {
            throw new KiteAuthenticationException("Access token not set. Please configure KITE_ACCESS_TOKEN.");
        }
    }
    
    private boolean isAuthenticationError(KiteException e) {
        return e.code == 403 || e.code == 401 || 
               (e.message != null && e.message.toLowerCase().contains("token"));
    }
    
    private boolean isRateLimitError(KiteException e) {
        return e.code == 429 || 
               (e.message != null && e.message.toLowerCase().contains("rate limit"));
    }
    
    private List<Instrument> getInstrumentsFallback(Exception e) {
        log.error("Circuit breaker activated for getInstruments", e);
        return Collections.emptyList();
    }
    
    private HistoricalData getHistoricalDataFallback(
        String instrumentToken, LocalDate fromDate, LocalDate toDate, 
        String interval, boolean continuous, Exception e
    ) {
        log.error("Circuit breaker activated for getHistoricalData", e);
        return new HistoricalData();
    }
    
    public KiteConnect getKiteConnect() {
        return kiteConnect;
    }
}
