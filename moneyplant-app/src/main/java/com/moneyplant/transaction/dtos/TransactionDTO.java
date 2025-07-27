package com.moneyplant.transaction.dtos;

import com.moneyplant.transaction.entities.TransactionStatus;
import com.moneyplant.transaction.entities.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Transaction entity.
 * Used for transferring transaction data between layers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    /**
     * The unique identifier of the transaction
     */
    private String id;

    /**
     * The user ID associated with this transaction
     */
    private String userId;

    /**
     * The portfolio ID associated with this transaction
     */
    private String portfolioId;

    /**
     * The stock symbol associated with this transaction
     */
    private String stockSymbol;

    /**
     * The type of transaction (BUY, SELL, etc.)
     */
    private TransactionType type;

    /**
     * The quantity of shares involved in the transaction
     */
    private Integer quantity;

    /**
     * The price per share at the time of the transaction
     */
    private BigDecimal pricePerShare;

    /**
     * The total value of the transaction (quantity * pricePerShare)
     */
    private BigDecimal totalValue;

    /**
     * The date and time when the transaction occurred
     */
    private LocalDateTime transactionDate;

    /**
     * Any additional notes or comments about the transaction
     */
    private String notes;

    /**
     * The status of the transaction
     */
    private TransactionStatus status;

    /**
     * When the transaction was created
     */
    private LocalDateTime createdOn;

    /**
     * Who created the transaction
     */
    private String createdBy;

    /**
     * When the transaction was last modified
     */
    private LocalDateTime modifiedOn;

    /**
     * Who last modified the transaction
     */
    private String modifiedBy;
}