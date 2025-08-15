package com.moneyplant.engines.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Market data DTO for cross-module data transfer
 */
public class MarketDataDto {
    
    private String symbol;
    private String exchange;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal close;
    private Long volume;
    private BigDecimal adjustedClose;
    
    private String dataSource;
    private String dataQuality;
    
    // Default constructor
    public MarketDataDto() {}
    
    // Builder constructor
    public MarketDataDto(String symbol, String exchange, LocalDateTime timestamp, 
                        BigDecimal open, BigDecimal high, BigDecimal low, BigDecimal close, 
                        Long volume, BigDecimal adjustedClose, String dataSource, String dataQuality) {
        this.symbol = symbol;
        this.exchange = exchange;
        this.timestamp = timestamp;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume;
        this.adjustedClose = adjustedClose;
        this.dataSource = dataSource;
        this.dataQuality = dataQuality;
    }
    
    // Getters and Setters
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    
    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public BigDecimal getOpen() { return open; }
    public void setOpen(BigDecimal open) { this.open = open; }
    
    public BigDecimal getHigh() { return high; }
    public void setHigh(BigDecimal high) { this.high = high; }
    
    public BigDecimal getLow() { return low; }
    public void setLow(BigDecimal low) { this.low = low; }
    
    public BigDecimal getClose() { return close; }
    public void setClose(BigDecimal close) { this.close = close; }
    
    public Long getVolume() { return volume; }
    public void setVolume(Long volume) { this.volume = volume; }
    
    public BigDecimal getAdjustedClose() { return adjustedClose; }
    public void setAdjustedClose(BigDecimal adjustedClose) { this.adjustedClose = adjustedClose; }
    
    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }
    
    public String getDataQuality() { return dataQuality; }
    public void setDataQuality(String dataQuality) { this.dataQuality = dataQuality; }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String symbol;
        private String exchange;
        private LocalDateTime timestamp;
        private BigDecimal open;
        private BigDecimal high;
        private BigDecimal low;
        private BigDecimal close;
        private Long volume;
        private BigDecimal adjustedClose;
        private String dataSource;
        private String dataQuality;
        
        public Builder symbol(String symbol) { this.symbol = symbol; return this; }
        public Builder exchange(String exchange) { this.exchange = exchange; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public Builder open(BigDecimal open) { this.open = open; return this; }
        public Builder high(BigDecimal high) { this.high = high; return this; }
        public Builder low(BigDecimal low) { this.low = low; return this; }
        public Builder close(BigDecimal close) { this.close = close; return this; }
        public Builder volume(Long volume) { this.volume = volume; return this; }
        public Builder adjustedClose(BigDecimal adjustedClose) { this.adjustedClose = adjustedClose; return this; }
        public Builder dataSource(String dataSource) { this.dataSource = dataSource; return this; }
        public Builder dataQuality(String dataQuality) { this.dataQuality = dataQuality; return this; }
        
        public MarketDataDto build() {
            return new MarketDataDto(symbol, exchange, timestamp, open, high, low, close, 
                                   volume, adjustedClose, dataSource, dataQuality);
        }
    }
}
