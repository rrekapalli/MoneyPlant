package com.moneyplant.engines.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Backtest result DTO for cross-module data transfer
 */
public class BacktestResultDto {
    
    private String id;
    private String strategyName;
    private String symbol;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endDate;
    
    private BigDecimal initialCapital;
    private BigDecimal finalCapital;
    private BigDecimal totalReturn;
    private BigDecimal annualizedReturn;
    private BigDecimal maxDrawdown;
    private BigDecimal sharpeRatio;
    private BigDecimal winRate;
    
    private Integer totalTrades;
    private Integer winningTrades;
    private Integer losingTrades;
    
    private List<TradeDto> trades;
    
    // Default constructor
    public BacktestResultDto() {}
    
    // Builder constructor
    public BacktestResultDto(String id, String strategyName, String symbol, LocalDateTime startDate,
                           LocalDateTime endDate, BigDecimal initialCapital, BigDecimal finalCapital,
                           BigDecimal totalReturn, BigDecimal annualizedReturn, BigDecimal maxDrawdown,
                           BigDecimal sharpeRatio, BigDecimal winRate, Integer totalTrades,
                           Integer winningTrades, Integer losingTrades, List<TradeDto> trades) {
        this.id = id;
        this.strategyName = strategyName;
        this.symbol = symbol;
        this.startDate = startDate;
        this.endDate = endDate;
        this.initialCapital = initialCapital;
        this.finalCapital = finalCapital;
        this.totalReturn = totalReturn;
        this.annualizedReturn = annualizedReturn;
        this.maxDrawdown = maxDrawdown;
        this.sharpeRatio = sharpeRatio;
        this.winRate = winRate;
        this.totalTrades = totalTrades;
        this.winningTrades = winningTrades;
        this.losingTrades = losingTrades;
        this.trades = trades;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getStrategyName() { return strategyName; }
    public void setStrategyName(String strategyName) { this.strategyName = strategyName; }
    
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public BigDecimal getInitialCapital() { return initialCapital; }
    public void setInitialCapital(BigDecimal initialCapital) { this.initialCapital = initialCapital; }
    
    public BigDecimal getFinalCapital() { return finalCapital; }
    public void setFinalCapital(BigDecimal finalCapital) { this.finalCapital = finalCapital; }
    
    public BigDecimal getTotalReturn() { return totalReturn; }
    public void setTotalReturn(BigDecimal totalReturn) { this.totalReturn = totalReturn; }
    
    public BigDecimal getAnnualizedReturn() { return annualizedReturn; }
    public void setAnnualizedReturn(BigDecimal annualizedReturn) { this.annualizedReturn = annualizedReturn; }
    
    public BigDecimal getMaxDrawdown() { return maxDrawdown; }
    public void setMaxDrawdown(BigDecimal maxDrawdown) { this.maxDrawdown = maxDrawdown; }
    
    public BigDecimal getSharpeRatio() { return sharpeRatio; }
    public void setSharpeRatio(BigDecimal sharpeRatio) { this.sharpeRatio = sharpeRatio; }
    
    public BigDecimal getWinRate() { return winRate; }
    public void setWinRate(BigDecimal winRate) { this.winRate = winRate; }
    
    public Integer getTotalTrades() { return totalTrades; }
    public void setTotalTrades(Integer totalTrades) { this.totalTrades = totalTrades; }
    
    public Integer getWinningTrades() { return winningTrades; }
    public void setWinningTrades(Integer winningTrades) { this.winningTrades = winningTrades; }
    
    public Integer getLosingTrades() { return losingTrades; }
    public void setLosingTrades(Integer losingTrades) { this.losingTrades = losingTrades; }
    
    public List<TradeDto> getTrades() { return trades; }
    public void setTrades(List<TradeDto> trades) { this.trades = trades; }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String id;
        private String strategyName;
        private String symbol;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private BigDecimal initialCapital;
        private BigDecimal finalCapital;
        private BigDecimal totalReturn;
        private BigDecimal annualizedReturn;
        private BigDecimal maxDrawdown;
        private BigDecimal sharpeRatio;
        private BigDecimal winRate;
        private Integer totalTrades;
        private Integer winningTrades;
        private Integer losingTrades;
        private List<TradeDto> trades;
        
        public Builder id(String id) { this.id = id; return this; }
        public Builder strategyName(String strategyName) { this.strategyName = strategyName; return this; }
        public Builder symbol(String symbol) { this.symbol = symbol; return this; }
        public Builder startDate(LocalDateTime startDate) { this.startDate = startDate; return this; }
        public Builder endDate(LocalDateTime endDate) { this.endDate = endDate; return this; }
        public Builder initialCapital(BigDecimal initialCapital) { this.initialCapital = initialCapital; return this; }
        public Builder finalCapital(BigDecimal finalCapital) { this.finalCapital = finalCapital; return this; }
        public Builder totalReturn(BigDecimal totalReturn) { this.totalReturn = totalReturn; return this; }
        public Builder annualizedReturn(BigDecimal annualizedReturn) { this.annualizedReturn = annualizedReturn; return this; }
        public Builder maxDrawdown(BigDecimal maxDrawdown) { this.maxDrawdown = maxDrawdown; return this; }
        public Builder sharpeRatio(BigDecimal sharpeRatio) { this.sharpeRatio = sharpeRatio; return this; }
        public Builder winRate(BigDecimal winRate) { this.winRate = winRate; return this; }
        public Builder totalTrades(Integer totalTrades) { this.totalTrades = totalTrades; return this; }
        public Builder winningTrades(Integer winningTrades) { this.winningTrades = winningTrades; return this; }
        public Builder losingTrades(Integer losingTrades) { this.losingTrades = losingTrades; return this; }
        public Builder trades(List<TradeDto> trades) { this.trades = trades; return this; }
        
        public BacktestResultDto build() {
            return new BacktestResultDto(id, strategyName, symbol, startDate, endDate, initialCapital,
                                      finalCapital, totalReturn, annualizedReturn, maxDrawdown,
                                      sharpeRatio, winRate, totalTrades, winningTrades, losingTrades, trades);
        }
    }
    
    public static class TradeDto {
        private String id;
        private String symbol;
        private String action; // BUY, SELL
        private BigDecimal price;
        private Integer quantity;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime timestamp;
        
        private BigDecimal pnl;
        
        // Default constructor
        public TradeDto() {}
        
        // Builder constructor
        public TradeDto(String id, String symbol, String action, BigDecimal price, Integer quantity,
                       LocalDateTime timestamp, BigDecimal pnl) {
            this.id = id;
            this.symbol = symbol;
            this.action = action;
            this.price = price;
            this.quantity = quantity;
            this.timestamp = timestamp;
            this.pnl = pnl;
        }
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public BigDecimal getPnl() { return pnl; }
        public void setPnl(BigDecimal pnl) { this.pnl = pnl; }
        
        // Builder pattern
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private String id;
            private String symbol;
            private String action;
            private BigDecimal price;
            private Integer quantity;
            private LocalDateTime timestamp;
            private BigDecimal pnl;
            
            public Builder id(String id) { this.id = id; return this; }
            public Builder symbol(String symbol) { this.symbol = symbol; return this; }
            public Builder action(String action) { this.action = action; return this; }
            public Builder price(BigDecimal price) { this.price = price; return this; }
            public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }
            public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
            public Builder pnl(BigDecimal pnl) { this.pnl = pnl; return this; }
            
            public TradeDto build() {
                return new TradeDto(id, symbol, action, price, quantity, timestamp, pnl);
            }
        }
    }
}
