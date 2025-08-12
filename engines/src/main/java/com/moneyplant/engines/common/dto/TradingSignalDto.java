package com.moneyplant.engines.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.moneyplant.engines.common.enums.SignalType;
import com.moneyplant.engines.common.enums.SignalStrength;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Trading signal DTO for cross-module data transfer
 */
public class TradingSignalDto {
    
    private String id;
    private String symbol;
    private String strategy;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    private SignalType signalType;
    private SignalStrength strength;
    private BigDecimal price;
    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
    
    private String description;
    private String source;
    private BigDecimal confidence;
    
    // Default constructor
    public TradingSignalDto() {}
    
    // Builder constructor
    public TradingSignalDto(String id, String symbol, String strategy, LocalDateTime timestamp,
                           SignalType signalType, SignalStrength strength, BigDecimal price,
                           BigDecimal stopLoss, BigDecimal takeProfit, String description,
                           String source, BigDecimal confidence) {
        this.id = id;
        this.symbol = symbol;
        this.strategy = strategy;
        this.timestamp = timestamp;
        this.signalType = signalType;
        this.strength = strength;
        this.price = price;
        this.stopLoss = stopLoss;
        this.takeProfit = takeProfit;
        this.description = description;
        this.source = source;
        this.confidence = confidence;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public SignalType getSignalType() { return signalType; }
    public void setSignalType(SignalType signalType) { this.signalType = signalType; }
    
    public SignalStrength getStrength() { return strength; }
    public void setStrength(SignalStrength strength) { this.strength = strength; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public BigDecimal getStopLoss() { return stopLoss; }
    public void setStopLoss(BigDecimal stopLoss) { this.stopLoss = stopLoss; }
    
    public BigDecimal getTakeProfit() { return takeProfit; }
    public void setTakeProfit(BigDecimal takeProfit) { this.takeProfit = takeProfit; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    
    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String id;
        private String symbol;
        private String strategy;
        private LocalDateTime timestamp;
        private SignalType signalType;
        private SignalStrength strength;
        private BigDecimal price;
        private BigDecimal stopLoss;
        private BigDecimal takeProfit;
        private String description;
        private String source;
        private BigDecimal confidence;
        
        public Builder id(String id) { this.id = id; return this; }
        public Builder symbol(String symbol) { this.symbol = symbol; return this; }
        public Builder strategy(String strategy) { this.strategy = strategy; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public Builder signalType(SignalType signalType) { this.signalType = signalType; return this; }
        public Builder strength(SignalStrength strength) { this.strength = strength; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder stopLoss(BigDecimal stopLoss) { this.stopLoss = stopLoss; return this; }
        public Builder confidence(BigDecimal confidence) { this.confidence = confidence; return this; }
        public Builder takeProfit(BigDecimal takeProfit) { this.takeProfit = takeProfit; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder source(String source) { this.source = source; return this; }
        
        public TradingSignalDto build() {
            return new TradingSignalDto(id, symbol, strategy, timestamp, signalType, strength,
                                     price, stopLoss, takeProfit, description, source, confidence);
        }
    }
}
