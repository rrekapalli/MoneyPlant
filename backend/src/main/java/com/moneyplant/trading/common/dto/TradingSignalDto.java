package com.moneyplant.trading.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.moneyplant.trading.common.enums.SignalType;
import com.moneyplant.trading.common.enums.StrategyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradingSignalDto {
    private String id;
    private String symbol;
    private SignalType signalType;
    private StrategyType strategyType;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    private BigDecimal price;
    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
    private BigDecimal confidence;
    private String description;
}
