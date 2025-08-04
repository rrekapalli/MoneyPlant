package com.moneyplant.transaction.dtos;

import com.moneyplant.transaction.entities.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for creating a new Transaction.
 * Contains validation annotations to ensure data integrity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionDTO {
    /**
     * The user ID associated with this transaction
     */
    @NotBlank(message = "User ID is required")
    @Size(max = 36, message = "User ID cannot exceed 36 characters")
    private String userId;

    /**
     * The portfolio ID associated with this transaction
     */
    @NotBlank(message = "Portfolio ID is required")
    @Size(max = 36, message = "Portfolio ID cannot exceed 36 characters")
    private String portfolioId;

    /**
     * The stock symbol associated with this transaction
     */
    @NotBlank(message = "Stock symbol is required")
    @Size(max = 20, message = "Stock symbol cannot exceed 20 characters")
    private String stockSymbol;

    /**
     * The type of transaction (BUY, SELL, etc.)
     */
    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    /**
     * The quantity of shares involved in the transaction
     */
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    /**
     * The price per share at the time of the transaction
     */
    @NotNull(message = "Price per share is required")
    @DecimalMin(value = "0.01", message = "Price per share must be at least 0.01")
    private BigDecimal pricePerShare;

    /**
     * The date and time when the transaction occurred
     */
    @NotNull(message = "Transaction date is required")
    private LocalDateTime transactionDate;

    /**
     * Any additional notes or comments about the transaction
     */
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
}