package com.moneyplant.transactionservice.entities;

import com.moneyplant.moneyplantcore.entities.BaseAuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldNameConstants;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a financial transaction in the system.
 * Extends BaseAuditEntity to inherit auditing capabilities.
 */
@Entity
@Table(name = "transactions")
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class Transaction extends BaseAuditEntity {

    /**
     * The user ID associated with this transaction
     */
    @Column(nullable = false, length = 36)
    private String userId;

    /**
     * The portfolio ID associated with this transaction
     */
    @Column(nullable = false, length = 36)
    private String portfolioId;

    /**
     * The stock symbol associated with this transaction
     */
    @Column(nullable = false, length = 20)
    private String stockSymbol;

    /**
     * The type of transaction (BUY or SELL)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    /**
     * The quantity of shares involved in the transaction
     */
    @Column(nullable = false)
    private Integer quantity;

    /**
     * The price per share at the time of the transaction
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerShare;

    /**
     * The total value of the transaction (quantity * pricePerShare)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalValue;

    /**
     * The date and time when the transaction occurred
     */
    @Column(nullable = false)
    private LocalDateTime transactionDate;

    /**
     * Any additional notes or comments about the transaction
     */
    @Column(length = 500)
    private String notes;

    /**
     * The status of the transaction
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    /**
     * Calculates the total value of the transaction before persisting
     */
    public void calculateTotalValue() {
        if (quantity != null && pricePerShare != null) {
            this.totalValue = pricePerShare.multiply(BigDecimal.valueOf(quantity));
        }
    }
}