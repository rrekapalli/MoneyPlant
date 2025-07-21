package com.moneyplant.transaction.entities;

/**
 * Enum representing the status of financial transactions.
 */
public enum TransactionStatus {
    /**
     * Transaction is pending execution
     */
    PENDING,
    
    /**
     * Transaction has been completed successfully
     */
    COMPLETED,
    
    /**
     * Transaction has failed
     */
    FAILED,
    
    /**
     * Transaction has been cancelled
     */
    CANCELLED,
    
    /**
     * Transaction is being processed
     */
    PROCESSING
}